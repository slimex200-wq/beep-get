import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { CameraView } from "expo-camera";
import { colors, radius, spacing } from "@/design/tokens";
import { type } from "@/design/typography";

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
  return (
    <View style={styles.blinkPanel}>
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
            <View key={label} style={styles.frameThumb}>
              {frameUris[index] ? (
                <Image source={{ uri: frameUris[index] }} style={styles.frameImage} resizeMode="cover" />
              ) : (
                <Text style={styles.frameText}>{label}</Text>
              )}
            </View>
          ))}
        </View>
      )}
      <Text style={styles.blinkHint}>
        {recording ? "Recording 2.0s" : hasCapturedBlink ? "3 frames ready" : "2.0s private Blink"}
      </Text>
      {hasCapturedBlink ? (
        <Pressable accessibilityLabel="Retake Blink" onPress={onRetake}>
          <Text style={styles.retakeText}>Retake</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  blinkPanel: { minHeight: 104, gap: spacing[2], padding: spacing[3], borderWidth: 1, borderColor: "rgba(10,10,10,0.14)", borderRadius: radius.control, backgroundColor: "#FFFDF9" },
  camera: { minHeight: 76, overflow: "hidden", borderRadius: 7, backgroundColor: colors.ink },
  frameRow: { minHeight: 74, flexDirection: "row", gap: spacing[2] },
  frameThumb: { flex: 1, alignItems: "center", justifyContent: "center", overflow: "hidden", borderRadius: 7, backgroundColor: "#EAE4DA" },
  frameImage: { width: "100%", height: "100%" },
  frameText: { ...type.tinyMono, color: colors.muted },
  blinkHint: { ...type.tinyMono, textAlign: "center", color: colors.muted },
  retakeText: { ...type.tinyMono, alignSelf: "center", color: colors.lavender },
});
