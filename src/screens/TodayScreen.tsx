import React, { useEffect, useMemo } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { colors, spacing } from "@/design/tokens";
import { type } from "@/design/typography";
import { ActionButton } from "@/components/ActionButton";
import { AppSurface } from "@/components/AppSurface";
import { HeaderBar } from "@/components/HeaderBar";
import { SignalSlip } from "@/components/SignalSlip";
import { StatusDot } from "@/components/StatusDot";
import type { RootStackParamList } from "@/navigation/RootNavigator";
import { useAuthStore } from "@/stores/authStore";
import { useFriendStore } from "@/stores/friendStore";
import { useMessageStore } from "@/stores/messageStore";
import { messageToSlipSignal } from "@/lib/slipUiModels";

export function TodayScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { profile } = useAuthStore();
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
  }, [profile?.id, fetchFriends]);

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
        .slice(1, 4)
        .map((message, index) => messageToSlipSignal(message, { index: index + 1 })),
    [received]
  );

  const refresh = () => {
    if (!profile) return;
    fetchReceived(profile.id, friends).catch(reportError);
  };

  const quickReplyLatest = async (code: string) => {
    if (!latestMessage) return;
    try {
      await quickReply(latestMessage.id, code);
      Alert.alert("Reply sent", `${code} Beep sent back.`);
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
        {latestSignal ? (
          <SignalSlip
            signal={latestSignal}
            title={latestSignal.hasBlink ? "Incoming Blink" : "Incoming Beep"}
          />
        ) : (
          <View style={styles.empty}>
            <Text style={type.metaValue}>WAITING FOR SIGNAL</Text>
            <Text style={type.bodyMuted}>New Beeps and Blinks land here first.</Text>
          </View>
        )}

        <View style={styles.quickRow}>
          <ActionButton
            label="OK"
            mono
            flex
            disabled={!latestMessage}
            onPress={() => latestMessage && read(latestMessage.id).catch(reportError)}
          />
          <ActionButton
            label="8282"
            mono
            flex
            disabled={!latestMessage}
            onPress={() => quickReplyLatest("8282")}
          />
          <ActionButton
            label="OPEN"
            variant="dark"
            flex
            disabled={!latestMessage}
            onPress={() =>
              latestMessage && navigation.navigate("ReplyRoom", { signalId: latestMessage.id })
            }
          />
        </View>

        <ActionButton
          label="SAVE LOG"
          variant="ghost"
          disabled={!latestMessage}
          onPress={() => latestMessage && save(latestMessage.id).catch(reportError)}
        />

        <View style={styles.queue}>
          {signalQueue.map((item) => (
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
          ))}
        </View>

        <ActionButton label="REFRESH" variant="ghost" mono onPress={refresh} />
      </ScrollView>
    </AppSurface>
  );
}

function reportError(err: unknown) {
  const message = err instanceof Error ? err.message : "Unexpected error";
  Alert.alert("BEEP-GET", message);
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[8],
    gap: spacing[4],
  },
  quickRow: {
    flexDirection: "row",
    gap: spacing[3],
  },
  queue: {
    gap: spacing[2],
    marginTop: spacing[3],
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
});
