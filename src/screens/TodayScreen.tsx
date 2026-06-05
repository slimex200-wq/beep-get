import React, { useEffect, useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { colors, spacing } from "@/design/tokens";
import { type } from "@/design/typography";
import { useAppPalette } from "@/design/appTheme";
import { ActionButton } from "@/components/ActionButton";
import { AppSurface } from "@/components/AppSurface";
import { FriendPulseCard, type FriendPulseItem } from "@/components/FriendPulseCard";
import { MockupCard } from "@/components/KotlinMockupUI";
import { SignalSlotRail } from "@/components/SignalSlotRail";
import { StatusDot } from "@/components/StatusDot";
import { TodayIncomingCard } from "@/components/TodayIncomingCard";
import { TodayMockupHeader, TodaySectionHeader } from "@/components/TodayMockupChrome";
import { WidgetPreviewPanel } from "@/components/WidgetPreviewPanel";
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
import { messageToSlipSignal, relationshipToSlipFriend } from "@/lib/slipUiModels";
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
    [latestMessage],
  );
  const signalQueue = useMemo(
    () => received.slice(0, 3).map((message, index) => messageToSlipSignal(message, { index })),
    [received],
  );
  const quickReplySlots = useMemo(
    () => buildQuickReplySlots(entries, DEFAULT_QUICK_REPLY_SLOTS),
    [entries],
  );
  const friendPulseItems = useMemo<FriendPulseItem[]>(() => {
    return friends.slice(0, 3).flatMap((friend, index) => {
      const slipFriend = relationshipToSlipFriend(friend, index);
      const recentSignal = received.find((message) => message.from_user === slipFriend.id);
      if (!recentSignal) return [];

      const code = recentSignal.number_code;
      const isBlink = recentSignal.kind === "blink" || Boolean(recentSignal.media);

      return [{
        id: slipFriend.id,
        name: slipFriend.name,
        status: `${formatPulseTime(recentSignal.created_at)} - ${isBlink ? "BLINK" : code}`,
        code: isBlink ? "BLINK" : code,
        ...(slipFriend.avatarUri ? { avatarUri: slipFriend.avatarUri } : {}),
        accent: index === 0 ? colors.mint : index === 1 ? colors.pink : colors.lavender,
      }];
    });
  }, [friends, received]);

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
    <AppSurface backgroundColor={palette.background} statusBarStyle={palette.statusBar}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TodayMockupHeader
          title="TODAY"
          actions={[
            {
              label: loading ? "Syncing" : "Refresh",
              icon: <RefreshLineIcon />,
              accessibilityLabel: "Refresh Today",
              onPress: refresh,
            },
            {
              label: "People",
              icon: <FriendsGroupIcon />,
              accessibilityLabel: "Open People",
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
        <View style={styles.mockupFlow}>
          <TodaySectionHeader label="Incoming Now" hint="오늘의 작은 신호" />
          {latestSignal ? (
            <TodayIncomingCard
              sender={latestSignal.sender}
              time={latestSignal.time}
              code={latestSignal.code}
              meaning={latestMeaning}
              avatarUri={latestSignal.avatarUri}
              hasBlink={Boolean(latestSignal.hasBlink)}
              frameUris={latestMessage.media?.stripFrameUris}
              doneFeedback={doneFeedback}
              onView={() => navigation.navigate("ReplyRoom", { signalId: latestMessage.id })}
              onDone={handleDone}
            />
          ) : (
            <MockupCard style={styles.empty}>
              <Text style={[type.metaValue, { color: palette.text }]}>WAITING FOR SIGNAL</Text>
              <Text style={[type.bodyMuted, { color: palette.muted }]}>New Beeps and Blinks land here first.</Text>
              <ActionButton
                label={friends.length > 0 ? "SEND FIRST BEEP" : "ADD FRIEND"}
                variant="dark"
                onPress={() =>
                  navigation.navigate("Main", { screen: friends.length > 0 ? "Compose" : "People" })
                }
              />
            </MockupCard>
          )}

          <TodaySectionHeader label="Quick Reply" hint="바로 답장" />
          <SignalSlotRail
            slots={quickReplySlots}
            disabled={!latestMessage}
            confirmedSlot={quickReplyFeedback}
            compact
            onSelect={handleQuickReply}
          />

          <FriendPulseCard title="Friend Pulse" items={friendPulseItems} />
          <WidgetPreviewPanel
            title="Widget Mirror"
            subtitle="홈 화면 나의 위젯"
            code={latestSignal?.code ?? "----"}
            from={latestSignal?.sender ?? "No signal yet"}
            tone="lavender"
            paperMode
            compact
          />

          <TodaySectionHeader label="Today Queue" hint="다음 신호" />
          <MockupCard soft style={styles.queueCard}>
            {signalQueue.length > 0 ? (
              signalQueue.map((item, index) => {
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
                      size={7}
                      color={index === 0 ? colors.red : index === 1 ? colors.pink : colors.greenDot}
                    />
                    <Text numberOfLines={1} style={[styles.queueCode, { color: palette.text }]}>
                      {item.code}
                      <Text style={[styles.queueMeaning, { color: palette.muted }]}> {meaning}</Text>
                    </Text>
                    <Text style={[styles.queueTime, { color: palette.muted }]}>{item.time}</Text>
                  </View>
                );
              })
            ) : (
              <Text style={[type.bodyMuted, { color: palette.muted }]}>No more signals queued.</Text>
            )}
          </MockupCard>
        </View>
      </ScrollView>
    </AppSurface>
  );
}

function formatPulseTime(dateStr: string): string {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "now";
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
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
    paddingHorizontal: spacing[6],
    paddingBottom: 110,
    gap: spacing[5],
  },
  mockupFlow: {
    gap: spacing[4],
  },
  empty: {
    minHeight: 132,
    justifyContent: "center",
    gap: spacing[2],
    padding: spacing[5],
  },
  queueCard: {
    minHeight: 54,
    justifyContent: "center",
    gap: 0,
    padding: 0,
    overflow: "hidden",
  },
  queueRow: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
    paddingHorizontal: spacing[4],
  },
  queueRowDivider: {
    borderTopWidth: 1,
  },
  queueCode: {
    ...type.codeSmall,
    flex: 1,
    fontSize: 16,
    lineHeight: 21,
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
});
