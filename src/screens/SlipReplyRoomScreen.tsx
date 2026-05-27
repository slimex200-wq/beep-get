import React, { useEffect, useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { colors, spacing } from "@/design/tokens";
import { type } from "@/design/typography";
import { useAppPalette } from "@/design/appTheme";
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
import type { RootStackParamList } from "@/navigation/RootNavigator";
import { useAuthStore } from "@/stores/authStore";
import { useMessageStore } from "@/stores/messageStore";
import { messageToSlipSignal } from "@/lib/slipUiModels";
import { getMessageById, type LegacyMessage } from "@/services/messageService";

type Props = NativeStackScreenProps<RootStackParamList, "ReplyRoom">;

const DEFAULT_REPLY_SLOTS = ["Done", "8282", "486"];
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
  const { received, saved, fetchReceived, fetchSaved, quickReply, read, save } = useMessageStore();
  const palette = useAppPalette();
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

  const handleReply = async (slot: string) => {
    if (!message) return;

    if (slot === "Done") {
      await read(message.id).catch(reportError);
      return;
    }

    try {
      await quickReply(message.id, slot);
      Alert.alert("Reply sent", `${slot} Beep sent back.`);
    } catch (err: any) {
      Alert.alert("Reply failed", err?.message ?? "Try again.");
    }
  };

  if (!message || !signal) {
    return (
      <AppSurface backgroundColor="#F8F6F1">
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <KotlinHeader title="Signal" centered actions={[{ label: "×", onPress: returnToToday }]} />
          <MockupCard style={styles.empty}>
            <Text style={[type.metaValue, { color: palette.text }]}>NO SIGNAL</Text>
            <Text style={[type.bodyMuted, { color: palette.muted }]}>This widget signal is no longer available.</Text>
            <ActionButton label="Back to Today" variant="dark" onPress={returnToToday} />
          </MockupCard>
        </ScrollView>
      </AppSurface>
    );
  }

  const meaning = signal.note ?? FALLBACK_MEANINGS[signal.code] ?? "signal";

  return (
    <AppSurface backgroundColor="#F8F6F1">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <KotlinHeader title={`NO. ${signal.code}`} centered actions={[{ label: "×", onPress: returnToToday }]} />

        <MockupCard style={styles.signalCard}>
          <View style={styles.topRow}>
            <View>
              <Text style={[styles.senderName, { color: palette.text }]}>{signal.sender}</Text>
              <Text style={[type.tinyMono, { color: palette.muted }]}>{signal.time}</Text>
            </View>
            <StatusPill label="Private" tone="red" />
          </View>
          <View style={styles.codeBlock}>
            <SignalCode code={signal.code} style={styles.code} />
            <Text style={[styles.meaning, { color: palette.text }]}>{meaning}</Text>
          </View>
          {signal.hasBlink ? (
            <BlinkHeroPreview
              playbackUri={message.media?.playbackUri}
              frameUris={message.media?.stripFrameUris}
              sender={signal.sender}
            />
          ) : null}
        </MockupCard>

        <MockupSection label="Quick Reply" />
        <SignalSlotRail slots={DEFAULT_REPLY_SLOTS} onSelect={handleReply} />

        <View style={styles.actions}>
          <ActionButton
            label="Blink Back"
            variant="dark"
            flex
            onPress={() =>
              navigation.navigate("Send", {
                friendId: message.from_user,
                friendName: signal.sender,
                mode: "blink",
              })
            }
          />
          <ActionButton
            label="Save Log"
            flex
            onPress={() => save(message.id).catch(reportError)}
            disabled={message.is_saved}
          />
        </View>
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
    paddingBottom: 96,
    gap: spacing[4],
  },
  signalCard: {
    minHeight: 330,
    gap: spacing[4],
    marginHorizontal: spacing[5],
    padding: spacing[5],
    borderRadius: 17,
  },
  topRow: {
    minHeight: 38,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing[4],
  },
  senderName: {
    ...type.metaValue,
    fontSize: 12,
  },
  codeBlock: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing[3],
  },
  code: {
    fontSize: 64,
    lineHeight: 70,
    letterSpacing: 0,
  },
  meaning: {
    ...type.metaValue,
    marginTop: spacing[2],
  },
  actions: {
    flexDirection: "row",
    gap: spacing[3],
    paddingHorizontal: spacing[5],
  },
  empty: {
    minHeight: 180,
    justifyContent: "center",
    gap: spacing[3],
    marginHorizontal: spacing[5],
    padding: spacing[5],
  },
});
