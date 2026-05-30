import React, { useEffect, useMemo, useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { colors, radius, spacing } from "@/design/tokens";
import { type } from "@/design/typography";
import { useAppPalette } from "@/design/appTheme";
import { getMockupFriendPhotoUri, mockupBlinkFrameUris } from "@/design/mockupPhotos";
import { ActionButton } from "@/components/ActionButton";
import { AppSurface } from "@/components/AppSurface";
import {
  KotlinHeader,
  MockupCard,
  MockupSection,
  StatusPill,
} from "@/components/KotlinMockupUI";
import { SignalCode } from "@/components/SignalCode";
import { SignalSlotRail } from "@/components/SignalSlotRail";
import { StatusDot } from "@/components/StatusDot";
import {
  FriendsGroupIcon,
  GearLineIcon,
  RefreshLineIcon,
} from "@/components/MockupLineIcons";
import type { RootStackParamList } from "@/navigation/RootNavigator";
import { useAuthStore } from "@/stores/authStore";
import { useDictionaryStore } from "@/stores/dictionaryStore";
import { useFriendStore } from "@/stores/friendStore";
import { useMessageStore } from "@/stores/messageStore";
import { messageToSlipSignal } from "@/lib/slipUiModels";
import {
  DEFAULT_QUICK_REPLY_SLOTS,
  buildQuickReplySlots,
  isQuickReplySlotEntry,
} from "@/lib/quickReplySlots";

const FALLBACK_MEANINGS: Record<string, string> = {
  "8282": "빨리 와줘",
  "486": "보고 싶어",
  "1004": "집 도착",
  "7942": "친구사이",
  "0404": "영원히 사랑해",
};

export function TodayScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const palette = useAppPalette();
  const { profile } = useAuthStore();
  const { entries, fetch: fetchDictionary } = useDictionaryStore();
  const { friends, fetch: fetchFriends } = useFriendStore();
  const {
    received,
    loading,
    fetchReceived,
    quickReply,
    read,
    subscribeRealtime,
    unsubscribeRealtime,
  } = useMessageStore();
  const [doneFeedback, setDoneFeedback] = useState(false);
  const [quickReplyFeedback, setQuickReplyFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    fetchFriends(profile.id).catch(reportError);
    fetchDictionary(profile.id).catch(reportError);
  }, [profile?.id, fetchFriends, fetchDictionary]);

  useEffect(() => {
    if (!profile) return;
    fetchReceived(profile.id, friends).catch(reportError);
  }, [profile?.id, friends.length, fetchReceived]);

  useEffect(() => {
    if (!profile) return;
    subscribeRealtime(profile.id);
    return () => unsubscribeRealtime();
  }, [profile?.id, subscribeRealtime, unsubscribeRealtime]);

  const latestMessage = received[0];
  const latestSignal = useMemo(
    () => (latestMessage ? messageToSlipSignal(latestMessage, { index: 0 }) : null),
    [latestMessage]
  );
  const signalQueue = useMemo(
    () =>
      received
        .slice(0, 3)
        .map((message, index) => messageToSlipSignal(message, { index })),
    [received]
  );

  const quickReplySlots = useMemo(() => {
    return buildQuickReplySlots(entries, DEFAULT_QUICK_REPLY_SLOTS);
  }, [entries]);
  const latestMeaning = latestSignal
    ? entries.find((entry) => !isQuickReplySlotEntry(entry) && entry.code === latestSignal.code)?.meaning ??
      latestSignal.note ??
      FALLBACK_MEANINGS[latestSignal.code] ??
      "빨리 와줘"
    : null;

  const refresh = () => {
    if (!profile) return;
    fetchReceived(profile.id, friends).catch(reportError);
  };

  const flashQuickReply = (slot: string) => {
    setQuickReplyFeedback(slot);
    setTimeout(() => setQuickReplyFeedback(null), 1200);
  };

  const handleDone = async () => {
    if (!latestMessage) return;
    setDoneFeedback(true);
    setTimeout(() => setDoneFeedback(false), 1200);
    await read(latestMessage.id).catch(reportError);
  };

  const handleQuickReply = async (slot: string) => {
    if (!latestMessage) return;
    flashQuickReply(slot);

    if (slot === "Done") {
      await read(latestMessage.id).catch(reportError);
      return;
    }

    if (slot === "View") {
      navigation.navigate("ReplyRoom", { signalId: latestMessage.id });
      return;
    }

    try {
      await quickReply(latestMessage.id, slot);
      Alert.alert("Reply sent", `${slot} Beep sent back.`);
    } catch (err: any) {
      Alert.alert("Reply failed", err?.message ?? "Try again.");
    }
  };

  return (
    <AppSurface backgroundColor="#F8F6F1">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <KotlinHeader
          title="Today"
          showAvatar={false}
          actions={[
            {
              label: loading ? "Syncing" : "Refresh",
              icon: <RefreshLineIcon />,
              accessibilityLabel: "Refresh Today",
              onPress: refresh,
            },
            {
              label: "Friends",
              icon: <FriendsGroupIcon />,
              accessibilityLabel: "Open Friends",
              onPress: () => navigation.navigate("Main", { screen: "People" }),
            },
            {
              label: "Settings",
              icon: <GearLineIcon />,
              accessibilityLabel: "Account settings",
              onPress: () => navigation.navigate("Account"),
            },
          ]}
        />
        {latestSignal ? (
          <View style={styles.latestStack}>
            <MockupCard style={styles.latestCard}>
              <View style={styles.latestTopRow}>
                <View style={styles.senderRow}>
                  <View style={styles.senderAvatar}>
                    <Image
                      source={{ uri: getMockupFriendPhotoUri(latestSignal.sender, 0) }}
                      style={styles.senderAvatarImage}
                      resizeMode="cover"
                    />
                  </View>
                  <View>
                    <Text style={[styles.senderName, { color: palette.text }]}>{latestSignal.sender}</Text>
                    <Text style={[styles.senderTime, { color: palette.muted }]}>{latestSignal.time}</Text>
                  </View>
                </View>
                <StatusPill label="Private" tone="red" />
              </View>
              <View style={styles.codeBlock}>
                <SignalCode code={latestSignal.code} style={styles.todayCode} />
                <Text style={[styles.meaningText, { color: palette.text }]}>{latestMeaning}</Text>
              </View>
              {latestSignal.hasBlink ? (
                <TodayFrameStrip frameUris={latestMessage.media?.stripFrameUris} />
              ) : null}
              <View style={styles.latestActions}>
                <ActionButton
                  label="View"
                  variant="dark"
                  flex
                  onPress={() => navigation.navigate("ReplyRoom", { signalId: latestMessage.id })}
                />
                <ActionButton
                  label="Done"
                  variant={doneFeedback ? "success" : "light"}
                  flex
                  onPress={handleDone}
                />
              </View>
            </MockupCard>
          </View>
        ) : (
          <MockupCard style={styles.empty}>
            <Text style={type.metaValue}>WAITING FOR SIGNAL</Text>
            <Text style={type.bodyMuted}>New Beeps and Blinks land here first.</Text>
            <ActionButton
              label={friends.length > 0 ? "SEND FIRST BEEP" : "ADD FRIEND"}
              variant="dark"
              onPress={() =>
                navigation.navigate("Main", { screen: friends.length > 0 ? "Compose" : "People" })
              }
            />
          </MockupCard>
        )}

        <MockupSection label="Quick Reply" />
        <SignalSlotRail
          slots={quickReplySlots}
          disabled={!latestMessage}
          confirmedSlot={quickReplyFeedback}
          onSelect={handleQuickReply}
        />

        <Text style={[styles.queueTitle, { color: palette.muted }]}>Queue</Text>
        <View style={styles.queue}>
          {signalQueue.length > 0 ? (
            <View style={[styles.queueCard, { backgroundColor: palette.card, borderColor: palette.rule }]}>
              {signalQueue.map((item, index) => {
                const meaning =
                  entries.find((entry) => !isQuickReplySlotEntry(entry) && entry.code === item.code)?.meaning ??
                  item.note ??
                  FALLBACK_MEANINGS[item.code] ??
                  "signal";

                return (
                  <View
                    key={item.id}
                    style={[
                      styles.queueRow,
                      index > 0 && styles.queueRowDivider,
                      { borderTopColor: palette.rule },
                    ]}
                  >
                    <StatusDot
                      size={9}
                      color={index === 0 ? colors.red : index === 1 ? "#FF850B" : colors.greenDot}
                    />
                    <View style={styles.queueCopy}>
                      <Text numberOfLines={1} style={[styles.queueCode, { color: palette.text }]}>
                        {item.code}
                        <Text style={[styles.queueMeaning, { color: palette.muted }]}> ({meaning})</Text>
                      </Text>
                    </View>
                    <Text style={[styles.queueTime, { color: palette.muted }]}>{item.time}</Text>
                  </View>
                );
              })}
              </View>
          ) : (
            <MockupCard soft style={styles.softPanel}>
              <Text style={type.bodyMuted}>No more signals queued.</Text>
            </MockupCard>
          )}
        </View>
      </ScrollView>
    </AppSurface>
  );
}

function TodayFrameStrip({ frameUris }: { frameUris?: string[] | null }) {
  const frames = (frameUris?.length ? frameUris : mockupBlinkFrameUris).slice(0, 3);
  return (
    <View style={styles.todayFrameStrip}>
      {frames.map((uri, index) => (
        <View key={`${uri}-${index}`} style={styles.todayFrame}>
          <Image source={{ uri }} style={styles.todayFrameImage} resizeMode="cover" />
        </View>
      ))}
    </View>
  );
}


function reportError(err: unknown) {
  const message =
    err instanceof Error
      ? err.message
      : err && typeof err === "object" && "message" in err
        ? String((err as { message?: unknown }).message)
        : "Unexpected error";
  Alert.alert("BEEP-GET", message);
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing[5],
    paddingBottom: 96,
    gap: spacing[4],
  },
  queue: {
    gap: 0,
  },
  queueTitle: {
    ...type.metaValue,
    fontSize: 11,
    lineHeight: 15,
    color: colors.muted,
  },
  queueCard: {
    overflow: "hidden",
    borderWidth: 1,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
  },
  latestStack: {
    gap: spacing[3],
  },
  latestCard: {
    minHeight: 374,
    padding: spacing[5],
    gap: spacing[4],
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
    overflow: "hidden",
  },
  senderAvatarImage: {
    width: "100%",
    height: "100%",
  },
  senderName: {
    ...type.metaValue,
    fontSize: 11,
  },
  senderTime: {
    ...type.tinyMono,
    color: colors.muted,
  },
  codeBlock: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: spacing[4],
    paddingBottom: spacing[3],
  },
  todayCode: {
    fontSize: 64,
    lineHeight: 70,
    letterSpacing: 0,
  },
  meaningText: {
    ...type.metaValue,
    fontSize: 12,
    marginTop: spacing[2],
  },
  latestActions: {
    flexDirection: "row",
    gap: spacing[3],
  },
  todayFrameStrip: {
    flexDirection: "row",
    gap: spacing[3],
  },
  todayFrame: {
    flex: 1,
    aspectRatio: 0.94,
    overflow: "hidden",
    borderRadius: 12,
    backgroundColor: colors.paperDeep,
  },
  todayFrameImage: {
    width: "100%",
    height: "100%",
  },
  queueRow: {
    minHeight: 49,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
    paddingHorizontal: spacing[5],
  },
  queueRowDivider: {
    borderTopWidth: 1,
  },
  queueCopy: {
    flex: 1,
  },
  queueCode: {
    ...type.codeSmall,
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: 0,
  },
  queueMeaning: {
    ...type.bodyMuted,
    fontSize: 12,
    lineHeight: 17,
  },
  queueTime: {
    ...type.tinyMono,
    fontSize: 10,
    lineHeight: 13,
  },
  empty: {
    minHeight: 180,
    justifyContent: "center",
    gap: spacing[2],
    padding: spacing[5],
  },
  softPanel: {
    minHeight: 48,
    justifyContent: "center",
    padding: spacing[4],
  },
});
