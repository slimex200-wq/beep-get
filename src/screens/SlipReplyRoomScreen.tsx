import React, { useEffect, useMemo, useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { colors, radius, spacing } from "@/design/tokens";
import { type } from "@/design/typography";
import { useAppPalette } from "@/design/appTheme";
import { getMockupFriendPhotoUri, mockupBlinkFrameUris } from "@/design/mockupPhotos";
import { ActionButton } from "@/components/ActionButton";
import { AppSurface } from "@/components/AppSurface";
import {
  IconButton,
  MockupCard,
  MockupSection,
  StatusPill,
} from "@/components/KotlinMockupUI";
import { SendPlaneIcon, XLineIcon } from "@/components/MockupLineIcons";
import { SignalCode } from "@/components/SignalCode";
import { SignalSlotRail } from "@/components/SignalSlotRail";
import type { RootStackParamList } from "@/navigation/RootNavigator";
import { useAuthStore } from "@/stores/authStore";
import { useDictionaryStore } from "@/stores/dictionaryStore";
import { useMessageStore } from "@/stores/messageStore";
import { messageToSlipSignal } from "@/lib/slipUiModels";
import {
  DEFAULT_QUICK_REPLY_SLOTS,
  buildQuickReplySlots,
  isQuickReplySlotEntry,
} from "@/lib/quickReplySlots";
import { getMessageById, type LegacyMessage } from "@/services/messageService";

type Props = NativeStackScreenProps<RootStackParamList, "ReplyRoom">;

const FRAME_TIMES = ["0.0s", "0.7s", "1.3s"];
const FALLBACK_MEANINGS: Record<string, string> = {
  "8282": "빨리 와줘",
  "486": "보고 싶어",
  "1004": "집 도착",
  "7942": "친구사이",
  "0404": "영원히 사랑해",
};

export function ReplyRoomScreen({ route, navigation }: Props) {
  const { signalId } = route.params;
  const { profile } = useAuthStore();
  const { entries, fetch: fetchDictionary } = useDictionaryStore();
  const { received, saved, fetchReceived, fetchSaved, quickReply, read, save } = useMessageStore();
  const palette = useAppPalette();
  const [fetchedMessage, setFetchedMessage] = useState<LegacyMessage | null>(null);
  const [doneFeedback, setDoneFeedback] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState(false);
  const [quickReplyFeedback, setQuickReplyFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    fetchReceived(profile.id).catch(reportError);
    fetchSaved(profile.id).catch(reportError);
    fetchDictionary(profile.id).catch(reportError);
  }, [profile?.id, fetchDictionary, fetchReceived, fetchSaved]);

  const message = useMemo(
    () =>
      received.find((item) => item.id === signalId) ??
      saved.find((item) => item.id === signalId) ??
      (fetchedMessage?.id === signalId ? fetchedMessage : null),
    [received, saved, fetchedMessage, signalId]
  );
  const signal = useMemo(() => (message ? messageToSlipSignal(message) : null), [message]);
  const quickReplySlots = useMemo(
    () => buildQuickReplySlots(entries, DEFAULT_QUICK_REPLY_SLOTS),
    [entries],
  );

  const returnToToday = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate("Main", { screen: "Today" });
  };

  useEffect(() => {
    if (!profile || message) return;
    getMessageById(signalId)
      .then(setFetchedMessage)
      .catch(reportError);
  }, [profile?.id, message, signalId]);

  useEffect(() => {
    setDoneFeedback(false);
    setSaveFeedback(false);
    setQuickReplyFeedback(null);
  }, [signalId]);

  const flashQuickReply = (slot: string) => {
    setQuickReplyFeedback(slot);
    setTimeout(() => setQuickReplyFeedback(null), 1200);
  };

  const handleDone = async () => {
    if (!message) return;
    setDoneFeedback(true);
    try {
      await read(message.id);
      returnToToday();
    } catch (err) {
      reportError(err);
    }
  };

  const handleSave = async () => {
    if (!message || message.is_saved) return;
    try {
      await save(message.id);
      setSaveFeedback(true);
      setTimeout(() => setSaveFeedback(false), 1200);
    } catch (err) {
      reportError(err);
    }
  };

  const handleReply = async (slot: string) => {
    if (!message) return;
    flashQuickReply(slot);

    if (slot === "Done") {
      await handleDone();
      return;
    }

    try {
      await quickReply(message.id, slot);
      Alert.alert("Reply sent", `${slot} Beep sent back.`);
    } catch (err: any) {
      Alert.alert("Reply failed", err?.message ?? "Try again.");
    }
  };

  const handleBlinkBack = () => {
    if (!message || !signal) return;
    navigation.navigate("Send", {
      friendId: message.from_user,
      friendName: signal.sender,
      mode: "blink",
    });
  };

  if (!message || !signal) {
    return (
      <AppSurface backgroundColor="#F8F6F1">
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.contextRow}>
            <View>
              <Text style={[styles.contextLabel, { color: palette.muted }]}>Today</Text>
              <Text style={[styles.contextTitle, { color: palette.text }]}>Signal</Text>
            </View>
            <IconButton
              label="Close"
              icon={<XLineIcon />}
              accessibilityLabel="Close signal detail"
              onPress={returnToToday}
            />
          </View>
          <MockupCard style={styles.emptyCard}>
            <Text style={[styles.emptyTitle, { color: palette.text }]}>NO SIGNAL</Text>
            <Text style={[styles.emptyCopy, { color: palette.muted }]}>
              This widget signal is no longer available.
            </Text>
            <ActionButton label="Back to Today" variant="dark" onPress={returnToToday} />
          </MockupCard>
        </ScrollView>
      </AppSurface>
    );
  }

  const meaning =
    entries.find((entry) => !isQuickReplySlotEntry(entry) && entry.code === signal.code)?.meaning ??
    signal.note ??
    FALLBACK_MEANINGS[signal.code] ??
    "signal";
  const senderAvatarUri = getMockupFriendPhotoUri(signal.sender, 0);
  const statusLabel = message.is_saved ? "Saved" : message.is_read ? "Read" : "Private";
  const statusTone: "muted" | "red" | "green" = message.is_saved
    ? "green"
    : message.is_read
      ? "muted"
      : "red";
  const isSaved = message.is_saved || saveFeedback;

  return (
    <AppSurface backgroundColor="#F8F6F1">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.contextRow}>
          <View>
            <Text style={[styles.contextLabel, { color: palette.muted }]}>Today</Text>
            <Text style={[styles.contextTitle, { color: palette.text }]}>NO. {signal.code}</Text>
          </View>
          <IconButton
            label="Close"
            icon={<XLineIcon />}
            accessibilityLabel="Close signal detail"
            onPress={returnToToday}
          />
        </View>

        <MockupCard style={styles.expandedCard}>
          <View style={styles.latestTopRow}>
            <View style={styles.senderRow}>
              <View
                style={[
                  styles.senderAvatar,
                  { backgroundColor: palette.chip, borderColor: palette.rule },
                ]}
              >
                <Image source={{ uri: senderAvatarUri }} style={styles.senderAvatarImage} resizeMode="cover" />
              </View>
              <View>
                <Text style={[styles.senderName, { color: palette.text }]}>{signal.sender}</Text>
                <Text style={[styles.senderTime, { color: palette.muted }]}>{signal.time}</Text>
              </View>
            </View>
            <StatusPill label={statusLabel} tone={statusTone} />
          </View>

          <View style={[styles.rule, { backgroundColor: palette.rule }]} />

          <View style={styles.codeBlock}>
            <SignalCode code={signal.code} style={styles.detailCode} />
            <Text style={[styles.meaning, { color: palette.text }]}>{meaning}</Text>
          </View>

          {signal.hasBlink ? (
            <DetailBlinkPreview
              playbackUri={message.media?.playbackUri}
              frameUris={message.media?.stripFrameUris}
              sender={signal.sender}
            />
          ) : (
            <View style={[styles.beepOnlyPanel, { backgroundColor: palette.cardSoft, borderColor: palette.rule }]}>
              <Text style={[styles.beepOnlyText, { color: palette.muted }]}>CODE-ONLY BEEP</Text>
            </View>
          )}

          <View style={styles.cardActions}>
            <ActionButton
              label="Done"
              variant={doneFeedback ? "success" : "dark"}
              flex
              onPress={handleDone}
            />
            <ActionButton
              label={isSaved ? "Saved" : "Save"}
              variant={isSaved ? "success" : "light"}
              flex
              onPress={isSaved ? undefined : handleSave}
            />
          </View>
        </MockupCard>

        <MockupSection label="Quick Reply" />
        <SignalSlotRail
          slots={quickReplySlots}
          confirmedSlot={quickReplyFeedback}
          onSelect={handleReply}
        />

        <ActionButton
          label="Blink Back"
          variant="light"
          icon={(iconColor) => <SendPlaneIcon color={iconColor} />}
          iconPosition="right"
          animateIconOnPress
          onPress={handleBlinkBack}
        />
      </ScrollView>
    </AppSurface>
  );
}

function DetailBlinkPreview({
  playbackUri,
  frameUris,
  sender,
}: {
  playbackUri?: string | number | null;
  frameUris?: string[] | null;
  sender: string;
}) {
  const palette = useAppPalette();
  const player = useVideoPlayer(playbackUri ?? null, (p) => {
    p.loop = true;
    p.muted = true;
    if (playbackUri) p.play();
  });

  if (playbackUri) {
    return (
      <View
        style={[
          styles.inlineVideoShell,
          { backgroundColor: palette.primary, borderColor: palette.ruleStrong },
        ]}
      >
        <VideoView
          player={player}
          style={styles.inlineVideo}
          nativeControls={false}
          contentFit="cover"
          allowsFullscreen={false}
          surfaceType="textureView"
        />
        <View style={styles.videoBadge}>
          <Text numberOfLines={1} style={styles.videoBadgeText}>{sender}</Text>
          <Text style={styles.videoBadgeTime}>2.0s</Text>
        </View>
      </View>
    );
  }

  return <DetailFrameStrip frameUris={frameUris} />;
}

function DetailFrameStrip({ frameUris }: { frameUris?: string[] | null }) {
  const palette = useAppPalette();
  const frames = (frameUris?.length ? frameUris : mockupBlinkFrameUris).slice(0, 3);

  return (
    <View style={styles.detailFrameStrip}>
      {frames.map((uri, index) => (
        <View
          key={`${uri}-${index}`}
          style={[styles.detailFrame, { backgroundColor: palette.input, borderColor: palette.rule }]}
        >
          <Image source={{ uri }} style={styles.detailFrameImage} resizeMode="cover" />
          <View style={styles.frameTimeBadge}>
            <Text style={styles.frameTimeText}>{FRAME_TIMES[index] ?? "2.0s"}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function reportError(err: unknown) {
  const message = err instanceof Error ? err.message : "Unexpected error";
  Alert.alert("BEEP-GET", message);
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing[5],
    paddingBottom: 96,
    gap: spacing[4],
  },
  contextRow: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing[4],
    paddingTop: spacing[2],
  },
  contextLabel: {
    ...type.tinyMono,
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  contextTitle: {
    ...type.screenTitle,
    letterSpacing: 0,
  },
  expandedCard: {
    minHeight: 430,
    gap: spacing[4],
    padding: spacing[5],
    borderRadius: 17,
  },
  latestTopRow: {
    minHeight: 38,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing[4],
  },
  senderRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
  },
  senderAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.redSoft,
    borderWidth: 1,
    overflow: "hidden",
  },
  senderAvatarImage: {
    width: "100%",
    height: "100%",
  },
  senderName: {
    ...type.metaValue,
    fontSize: 11,
    letterSpacing: 0,
  },
  senderTime: {
    ...type.tinyMono,
    letterSpacing: 0,
  },
  rule: {
    height: 1,
  },
  codeBlock: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: spacing[3],
    paddingBottom: spacing[2],
  },
  detailCode: {
    fontSize: 64,
    lineHeight: 70,
    letterSpacing: 0,
  },
  meaning: {
    ...type.metaValue,
    marginTop: spacing[2],
    fontSize: 12,
    letterSpacing: 0,
  },
  inlineVideoShell: {
    height: 188,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.ruleStrong,
    borderRadius: 12,
    backgroundColor: colors.ink,
  },
  inlineVideo: {
    width: "100%",
    height: "100%",
  },
  videoBadge: {
    position: "absolute",
    left: spacing[3],
    right: spacing[3],
    bottom: spacing[3],
    minHeight: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing[3],
    paddingHorizontal: spacing[3],
    borderRadius: radius.pill,
    backgroundColor: "rgba(0,0,0,0.54)",
  },
  videoBadgeText: {
    ...type.metaValue,
    flex: 1,
    color: colors.white,
    letterSpacing: 0,
  },
  videoBadgeTime: {
    ...type.tinyMono,
    color: colors.white,
    letterSpacing: 0,
  },
  detailFrameStrip: {
    flexDirection: "row",
    gap: spacing[3],
  },
  detailFrame: {
    flex: 1,
    aspectRatio: 0.94,
    overflow: "hidden",
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: colors.paperDeep,
  },
  detailFrameImage: {
    width: "100%",
    height: "100%",
  },
  frameTimeBadge: {
    position: "absolute",
    left: spacing[2],
    bottom: spacing[2],
    minHeight: 18,
    justifyContent: "center",
    paddingHorizontal: spacing[2],
    borderRadius: radius.pill,
    backgroundColor: "rgba(0,0,0,0.58)",
  },
  frameTimeText: {
    ...type.tinyMono,
    color: colors.white,
    letterSpacing: 0,
  },
  beepOnlyPanel: {
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: radius.control,
  },
  beepOnlyText: {
    ...type.tinyMono,
    letterSpacing: 0,
  },
  cardActions: {
    flexDirection: "row",
    gap: spacing[3],
  },
  emptyCard: {
    minHeight: 180,
    justifyContent: "center",
    gap: spacing[3],
    padding: spacing[5],
  },
  emptyTitle: {
    ...type.metaValue,
    fontSize: 12,
    letterSpacing: 0,
  },
  emptyCopy: {
    ...type.bodyMuted,
    letterSpacing: 0,
  },
});
