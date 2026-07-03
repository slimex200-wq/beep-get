import React, { useEffect, useMemo, useState } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { spacing } from "@/design/tokens";
import { type } from "@/design/typography";
import { useAppPalette } from "@/design/appTheme";
import {
  Card,
  Chip,
  ListRow,
  MonoValue,
  Perforation,
  PrimaryButton,
  Screen,
  SectionLabel,
  SignalKindLabel,
  StatusDot,
} from "@/ui/primitives";
import type { RootStackParamList } from "@/navigation/RootNavigator";
import { useAuthStore } from "@/stores/authStore";
import { useDictionaryStore } from "@/stores/dictionaryStore";
import { useFriendStore } from "@/stores/friendStore";
import { useMessageStore } from "@/stores/messageStore";
import { getAvatarImageSource } from "@/lib/avatarSource";
import { messageToSlipSignal, relationshipToSlipFriend } from "@/lib/slipUiModels";
import {
  DEFAULT_QUICK_REPLY_SLOTS,
  buildQuickReplySlots,
  isQuickReplySlotEntry,
} from "@/lib/quickReplySlots";

const FALLBACK_MEANINGS: Record<string, string> = {
  "8282": "Hurry up",
  "486": "Miss you",
  "1004": "Angel",
  "7942": "Between friends",
  "0404": "Forever",
};

const WEEKDAY_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as const;

type TodayFriendRow = {
  readonly id: string;
  readonly no: string;
  readonly name: string;
  readonly meta: string;
  readonly code: string | null;
  readonly isNew: boolean;
  readonly online: boolean;
  readonly avatarUri?: string;
};

export function TodayScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const palette = useAppPalette();
  const { profile } = useAuthStore();
  const { entries, fetch: fetchDictionary } = useDictionaryStore();
  const { friends, fetch: fetchFriends } = useFriendStore();
  const {
    received,
    fetchReceived,
    quickReply,
    read,
    subscribeRealtime,
    unsubscribeRealtime,
  } = useMessageStore();
  const [sendingSlot, setSendingSlot] = useState<string | null>(null);
  const [sentSlot, setSentSlot] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

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
  const latestFrameUris = latestMessage?.media?.stripFrameUris ?? undefined;
  const latestSignal = useMemo(
    () => (latestMessage ? messageToSlipSignal(latestMessage, { index: 0 }) : null),
    [latestMessage],
  );
  const friendRows = useMemo<TodayFriendRow[]>(() => {
    return friends.slice(0, 4).map((friend, index) => {
      const slipFriend = relationshipToSlipFriend(friend, index);
      const recentSignal = received.find((message) => message.from_user === slipFriend.id);
      const isBlink = recentSignal
        ? recentSignal.kind === "blink" || Boolean(recentSignal.media)
        : false;

      return {
        id: slipFriend.id,
        no: slipFriend.no,
        name: slipFriend.name,
        meta: recentSignal ? formatPulseTime(recentSignal.created_at) : "조용해요",
        code: recentSignal ? (isBlink ? "BLINK" : recentSignal.number_code) : null,
        isNew: Boolean(recentSignal && !recentSignal.is_read),
        online: friend.friend.status_icon === "online",
        ...(slipFriend.avatarUri ? { avatarUri: slipFriend.avatarUri } : {}),
      };
    });
  }, [friends, received]);

  const latestMeaning = latestSignal
    ? entries.find((entry) => !isQuickReplySlotEntry(entry) && entry.code === latestSignal.code)?.meaning ??
      latestSignal.note ??
      FALLBACK_MEANINGS[latestSignal.code] ??
      "Hurry up"
    : null;
  const quickReplySlots = useMemo(
    () => buildQuickReplySlots(entries, DEFAULT_QUICK_REPLY_SLOTS),
    [entries],
  );
  const latestHeroTime =
    latestSignal && latestMessage
      ? isJustNow(latestMessage.created_at)
        ? `${latestSignal.time} · 방금`
        : latestSignal.time
      : "";

  const todayDateLabel = formatTodayDate(new Date());

  const refresh = async () => {
    if (!profile) return;
    setRefreshing(true);
    try {
      await fetchReceived(profile.id, friends);
    } catch (err) {
      reportError(err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleQuickReply = async (slot: string) => {
    if (!latestMessage || sendingSlot) return;
    setSendingSlot(slot);
    try {
      // Parity with ReplyRoom: a configured "Done" slot marks the signal read
      // instead of sending the literal word as a signal code.
      if (slot === "Done") {
        await read(latestMessage.id);
        setSentSlot(slot);
        setTimeout(() => setSentSlot(null), 1200);
        return;
      }
      await quickReply(latestMessage.id, slot);
      setSentSlot(slot);
      setTimeout(() => setSentSlot(null), 1200);
      await read(latestMessage.id).catch(reportError);
    } catch (err) {
      reportError(err);
    } finally {
      setSendingSlot(null);
    }
  };

  const openSend = (row: TodayFriendRow) => {
    navigation.navigate("Send", {
      friendId: row.id,
      friendName: row.name,
      friendNo: row.no,
      ...(row.avatarUri ? { friendAvatarUri: row.avatarUri } : {}),
    });
  };

  return (
    <Screen title="Today" side={todayDateLabel} refreshing={refreshing} onRefresh={refresh}>
      <SectionLabel>최근 신호</SectionLabel>
      {latestSignal ? (
        <TodayHeroSlip
          sender={latestSignal.sender}
          time={latestHeroTime}
          code={latestSignal.code}
          meaning={latestMeaning}
          avatarUri={latestSignal.avatarUri}
          hasBlink={latestSignal.hasBlink}
          frameUris={latestFrameUris}
          slots={quickReplySlots}
          sendingSlot={sendingSlot}
          sentSlot={sentSlot}
          onView={() => navigation.navigate("ReplyRoom", { signalId: latestMessage.id })}
          onQuickReply={handleQuickReply}
        />
      ) : (
        <Card style={styles.empty}>
          <Text style={[type.metaValue, { color: palette.text }]}>WAITING FOR SIGNAL</Text>
          <Text style={[type.bodyMuted, { color: palette.muted }]}>New Beeps and Blinks land here first.</Text>
          <PrimaryButton
            label={friends.length > 0 ? "SEND FIRST BEEP" : "ADD FRIEND"}
            onPress={() =>
              navigation.navigate("Main", { screen: friends.length > 0 ? "Compose" : "People" })
            }
          />
        </Card>
      )}

      <SectionLabel>친구</SectionLabel>
      <Card>
        {friendRows.length === 0 ? (
          <Text style={[type.bodyMuted, styles.friendEmpty, { color: palette.muted }]}>
            아직 친구가 없어요
          </Text>
        ) : (
          friendRows.map((row, index) => (
            <ListRow
              key={row.id}
              left={
                <FriendAvatar
                  name={row.name}
                  avatarUri={row.avatarUri}
                  isNew={row.isNew}
                  online={row.online}
                />
              }
              title={row.name}
              meta={row.meta}
              metaMono
              right={
                <MonoValue sig={row.isNew} dim={!row.isNew}>
                  {row.code ?? "—"}
                </MonoValue>
              }
              onPress={() => openSend(row)}
              isLast={index === friendRows.length - 1}
              accessibilityLabel={`Send signal to ${row.name}`}
            />
          ))
        )}
      </Card>
    </Screen>
  );
}

// Signal Edition hero: a perforated paper slip rebuilt on the primitive
// vocabulary. Signal color appears only through SignalKindLabel, StatusDot,
// and MonoValue sig semantics. Tapping the slip body opens the reply room;
// the bottom rail is three quick-reply slot chips that answer immediately.
function TodayHeroSlip({
  sender,
  time,
  code,
  meaning,
  avatarUri,
  hasBlink = false,
  frameUris,
  slots,
  sendingSlot,
  sentSlot,
  onQuickReply,
  onView,
}: {
  readonly sender: string;
  readonly time: string;
  readonly code: string;
  readonly meaning: string | null;
  readonly avatarUri?: string;
  readonly hasBlink?: boolean;
  readonly frameUris?: string[] | null;
  readonly slots: readonly string[];
  readonly sendingSlot: string | null;
  readonly sentSlot: string | null;
  readonly onQuickReply: (slot: string) => void;
  readonly onView: () => void;
}) {
  const palette = useAppPalette();
  const avatarSource = getAvatarImageSource(avatarUri);
  const shouldShowFrames = hasBlink && Boolean(frameUris?.length);
  const heroFrames = shouldShowFrames ? (frameUris ?? []).slice(0, 3) : [];
  const sending = sendingSlot != null;

  return (
    <View testID="today-incoming-slip">
      <Card>
        <Pressable
          accessibilityLabel="Open signal"
          accessibilityRole="button"
          onPress={onView}
          style={({ pressed }) => [pressed && styles.heroPressed]}
        >
          <View style={styles.slipTop}>
            <SignalKindLabel>{hasBlink ? "INCOMING BLINK" : "INCOMING BEEP"}</SignalKindLabel>
            <MonoValue dim style={styles.slipTime}>
              {time}
            </MonoValue>
          </View>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.4}
            style={[styles.heroCode, { color: palette.text }]}
          >
            {code}
          </Text>
          {meaning ? (
            <Text numberOfLines={1} style={[styles.meaningText, { color: palette.muted }]}>
              {meaning}
            </Text>
          ) : null}
          {shouldShowFrames ? (
            <View style={styles.frameStripRow}>
              <View style={styles.frameStrip}>
                {heroFrames.map((uri, index) => (
                  <View
                    key={`${uri}-${index}`}
                    style={[
                      styles.frameThumb,
                      { borderColor: palette.rule, backgroundColor: palette.input },
                    ]}
                  >
                    <Image source={{ uri }} style={styles.frameImage} resizeMode="cover" />
                  </View>
                ))}
              </View>
              <Text style={[styles.frameCaption, { color: palette.muted }]}>2.0s · 무음</Text>
            </View>
          ) : null}
        </Pressable>
        <View style={styles.perfZone}>
          <Perforation />
        </View>
        <View style={styles.senderRow}>
          <View style={[styles.senderAvatar, { backgroundColor: palette.input }]}>
            {avatarSource ? (
              <Image source={avatarSource} style={styles.senderAvatarImage} resizeMode="cover" />
            ) : (
              <Text style={[styles.senderInitial, { color: palette.text }]}>{sender.slice(0, 1)}</Text>
            )}
            <StatusDot kind="new" />
          </View>
          <Text numberOfLines={1} style={[styles.senderName, { color: palette.text }]}>
            {sender}
          </Text>
        </View>
        <View style={styles.quickReplyRow}>
          {slots.slice(0, 3).map((slot) => (
            <Chip
              key={slot}
              flex
              mono
              label={slot}
              selected={sentSlot === slot}
              disabled={sending}
              onPress={() => onQuickReply(slot)}
              accessibilityLabel={`Quick reply ${slot}`}
            />
          ))}
        </View>
      </Card>
    </View>
  );
}

function FriendAvatar({
  name,
  avatarUri,
  isNew,
  online,
}: {
  readonly name: string;
  readonly avatarUri?: string;
  readonly isNew: boolean;
  readonly online: boolean;
}) {
  const palette = useAppPalette();
  const avatarSource = getAvatarImageSource(avatarUri);
  return (
    <View style={[styles.friendAvatar, { backgroundColor: palette.input }]}>
      {avatarSource ? (
        <Image source={avatarSource} style={styles.friendAvatarImage} resizeMode="cover" />
      ) : (
        <Text style={[styles.friendAvatarText, { color: palette.text }]}>{name.slice(0, 1)}</Text>
      )}
      {isNew || online ? <StatusDot kind={isNew ? "new" : "on"} /> : null}
    </View>
  );
}

function formatTodayDate(date: Date): string {
  return `${date.getMonth() + 1}.${date.getDate()} ${WEEKDAY_LABELS[date.getDay()]}`;
}

function formatPulseTime(dateStr: string): string {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "now";
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function isJustNow(dateStr: string, now: Date = new Date()): boolean {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return false;
  const elapsed = now.getTime() - date.getTime();
  return elapsed >= 0 && elapsed < 5 * 60 * 1000;
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
  empty: {
    minHeight: 132,
    justifyContent: "center",
    gap: spacing[2],
    padding: spacing[5],
  },
  friendEmpty: {
    paddingVertical: spacing[6],
    paddingHorizontal: spacing[8],
  },
  heroPressed: {
    opacity: 0.88,
  },
  slipTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing[3],
    paddingHorizontal: spacing[5],
    paddingTop: spacing[4],
  },
  slipTime: {
    ...type.tinyMono,
    fontSize: 10,
  },
  heroCode: {
    ...type.codeHero,
    paddingHorizontal: spacing[5],
    paddingTop: spacing[2],
  },
  meaningText: {
    ...type.body,
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: spacing[5],
  },
  frameStripRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing[3],
    paddingHorizontal: spacing[5],
    paddingTop: spacing[3],
  },
  frameStrip: {
    flexDirection: "row",
    gap: spacing[2],
  },
  frameThumb: {
    width: 48,
    height: 38,
    borderRadius: 7,
    overflow: "hidden",
    borderWidth: 1,
  },
  frameImage: {
    width: "100%",
    height: "100%",
  },
  frameCaption: {
    ...type.tinyMono,
    fontSize: 9,
    flexShrink: 0,
  },
  perfZone: {
    height: 18,
    justifyContent: "center",
    marginTop: spacing[3],
  },
  senderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
    paddingHorizontal: spacing[5],
    paddingTop: spacing[2],
  },
  senderAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  senderAvatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 13,
  },
  senderInitial: {
    ...type.metaValue,
    fontSize: 9,
  },
  senderName: {
    ...type.metaValue,
    flexShrink: 1,
    fontSize: 13,
  },
  quickReplyRow: {
    flexDirection: "row",
    gap: spacing[2],
    paddingHorizontal: spacing[5],
    paddingTop: spacing[3],
    paddingBottom: spacing[5],
  },
  friendAvatar: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 17,
  },
  friendAvatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 17,
  },
  friendAvatarText: {
    ...type.metaValue,
    fontSize: 12,
  },
});
