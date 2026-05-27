import React, { useEffect, useMemo } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { colors, radius, spacing } from "@/design/tokens";
import { type } from "@/design/typography";
import { ActionButton } from "@/components/ActionButton";
import { AppSurface } from "@/components/AppSurface";
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

const FALLBACK_REPLY_SLOTS = ["Done", "8282", "View"];

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
    <AppSurface>
      <HeaderBar
        title="Today"
        right={loading ? "SYNC" : "LIVE"}
        showDot
        onRightPress={refresh}
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SectionHeader label="TODAY" hint="LATEST SIGNAL" />
        {latestSignal ? (
          <View style={styles.latestStack}>
            <SignalSlip
              signal={latestSignal}
              title={latestSignal.hasBlink ? "Incoming Blink" : "Incoming Beep"}
            />
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
          </View>
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

        <SectionHeader label="QUICK REPLY" hint="DONE / CODE / VIEW" />
        <SignalSlotRail slots={quickReplySlots} disabled={!latestMessage} onSelect={handleQuickReply} />

        <SectionHeader label="QUEUE" hint={`${signalQueue.length} WAITING`} />
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

        <ActionButton
          label="SAVE LOG"
          variant="ghost"
          disabled={!latestMessage}
          onPress={() => latestMessage && save(latestMessage.id).catch(reportError)}
        />
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
  latestStack: {
    gap: spacing[3],
  },
  latestActions: {
    flexDirection: "row",
    gap: spacing[3],
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
});
