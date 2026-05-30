import React from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { CameraView } from "expo-camera";
import { colors, radius, spacing } from "@/design/tokens";
import { type } from "@/design/typography";
import { ActionButton } from "@/components/ActionButton";
import { AppSurface } from "@/components/AppSurface";
import { BlinkStrip } from "@/components/BlinkStrip";
import { CameraLensPanel } from "@/components/CameraLensPanel";
import { KotlinHeader, MockupCard } from "@/components/KotlinMockupUI";
import { GearLineIcon, SendPlaneIcon } from "@/components/MockupLineIcons";

type Props = {
  modeSwitch?: React.ReactNode;
  deckHeader?: React.ReactNode;
  recipientName: string;
  recipientNo: string;
  code: string;
  memo: string;
  sending: boolean;
  recording: boolean;
  hasCapturedBlink?: boolean;
  sentFeedback?: boolean;
  previewFrameUris?: string[] | null;
  cameraPermissionGranted: boolean;
  cameraRef: React.RefObject<CameraView | null>;
  onCodeChange: (code: string) => void;
  onMemoChange: (memo: string) => void;
  onPreset: (code: string) => void;
  onRequestPermission: () => void;
  onRetake: () => void;
  onSend: () => void;
  onBack: () => void;
  onOpenSettings: () => void;
  onAvatarPress?: () => void;
  headerAvatarUri?: string;
  previewMode?: boolean;
  showBackAction?: boolean;
};

export function SendBlinkScreen({
  modeSwitch,
  deckHeader,
  recipientName,
  recipientNo,
  code,
  memo,
  sending,
  recording,
  hasCapturedBlink = false,
  sentFeedback = false,
  previewFrameUris,
  cameraPermissionGranted,
  cameraRef,
  onCodeChange,
  onMemoChange,
  onRequestPermission,
  onRetake,
  onSend,
  onBack,
  onOpenSettings,
  onAvatarPress,
  headerAvatarUri,
  previewMode = false,
  showBackAction = true,
}: Props) {
  const primaryLabel = sentFeedback
    ? "Sent"
    : recording
    ? "Recording 2.0s"
    : sending
      ? "Sending"
      : hasCapturedBlink
        ? "Send Blink"
        : "Capture Blink";
  const shouldRenderCameraCard = !deckHeader;
  const shouldRenderCaptureFrames = !deckHeader;
  const shouldRenderInputs = !deckHeader;
  const hasRetakeState = hasCapturedBlink;

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
            ...(showBackAction ? [{ label: "Back", onPress: onBack }] : []),
            {
              label: "Settings",
              accessibilityLabel: "Send settings",
              icon: <GearLineIcon />,
              onPress: onOpenSettings,
            },
          ]}
        />
        {deckHeader ?? modeSwitch}
        {shouldRenderCameraCard ? (
          <MockupCard style={styles.cameraCard}>
            {cameraPermissionGranted ? (
              <View style={styles.cameraFrame}>
                <CameraView
                  ref={cameraRef}
                  active
                  facing="front"
                  mirror
                  mode="video"
                  mute
                  style={styles.camera}
                  videoBitrate={2500000}
                  videoQuality="480p"
                />
              </View>
            ) : (
              <View>
                <CameraLensPanel />
                {!previewMode ? (
                  <ActionButton
                    label="Allow Camera"
                    variant="dark"
                    style={styles.permissionButton}
                    onPress={onRequestPermission}
                  />
                ) : null}
              </View>
            )}
          </MockupCard>
        ) : null}

        {shouldRenderCaptureFrames ? (
          <>
            <Text style={type.tinyMono}>{hasCapturedBlink ? "CAPTURED FRAMES READY" : "CAPTURED FRAMES"}</Text>
            <BlinkStrip compact frameUris={previewFrameUris} />
          </>
        ) : null}

        <MockupCard soft style={styles.summary}>
          <Text style={styles.summaryText}>
            Will send signal <Text style={styles.summaryCode}>{code || "____"}</Text> to {recipientName}
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
              placeholderTextColor={colors.muted2}
              style={styles.input}
            />
            <TextInput
              value={memo}
              onChangeText={onMemoChange}
              placeholder={`Tiny note for NO ${recipientNo}`}
              placeholderTextColor={colors.muted2}
              maxLength={30}
              style={styles.input}
            />
          </>
        ) : null}

        <View style={styles.actions}>
          {(shouldRenderInputs || hasRetakeState) ? (
            <ActionButton
              label="Retake"
              flex
              onPress={onRetake}
              disabled={!hasRetakeState || sending || recording}
            />
          ) : null}
          <ActionButton
            label={primaryLabel}
            variant={sentFeedback ? "success" : "dark"}
            icon={(iconColor) => <SendPlaneIcon color={iconColor} />}
            iconPosition="right"
            animateIconOnPress
            flex
            style={styles.primaryAction}
            onPress={onSend}
            disabled={!code || sending || recording}
          />
        </View>
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
  cameraCard: {
    minHeight: 166,
    padding: spacing[3],
    justifyContent: "center",
  },
  cameraFrame: {
    minHeight: 154,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: colors.ink,
  },
  camera: {
    flex: 1,
  },
  permissionButton: {
    marginTop: spacing[3],
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
    backgroundColor: "#FFFFFF",
    ...type.body,
    color: colors.ink,
  },
  actions: {
    flexDirection: "row",
    gap: spacing[3],
  },
  primaryAction: {
    minHeight: 46,
    borderRadius: 12,
  },
});
