import React from "react";
import { ScrollView, StyleSheet, Text, TextInput } from "react-native";
import { colors, radius, spacing } from "@/design/tokens";
import { type } from "@/design/typography";
import { useAppPalette } from "@/design/appTheme";
import { ActionButton } from "@/components/ActionButton";
import { AppSurface } from "@/components/AppSurface";
import { KotlinHeader, MockupCard } from "@/components/KotlinMockupUI";
import { BackLineIcon, GearLineIcon, SendPlaneIcon } from "@/components/MockupLineIcons";
import { SignalCode } from "@/components/SignalCode";

type Props = {
  modeSwitch?: React.ReactNode;
  deckHeader?: React.ReactNode;
  recipientName: string;
  recipientNo: string;
  code: string;
  memo: string;
  sending: boolean;
  sentFeedback?: boolean;
  onCodeChange: (code: string) => void;
  onMemoChange: (memo: string) => void;
  onPreset: (code: string) => void;
  onSend: () => void;
  onBack: () => void;
  onOpenSettings: () => void;
  onAvatarPress?: () => void;
  headerAvatarUri?: string;
  showBackAction?: boolean;
};

export function SendBeepScreen({
  modeSwitch,
  deckHeader,
  recipientName,
  recipientNo,
  code,
  memo,
  sending,
  sentFeedback = false,
  onCodeChange,
  onMemoChange,
  onSend,
  onBack,
  onOpenSettings,
  onAvatarPress,
  headerAvatarUri,
  showBackAction = true,
}: Props) {
  const palette = useAppPalette();
  const cleanCode = code || "____";
  const primaryLabel = sentFeedback ? "Sent" : sending ? "Sending" : "Send Beep";
  const shouldRenderStandalonePreview = !deckHeader;
  const shouldRenderInputs = !deckHeader;

  return (
    <AppSurface backgroundColor="#F8F6F1">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <KotlinHeader
          title="Send"
          centered
          avatarLabel={recipientName}
          avatarSource={headerAvatarUri ? { uri: headerAvatarUri } : undefined}
          onAvatarPress={onAvatarPress}
          actions={[
            ...(showBackAction ? [{ label: "Back", icon: <BackLineIcon />, accessibilityLabel: "Back", onPress: onBack }] : []),
            {
              label: "Settings",
              accessibilityLabel: "Send settings",
              icon: <GearLineIcon />,
              onPress: onOpenSettings,
            },
          ]}
        />
        {deckHeader ?? modeSwitch}
        {shouldRenderStandalonePreview ? (
          <MockupCard style={styles.beepPreview}>
            <Text style={[type.tinyMono, { color: palette.muted }]}>READY TO TRANSMIT</Text>
            <SignalCode code={cleanCode} style={styles.previewCode} />
            <Text style={[styles.previewMeaning, { color: palette.text }]}>{memo || `NO ${recipientNo} / ${recipientName}`}</Text>
          </MockupCard>
        ) : null}

        <MockupCard soft style={styles.summary}>
          <Text style={[styles.summaryText, { color: palette.text }]}>
            Will send signal <Text style={[styles.summaryCode, { color: palette.text }]}>{cleanCode}</Text> to {recipientName}
          </Text>
        </MockupCard>

        {shouldRenderInputs ? (
          <>
            <TextInput
              value={code}
              onChangeText={(value) => onCodeChange(value.slice(0, 20))}
              keyboardType="default"
              maxLength={20}
              placeholder="Signal token (e.g. 8282 / 집중중 🔕)"
              placeholderTextColor={palette.muted2}
              style={[styles.input, { backgroundColor: palette.input, borderColor: palette.rule, color: palette.text }]}
            />
            <TextInput
              value={memo}
              onChangeText={onMemoChange}
              placeholder="Interpretation / Message Meaning"
              placeholderTextColor={palette.muted2}
              maxLength={30}
              style={[styles.input, { backgroundColor: palette.input, borderColor: palette.rule, color: palette.text }]}
            />
          </>
        ) : null}

        <ActionButton
          label={primaryLabel}
          variant={sentFeedback ? "success" : "dark"}
          icon={(iconColor) => <SendPlaneIcon color={iconColor} />}
          iconPosition="right"
          animateIconOnPress
          disabled={!code || sending}
          style={styles.primaryAction}
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
  primaryAction: {
    minHeight: 46,
    borderRadius: 12,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radius.control,
    paddingHorizontal: spacing[4],
    backgroundColor: "#FFFFFF",
    ...type.body,
    color: colors.ink,
  },
});
