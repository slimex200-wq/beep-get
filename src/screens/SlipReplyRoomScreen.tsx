import React, { useEffect, useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { spacing } from "@/design/tokens";
import { ActionButton } from "@/components/ActionButton";
import { AppSurface } from "@/components/AppSurface";
import { BlinkStrip } from "@/components/BlinkStrip";
import { HeaderBar } from "@/components/HeaderBar";
import { SignalSlip } from "@/components/SignalSlip";
import type { RootStackParamList } from "@/navigation/RootNavigator";
import { useAuthStore } from "@/stores/authStore";
import { useMessageStore } from "@/stores/messageStore";
import { messageToSlipSignal } from "@/lib/slipUiModels";
import { getMessageById, type LegacyMessage } from "@/services/messageService";

type Props = NativeStackScreenProps<RootStackParamList, "ReplyRoom">;

export function ReplyRoomScreen({ route, navigation }: Props) {
  const { signalId } = route.params;
  const { profile } = useAuthStore();
  const { received, saved, fetchReceived, fetchSaved, quickReply, read, save } = useMessageStore();
  const [fetchedMessage, setFetchedMessage] = useState<LegacyMessage | null>(null);

  useEffect(() => {
    if (!profile) return;
    fetchReceived(profile.id).catch(reportError);
    fetchSaved(profile.id).catch(reportError);
  }, [profile?.id, fetchReceived, fetchSaved]);

  const message = useMemo(
    () =>
      received.find((item) => item.id === signalId) ??
      saved.find((item) => item.id === signalId) ??
      (fetchedMessage?.id === signalId ? fetchedMessage : null),
    [received, saved, fetchedMessage, signalId]
  );
  const signal = useMemo(() => (message ? messageToSlipSignal(message) : null), [message]);

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

  const sendQuickReply = async (code: string) => {
    if (!message) return;
    try {
      await quickReply(message.id, code);
      Alert.alert("Reply sent", `${code} Beep sent back.`);
    } catch (err: any) {
      Alert.alert("Reply failed", err?.message ?? "Try again.");
    }
  };

  if (!message || !signal) {
    return (
      <AppSurface>
        <HeaderBar title="NO SIGNAL" left="BACK" right="--" onLeftPress={returnToToday} />
        <View style={styles.empty}>
          <ActionButton label="BACK TO TODAY" variant="dark" onPress={returnToToday} />
        </View>
      </AppSurface>
    );
  }

  return (
    <AppSurface>
      <HeaderBar
        title={`NO. ${signal.code}`}
        left="BACK"
        right={(signal.status ?? "active").toUpperCase()}
        onLeftPress={returnToToday}
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SignalSlip signal={signal} title={signal.hasBlink ? "Incoming Blink" : "Incoming Beep"} />
        {signal.hasBlink ? <BlinkStrip frameUris={message.media?.stripFrameUris} /> : null}
        <View style={styles.replyRow}>
          <ActionButton label="OK" mono flex onPress={() => read(message.id).catch(reportError)} />
          <ActionButton label="8282" mono flex onPress={() => sendQuickReply("8282")} />
          <ActionButton label="486" mono flex onPress={() => sendQuickReply("486")} />
        </View>
        <ActionButton
          label="BLINK BACK"
          variant="ghost"
          onPress={() =>
            navigation.navigate("Send", {
              friendId: message.from_user,
              friendName: signal.sender,
            })
          }
        />
        <ActionButton
          label="SAVE LOG"
          variant="ghost"
          onPress={() => save(message.id).catch(reportError)}
          disabled={message.is_saved}
        />
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
    gap: spacing[5],
  },
  replyRow: {
    flexDirection: "row",
    gap: spacing[3],
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    padding: spacing[5],
  },
});
