import React, { useEffect, useMemo } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { colors, radius, spacing } from "@/design/tokens";
import { type } from "@/design/typography";
import { ActionButton } from "@/components/ActionButton";
import { AppSurface } from "@/components/AppSurface";
import { FriendPulseRow } from "@/components/FriendPulseRow";
import { HeaderBar } from "@/components/HeaderBar";
import { SectionHeader } from "@/components/SectionHeader";
import { SignalSlip } from "@/components/SignalSlip";
import { SignalSlotRail } from "@/components/SignalSlotRail";
import { StatusDot } from "@/components/StatusDot";
import type { RootStackParamList } from "@/navigation/RootNavigator";
import { useAuthStore } from "@/stores/authStore";
import { useDictionaryStore } from "@/stores/dictionaryStore";
import { useFriendStore } from "@/stores/friendStore";
import { useMessageStore } from "@/stores/messageStore";
import { messageToSlipSignal } from "@/lib/slipUiModels";

const FALLBACK_REPLY_SLOTS = ["OK", "8282", "OPEN"];

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

  const friendPulseRows = useMemo(
    () =>
      friends.slice(0, 4).map((friend, index) => {
        const name = friend.nickname?.trim() || friend.friend.nickname || `FRIEND ${index + 1}`;
        const latestFromFriend = received.find((message) => message.from_user === friend.friend_id);
        if (!latestFromFriend) {
          return { id: friend.friend_id, name, summary: `${name} quiet`, quiet: true };
        }

        if (latestFromFriend.is_saved) {
          return { id: friend.friend_id, name, summary: `${name} saved Blink`, quiet: false };
        }

        const kind = latestFromFriend.kind === "blink" || latestFromFriend.media ? "Blink" : "Beep";
        return {
          id: friend.friend_id,
          name,
          summary: `${name} sent ${latestFromFriend.number_code} ${kind}`,
          quiet: false,
        };
      }),
    [friends, received]
  );
  const widgetRecentRows = useMemo(
    () => [latestSignal, ...signalQueue].filter(Boolean).slice(0, 3),
    [latestSignal, signalQueue]
  );

  const refresh = () => {
    if (!profile) return;
    fetchReceived(profile.id, friends).catch(reportError);
  };

  const handleQuickReply = async (slot: string) => {
    if (!latestMessage) return;

    if (slot === "OK") {
      await read(latestMessage.id).catch(reportError);
      return;
    }

    if (slot === "OPEN") {
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
    <AppSurface>
      <HeaderBar
        title="BEEP-GET"
        right={loading ? "SYNC" : "LIVE"}
        showDot
        onRightPress={refresh}
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SectionHeader label="INCOMING NOW" hint="LATEST SIGNAL" />
        {latestSignal ? (
          <SignalSlip
            signal={latestSignal}
            title={latestSignal.hasBlink ? "Incoming Blink" : "Incoming Beep"}
          />
        ) : (
          <View style={styles.empty}>
            <Text style={type.metaValue}>WAITING FOR SIGNAL</Text>
            <Text style={type.bodyMuted}>New Beeps and Blinks land here first.</Text>
            <ActionButton
              label={friends.length > 0 ? "SEND FIRST BEEP" : "ADD FRIEND"}
              variant="dark"
              onPress={() =>
                navigation.navigate("Main", { screen: friends.length > 0 ? "Compose" : "People" })
              }
            />
          </View>
        )}

        <SectionHeader label="QUICK REPLY" hint="MY SLOTS + CLASSIC CODES" />
        <SignalSlotRail slots={quickReplySlots} disabled={!latestMessage} onSelect={handleQuickReply} />
        <ActionButton
          label="SAVE LOG"
          variant="ghost"
          disabled={!latestMessage}
          onPress={() => latestMessage && save(latestMessage.id).catch(reportError)}
        />

        <SectionHeader label="TODAY QUEUE" hint={`${signalQueue.length} WAITING`} />
        <View style={styles.queue}>
          {signalQueue.length > 0 ? (
            signalQueue.map((item) => (
              <View key={item.id} style={styles.queueRow}>
                <View style={styles.noColumn}>
                  <Text style={type.tinyMono}>NO.</Text>
                  <Text style={type.codeSmall}>{item.code}</Text>
                </View>
                <View style={styles.fromColumn}>
                  <Text style={type.tinyMono}>FROM.</Text>
                  <Text style={type.metaValue}>{item.sender}</Text>
                </View>
                <Text style={type.monoValue}>{item.time}</Text>
                <StatusDot size={7} color={item.status === "new" ? colors.red : colors.faint} />
              </View>
            ))
          ) : (
            <View style={styles.softPanel}>
              <Text style={type.bodyMuted}>No more signals queued.</Text>
            </View>
          )}
        </View>

        <SectionHeader label="FRIEND PULSE" hint="RECENT FRIENDS" />
        <View style={styles.pulseList}>
          {friendPulseRows.length > 0 ? (
            friendPulseRows.map((row) => (
              <FriendPulseRow key={row.id} name={row.name} summary={row.summary} quiet={row.quiet} />
            ))
          ) : (
            <View style={styles.softPanel}>
              <Text style={type.bodyMuted}>Add close friends to see their signal pulse here.</Text>
            </View>
          )}
        </View>

        <SectionHeader label="WIDGET MIRROR" hint="FRIEND HOME STATE" />
        <View style={styles.widgetMirror}>
          <View style={styles.widgetSignalPane}>
            <View style={styles.widgetTopLine}>
              <Text style={styles.widgetTitle}>
                {latestSignal?.hasBlink ? "Incoming Blink" : "Incoming Beep"}
              </Text>
              <StatusDot size={7} color={latestSignal ? colors.red : colors.faint} />
            </View>
            <View style={styles.widgetRule} />
            <Text style={type.tinyMono}>NO.</Text>
            <Text style={styles.widgetCode}>{latestSignal?.code ?? "WAIT"}</Text>
            <View style={styles.widgetRule} />
            <View style={styles.widgetMeta}>
              <Text style={type.tinyMono}>FROM. {latestSignal?.sender ?? "-"}</Text>
              <Text style={type.tinyMono}>TIME. {latestSignal?.time ?? "--:--"}</Text>
            </View>
            {latestSignal?.hasBlink ? (
              <View style={styles.widgetThumb}>
                <Text style={styles.widgetThumbText}>BLINK PREVIEW</Text>
              </View>
            ) : null}
            <View style={styles.widgetActions}>
              {FALLBACK_REPLY_SLOTS.map((slot) => (
                <View
                  key={slot}
                  style={[styles.widgetActionChip, slot === "OPEN" && styles.widgetActionDark]}
                >
                  <Text
                    style={[styles.widgetActionText, slot === "OPEN" && styles.widgetActionTextDark]}
                  >
                    {slot}
                  </Text>
                </View>
              ))}
            </View>
          </View>
          <View style={styles.widgetGap} />
          <View style={styles.widgetRecentPane}>
            <Text style={styles.widgetRecentTitle}>RECENT</Text>
            {widgetRecentRows.length > 0 ? (
              widgetRecentRows.map((item) =>
                item ? (
                  <View key={item.id} style={styles.widgetRecentRow}>
                    <Text style={styles.widgetRecentName} numberOfLines={1}>
                      {item.sender}
                    </Text>
                    <Text style={type.tinyMono} numberOfLines={1}>
                      {item.code}
                    </Text>
                  </View>
                ) : null
              )
            ) : (
              <Text style={type.bodyMuted}>Waiting</Text>
            )}
          </View>
        </View>

        <ActionButton label="REFRESH" variant="ghost" mono onPress={refresh} />
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
    paddingBottom: spacing[8],
    gap: spacing[4],
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
    marginTop: spacing[2],
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.rule,
  },
  queue: {
    gap: spacing[2],
  },
  queueRow: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[4],
    paddingHorizontal: spacing[4],
    borderWidth: 1,
    borderColor: colors.ruleStrong,
    backgroundColor: colors.paperWarm,
    borderRadius: 10,
  },
  noColumn: {
    width: 86,
  },
  fromColumn: {
    flex: 1,
  },
  pulseList: {
    gap: spacing[2],
  },
  empty: {
    minHeight: 180,
    justifyContent: "center",
    gap: spacing[2],
    padding: spacing[5],
    borderWidth: 1,
    borderColor: colors.ruleStrong,
    borderRadius: 12,
    backgroundColor: colors.paperWarm,
  },
  softPanel: {
    minHeight: 48,
    justifyContent: "center",
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radius.control,
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  widgetMirror: {
    flexDirection: "row",
    gap: spacing[1],
    padding: spacing[1],
    borderWidth: 1,
    borderColor: colors.ruleStrong,
    borderRadius: 12,
    backgroundColor: colors.paper,
    overflow: "hidden",
  },
  widgetSignalPane: {
    flex: 1.45,
    gap: spacing[2],
    padding: spacing[4],
    backgroundColor: colors.paperWarm,
  },
  widgetTopLine: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  widgetTitle: {
    ...type.metaValue,
    fontSize: 12,
    lineHeight: 15,
  },
  widgetRule: {
    height: 1,
    backgroundColor: colors.paperLine,
  },
  widgetCode: {
    ...type.codeMedium,
    textAlign: "center",
  },
  widgetMeta: {
    gap: spacing[1],
  },
  widgetThumb: {
    minHeight: 34,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.ink,
  },
  widgetThumbText: {
    ...type.tinyMono,
    color: colors.paperWarm,
  },
  widgetActions: {
    flexDirection: "row",
    gap: spacing[2],
  },
  widgetActionChip: {
    flex: 1,
    minHeight: 24,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.paper,
  },
  widgetActionDark: {
    backgroundColor: colors.ink,
  },
  widgetActionText: {
    ...type.tinyMono,
    color: colors.ink,
  },
  widgetActionTextDark: {
    color: colors.paperWarm,
  },
  widgetGap: {
    width: spacing[1],
    backgroundColor: colors.paper,
  },
  widgetRecentPane: {
    flex: 1,
    gap: spacing[3],
    padding: spacing[4],
    backgroundColor: colors.paperWarm,
  },
  widgetRecentTitle: {
    ...type.tinyMono,
    color: colors.muted,
  },
  widgetRecentRow: {
    gap: spacing[1],
  },
  widgetRecentName: {
    ...type.metaValue,
  },
});
