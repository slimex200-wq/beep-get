import React from "react";
import { ScrollView, StyleSheet, Text, TextInput } from "react-native";
import { colors, radius, spacing } from "@/design/tokens";
import { type } from "@/design/typography";
import { ActionButton } from "@/components/ActionButton";
import { AppSurface } from "@/components/AppSurface";
import { KotlinHeader, MockupCard } from "@/components/KotlinMockupUI";
import { SignalCode } from "@/components/SignalCode";

type Props = {
  modeSwitch?: React.ReactNode;
  deckHeader?: React.ReactNode;
  recipientName: string;
  recipientNo: string;
  code: string;
  memo: string;
  sending: boolean;
  onCodeChange: (code: string) => void;
  onMemoChange: (memo: string) => void;
  onPreset: (code: string) => void;
  onSend: () => void;
  onBack: () => void;
  onOpenLogs: () => void;
};

export function SendBeepScreen({
  modeSwitch,
  deckHeader,
  recipientName,
  recipientNo,
  code,
  memo,
  sending,
  onCodeChange,
  onMemoChange,
  onSend,
  onBack,
  onOpenLogs,
}: Props) {
  const cleanCode = code || "____";

  return (
    <AppSurface backgroundColor="#F8F6F1">
      <KotlinHeader
        title="Send"
        centered
        actions={[
          { label: "‹", onPress: onBack },
          { label: "⚙", onPress: onOpenLogs },
        ]}
      />
      {deckHeader ?? modeSwitch}
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <MockupCard style={styles.beepPreview}>
          <Text style={type.tinyMono}>READY TO TRANSMIT</Text>
          <SignalCode code={cleanCode} style={styles.previewCode} />
          <Text style={styles.previewMeaning}>{memo || `NO ${recipientNo} / ${recipientName}`}</Text>
        </MockupCard>

        <MockupCard soft style={styles.summary}>
          <Text style={styles.summaryText}>
            Will send code <Text style={styles.summaryCode}>{cleanCode}</Text> to {recipientName}
          </Text>
        </MockupCard>

        <TextInput
          value={code}
          onChangeText={(value) => onCodeChange(value.slice(0, 20))}
          keyboardType="default"
          maxLength={20}
          placeholder="Numeric Beep Code (e.g. 7942)"
          placeholderTextColor={colors.muted2}
          style={styles.input}
        />
        <TextInput
          value={memo}
          onChangeText={onMemoChange}
          placeholder="Interpretation / Message Meaning"
          placeholderTextColor={colors.muted2}
          maxLength={30}
          style={styles.input}
        />

        <ActionButton
          label={sending ? "Sending" : "▷  Send Beep"}
          variant="dark"
          disabled={!code || sending}
          onPress={onSend}
        />
      </ScrollView>
    </AppSurface>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing[5],
    paddingBottom: 96,
    gap: spacing[4],
  },
  beepPreview: {
    minHeight: 164,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing[2],
    padding: spacing[5],
  },
  previewCode: {
    fontSize: 54,
    lineHeight: 60,
    letterSpacing: 0,
  },
  previewMeaning: {
    ...type.metaValue,
    fontSize: 12,
    textAlign: "center",
  },
  summary: {
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: spacing[4],
  },
  summaryText: {
    ...type.body,
    color: colors.ink,
  },
  summaryCode: {
    ...type.buttonMono,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radius.control,
    paddingHorizontal: spacing[4],
    backgroundColor: "#EFE9F4",
    ...type.body,
    color: colors.ink,
  },
});
