import React, { useEffect, useMemo } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { colors, radius, spacing } from "@/design/tokens";
import { type } from "@/design/typography";
import { ActionButton } from "@/components/ActionButton";
import { AppSurface } from "@/components/AppSurface";
import { BlinkHeroPreview } from "@/components/BlinkHeroPreview";
import {
  KotlinHeader,
  MockupCard,
  MockupSection,
  StatusPill,
} from "@/components/KotlinMockupUI";
import { SignalCode } from "@/components/SignalCode";
import { SignalSlotRail } from "@/components/SignalSlotRail";
import { StatusDot } from "@/components/StatusDot";
import type { RootStackParamList } from "@/navigation/RootNavigator";
import { useAuthStore } from "@/stores/authStore";
import { useDictionaryStore } from "@/stores/dictionaryStore";
import { useFriendStore } from "@/stores/friendStore";
import { useMessageStore } from "@/stores/messageStore";
import { messageToSlipSignal } from "@/lib/slipUiModels";

const FALLBACK_REPLY_SLOTS = ["Done", "8282", "View"];
const FALLBACK_MEANINGS: Record<string, string> = {
  "8282": "빨리 와줘",
  "486": "보고 싶어",
  "1004": "집 도착",
  "7942": "친구사이",
  "0404": "영원히 사랑해",
};

export function TodayScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { profile } = useAuthStore();
  const { entries, fetch: fetchDictionary } = useDictionaryStore();
  const { friends, fetch: fetchFriends } = useFriendStore();
  const {
    received,
    loading,
    fetchReceived,
    quickReply,
    read,
    save,
    subscribeRealtime,
    unsubscribeRealtime,
  } = useMessageStore();

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
        .slice(1, 5)
        .map((message, index) => messageToSlipSignal(message, { index: index + 1 })),
    [received]
  );

  const quickReplySlots = useMemo(() => {
    const savedSlots = entries.map((entry) => entry.code).filter(Boolean);
    return Array.from(new Set([...savedSlots, ...FALLBACK_REPLY_SLOTS])).slice(0, 6);
  }, [entries]);
  const latestMeaning = latestSignal
    ? entries.find((entry) => entry.code === latestSignal.code)?.meaning ??
      latestSignal.note ??
      FALLBACK_MEANINGS[latestSignal.code] ??
      "빨리 와줘"
    : null;

  const refresh = () => {
    if (!profile) return;
    fetchReceived(profile.id, friends).catch(reportError);
  };

  const handleQuickReply = async (slot: string) => {
    if (!latestMessage) return;

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
      <KotlinHeader
        title="Today"
        showAvatar={false}
        actions={[
          { label: loading ? "…" : "◐", onPress: refresh },
          { label: "◎" },
          { label: "⚙" },
        ]}
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {latestSignal ? (
          <View style={styles.latestStack}>
            <MockupCard style={styles.latestCard}>
              <View style={styles.latestTopRow}>
                <View style={styles.senderRow}>
                  <View style={styles.senderAvatar}>
                    <Text style={styles.senderInitial}>{latestSignal.sender.slice(0, 1)}</Text>
                  </View>
                  <View>
                    <Text style={styles.senderName}>{latestSignal.sender}</Text>
                    <Text style={styles.senderTime}>{latestSignal.time}</Text>
                  </View>
                </View>
                <StatusPill label="Private" tone="red" />
              </View>
              <View style={styles.codeBlock}>
                <SignalCode code={latestSignal.code} style={styles.todayCode} />
                <Text style={styles.meaningText}>{latestMeaning}</Text>
              </View>
              {latestSignal.hasBlink ? (
                <BlinkHeroPreview
                  playbackUri={latestMessage.media?.playbackUri}
                  frameUris={latestMessage.media?.stripFrameUris}
                  sender={latestSignal.sender}
                />
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
                  flex
                  onPress={() => read(latestMessage.id).catch(reportError)}
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
        <SignalSlotRail slots={quickReplySlots} disabled={!latestMessage} onSelect={handleQuickReply} />

        <MockupSection label="Queue" />
        <View style={styles.queue}>
          {signalQueue.length > 0 ? (
            signalQueue.map((item, index) => (
              <View key={item.id} style={styles.queueRow}>
                <StatusDot size={7} color={index === 0 ? colors.red : index === 1 ? "#F27F0C" : colors.greenDot} />
                <View style={styles.queueCopy}>
                  <Text style={styles.queueCode}>
                    {item.code}
                    <Text style={styles.queueMeaning}>
                      {"  "}
                      {entries.find((entry) => entry.code === item.code)?.meaning ?? item.note ?? FALLBACK_MEANINGS[item.code] ?? "signal"}
                    </Text>
                  </Text>
                </View>
                <Text style={type.monoValue}>{item.time}</Text>
              </View>
            ))
          ) : (
            <MockupCard soft style={styles.softPanel}>
              <Text style={type.bodyMuted}>No more signals queued.</Text>
            </MockupCard>
          )}
        </View>
        <ActionButton label="Save Log" variant="ghost" disabled={!latestMessage} onPress={() => latestMessage && save(latestMessage.id).catch(reportError)} />
      </ScrollView>
    </AppSurface>
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
    gap: spacing[2],
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
  senderInitial: {
    ...type.metaValue,
    fontSize: 12,
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
  queueRow: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
    paddingHorizontal: spacing[4],
    borderWidth: 1,
    borderColor: colors.rule,
    backgroundColor: "#FFFFFF",
    borderRadius: 9,
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
    fontSize: 11,
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
