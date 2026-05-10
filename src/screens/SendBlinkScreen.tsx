import React from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { CameraView } from "expo-camera";
import { colors, spacing } from "@/design/tokens";
import { type } from "@/design/typography";
import { ActionButton } from "@/components/ActionButton";
import { AppSurface } from "@/components/AppSurface";
import { BlinkStrip } from "@/components/BlinkStrip";
import { CameraLensPanel } from "@/components/CameraLensPanel";
import { HeaderBar } from "@/components/HeaderBar";
import { MetaRow } from "@/components/MetaRow";
import { SlipFrame } from "@/components/SlipFrame";

type Props = {
  modeSwitch?: React.ReactNode;
  deckHeader?: React.ReactNode;
  recipientName: string;
  recipientNo: string;
  code: string;
  memo: string;
  sending: boolean;
  recording: boolean;
  cameraPermissionGranted: boolean;
  cameraRef: React.RefObject<CameraView | null>;
  onCodeChange: (code: string) => void;
  onMemoChange: (memo: string) => void;
  onPreset: (code: string) => void;
  onRequestPermission: () => void;
  onRetake: () => void;
  onSend: () => void;
  onBack: () => void;
  onOpenLogs: () => void;
  previewMode?: boolean;
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
  cameraPermissionGranted,
  cameraRef,
  onCodeChange,
  onMemoChange,
  onPreset,
  onRequestPermission,
  onRetake,
  onSend,
  onBack,
  onOpenLogs,
  previewMode = false,
}: Props) {
  return (
    <AppSurface>
      <HeaderBar title="SEND BLINK" left="BACK" right="LOGS" onLeftPress={onBack} onRightPress={onOpenLogs} />
      {deckHeader ?? modeSwitch}
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SlipFrame title="Send Slip" accent={false}>
          <View style={styles.recipientRow}>
            <View style={styles.recipientText}>
              <MetaRow label="TO." value={`${recipientName} - NO ${recipientNo}`} />
            </View>
            <View style={styles.stamp}>
              <Text style={type.tinyMono}>CODE</Text>
              <Text style={type.codeSmall}>{recipientNo}</Text>
            </View>
          </View>

          <View style={styles.cameraBlock}>
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
                {previewMode ? (
                  <View style={styles.previewCameraBadge}>
                    <Text style={type.tinyMono}>MOCK CAMERA</Text>
                    <Text style={styles.previewCameraText}>PREVIEW BLINK</Text>
                  </View>
                ) : (
                  <ActionButton
                    label="ALLOW CAMERA"
                    variant="dark"
                    style={styles.permissionButton}
                    onPress={onRequestPermission}
                  />
                )}
              </View>
            )}
          </View>

          <Text style={type.tinyMono}>CODE / TOKEN</Text>
          <View style={styles.presets}>
            {["8282", "486", "000"].map((preset) => (
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
          <TextInput
            value={code}
            onChangeText={(value) => onCodeChange(value.slice(0, 20))}
            keyboardType="default"
            maxLength={20}
            placeholder="8282 or 배고픔"
            placeholderTextColor={colors.muted2}
            style={styles.input}
          />

          <TextInput
            value={memo}
            onChangeText={onMemoChange}
            placeholder="tiny note"
            placeholderTextColor={colors.muted2}
            maxLength={30}
            style={styles.memoInput}
          />

          <Text style={type.tinyMono}>PREVIEW  3 FRAMES</Text>
          <BlinkStrip compact />
        </SlipFrame>
        <View style={styles.actions}>
          <ActionButton label="RETAKE" flex onPress={onRetake} disabled={sending || recording} />
          <ActionButton
            label={recording ? "RECORDING 2 SEC" : sending ? "SENDING" : "SEND BLINK"}
            variant="dark"
            flex
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
  cameraBlock: {
    marginVertical: spacing[5],
  },
  cameraFrame: {
    minHeight: 220,
    borderWidth: 1,
    borderColor: colors.ruleStrong,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: colors.ink,
  },
  camera: {
    flex: 1,
  },
  permissionButton: {
    marginTop: spacing[3],
  },
  previewCameraBadge: {
    marginTop: spacing[3],
    minHeight: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.green,
    backgroundColor: colors.lcd,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing[1],
  },
  previewCameraText: {
    ...type.buttonMono,
    color: colors.ink,
  },
  presets: {
    flexDirection: "row",
    gap: spacing[3],
    marginTop: spacing[3],
  },
  input: {
    minHeight: 40,
    borderWidth: 1,
    borderColor: colors.ruleStrong,
    borderRadius: 8,
    paddingHorizontal: spacing[4],
    textAlign: "center",
    backgroundColor: "rgba(255,255,255,0.24)",
    ...type.body,
    color: colors.ink,
  },
  memoInput: {
    minHeight: 38,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
    ...type.body,
    color: colors.ink,
  },
  actions: {
    flexDirection: "row",
    gap: spacing[3],
  },
});
