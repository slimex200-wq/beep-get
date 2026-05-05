import React from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { colors, radius, spacing } from "@/design/tokens";
import { type } from "@/design/typography";
import { ActionButton } from "@/components/ActionButton";
import { AppSurface } from "@/components/AppSurface";
import { HeaderBar } from "@/components/HeaderBar";
import { MetaRow } from "@/components/MetaRow";
import { SignalCode } from "@/components/SignalCode";
import { SlipFrame } from "@/components/SlipFrame";

type Props = {
  modeSwitch?: React.ReactNode;
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
  recipientName,
  recipientNo,
  code,
  memo,
  sending,
  onCodeChange,
  onMemoChange,
  onPreset,
  onSend,
  onBack,
  onOpenLogs,
}: Props) {
  const cleanCode = code || "____";

  return (
    <AppSurface>
      <HeaderBar title="SEND BEEP" left="BACK" right="LOGS" onLeftPress={onBack} onRightPress={onOpenLogs} />
      {modeSwitch}
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SlipFrame title="Outgoing Beep" accent={false}>
          <View style={styles.recipientRow}>
            <View style={styles.recipientText}>
              <MetaRow label="TO." value={`${recipientName} - NO ${recipientNo}`} />
            </View>
            <View style={styles.stamp}>
              <Text style={type.tinyMono}>CODE</Text>
              <Text style={type.codeSmall}>{recipientNo}</Text>
            </View>
          </View>

          <View style={styles.codeArea}>
            <Text style={type.tinyMono}>CODE.</Text>
            <SignalCode code={cleanCode} />
            <TextInput
              value={code}
              onChangeText={(value) => onCodeChange(value.replace(/[^0-9]/g, ""))}
              keyboardType="number-pad"
              maxLength={20}
              placeholder="8282"
              placeholderTextColor={colors.muted2}
              style={styles.hiddenInput}
            />
          </View>

          <Text style={type.tinyMono}>PRESET</Text>
          <View style={styles.presets}>
            {["8282", "486", "000", "1004"].map((preset) => (
              <ActionButton
                key={preset}
                label={preset}
                mono
                flex
                variant={code === preset ? "dark" : "light"}
                onPress={() => onPreset(preset)}
              />
            ))}
          </View>

          <View style={styles.memo}>
            <Text style={type.tinyMono}>MEMO (OPTIONAL)</Text>
            <TextInput
              value={memo}
              onChangeText={onMemoChange}
              placeholder="tiny note"
              placeholderTextColor={colors.muted2}
              maxLength={30}
              style={styles.memoInput}
            />
            <Text style={[type.tinyMono, styles.counter]}>{memo.length} / 30</Text>
          </View>
        </SlipFrame>
        <ActionButton
          label={sending ? "SENDING" : "SEND BEEP"}
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
    paddingBottom: spacing[8],
    gap: spacing[5],
  },
  recipientRow: {
    flexDirection: "row",
    gap: spacing[5],
    alignItems: "center",
  },
  recipientText: {
    flex: 1,
  },
  stamp: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 1,
    borderColor: colors.ruleStrong,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "-8deg" }],
  },
  codeArea: {
    marginTop: spacing[6],
    marginBottom: spacing[4],
  },
  hiddenInput: {
    minHeight: 40,
    marginTop: spacing[3],
    borderWidth: 1,
    borderColor: colors.ruleStrong,
    borderRadius: radius.button,
    paddingHorizontal: spacing[4],
    textAlign: "center",
    backgroundColor: "rgba(255,255,255,0.24)",
    ...type.body,
    color: colors.ink,
  },
  presets: {
    flexDirection: "row",
    gap: spacing[3],
    marginTop: spacing[3],
  },
  memo: {
    marginTop: spacing[5],
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radius.control,
    position: "relative",
  },
  memoInput: {
    minHeight: 38,
    ...type.body,
    color: colors.ink,
  },
  counter: {
    position: "absolute",
    right: spacing[4],
    bottom: spacing[4],
  },
});
