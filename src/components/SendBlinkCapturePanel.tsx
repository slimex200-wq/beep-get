import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { CameraView } from "expo-camera";
import { colors, radius, spacing } from "@/design/tokens";
import { type } from "@/design/typography";
import { useAppPalette } from "@/design/appTheme";

type Props = {
  readonly cameraRef: React.RefObject<CameraView | null>;
  readonly cameraPermissionGranted: boolean;
  readonly previewMode: boolean;
  readonly frameUris: readonly string[];
  readonly recording: boolean;
  readonly hasCapturedBlink: boolean;
  readonly onRetake: () => void;
};

export function BlinkCapturePanel({
  cameraRef,
  cameraPermissionGranted,
  previewMode,
  frameUris,
  recording,
  hasCapturedBlink,
  onRetake,
}: Props) {
  const palette = useAppPalette();

  return (
    <View style={[styles.blinkPanel, { backgroundColor: palette.card, borderColor: palette.rule }]}>
      {cameraPermissionGranted && !previewMode && !hasCapturedBlink ? (
        <CameraView
          ref={cameraRef}
          active
          facing="front"
          mirror
          mute
          mode="video"
          videoBitrate={2500000}
          videoQuality="480p"
          style={styles.camera}
        />
      ) : (
        <View style={styles.frameRow}>
          {["0.0s", "0.7s", "1.3s"].map((label, index) => (
            <View key={label} style={[styles.frameThumb, { backgroundColor: palette.input }]}>
              {frameUris[index] ? (
                <Image source={{ uri: frameUris[index] }} style={styles.frameImage} resizeMode="cover" />
              ) : (
                <Text style={[styles.frameText, { color: palette.muted }]}>{label}</Text>
              )}
            </View>
          ))}
        </View>
      )}
      <View style={styles.hintRow}>
        {recording ? <View style={[styles.recDot, { backgroundColor: palette.sig }]} /> : null}
        <Text style={[styles.blinkHint, { color: recording ? palette.sig : palette.muted }]}>
          {recording ? "REC 2.0s" : hasCapturedBlink ? "3 frames ready" : "2.0s private Blink"}
        </Text>
      </View>
      {hasCapturedBlink ? (
        <Pressable accessibilityLabel="Retake Blink" onPress={onRetake}>
          <Text style={[styles.retakeText, { color: palette.text }]}>Retake</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  blinkPanel: { minHeight: 104, gap: spacing[2], padding: spacing[3], borderWidth: 1, borderRadius: radius.control },
  camera: { minHeight: 76, overflow: "hidden", borderRadius: 7, backgroundColor: colors.ink },
  frameRow: { minHeight: 74, flexDirection: "row", gap: spacing[2] },
  frameThumb: { flex: 1, alignItems: "center", justifyContent: "center", overflow: "hidden", borderRadius: 7 },
  frameImage: { width: "100%", height: "100%" },
  frameText: { ...type.tinyMono },
  hintRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing[2] },
  recDot: { width: 8, height: 8, borderRadius: radius.pill },
  blinkHint: { ...type.tinyMono, textAlign: "center" },
  retakeText: { ...type.tinyMono, alignSelf: "center" },
});
