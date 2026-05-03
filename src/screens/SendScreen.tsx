import React, { useMemo, useRef, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import {
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import { useTheme } from "@/theme/ThemeProvider";
import { CodeInput } from "@/components/CodeInput";
import { BeepButton } from "@/components/BeepButton";
import { useMessageStore } from "@/stores/messageStore";
import { useAuthStore } from "@/stores/authStore";
import {
  BLINK_DURATION_SECONDS,
  BLINK_MAX_BYTES,
  BLINK_MAX_DURATION_MS,
} from "@/lib/beepBlinkLimits";
import { isUiPreviewUser } from "@/lib/uiPreview";
import { sendBlinkVideo } from "@/services/blinkSendService";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/navigation/RootNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "Send">;
type SendMode = "beep" | "blink";

export function SendScreen({ route, navigation }: Props) {
  const theme = useTheme();
  const { friendId, friendName } = route.params;
  const { profile } = useAuthStore();
  const { send } = useMessageStore();
  const cameraRef = useRef<CameraView | null>(null);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [code, setCode] = useState("");
  const [memo, setMemo] = useState("");
  const [mode, setMode] = useState<SendMode>("beep");
  const [sending, setSending] = useState(false);
  const [recording, setRecording] = useState(false);

  const handleSendBeep = async () => {
    if (!profile || !code) return;
    setSending(true);
    try {
      await send(profile.id, friendId, code, memo || undefined);
      Alert.alert("Beep sent", `${code} to ${friendName}`);
      navigation.goBack();
    } catch (err: any) {
      Alert.alert("Beep failed", err.message);
    } finally {
      setSending(false);
    }
  };

  const ensureCameraPermission = async () => {
    if (cameraPermission?.granted) return true;
    const nextPermission = await requestCameraPermission();
    if (nextPermission.granted) return true;

    Alert.alert(
      "Camera required",
      "Blink needs camera access to capture a 2 second video."
    );
    return false;
  };

  const handleSendBlink = async () => {
    if (!profile || !code || sending || recording) return;

    if (isUiPreviewUser(profile.id)) {
      Alert.alert("Blink preview", `2 sec Blink previewed to ${friendName}`);
      navigation.goBack();
      return;
    }

    const hasPermission = await ensureCameraPermission();
    if (!hasPermission) return;
    if (!cameraRef.current) {
      Alert.alert("Camera not ready", "Give the preview a second, then try again.");
      return;
    }

    setRecording(true);
    setSending(true);
    try {
      const captured = await cameraRef.current.recordAsync({
        maxDuration: BLINK_DURATION_SECONDS,
        maxFileSize: BLINK_MAX_BYTES,
      });

      if (!captured?.uri) {
        throw new Error("Camera did not return a video file.");
      }

      await sendBlinkVideo({
        senderId: profile.id,
        receiverId: friendId,
        code,
        memo: memo || undefined,
        video: {
          uri: captured.uri,
          durationMs: BLINK_MAX_DURATION_MS,
          mimeType: "video/mp4",
        },
      });

      Alert.alert("Blink sent", `2 sec Blink to ${friendName}`);
      navigation.goBack();
    } catch (err: any) {
      Alert.alert("Blink failed", err.message ?? "Try again.");
    } finally {
      setRecording(false);
      setSending(false);
    }
  };

  const handleSend = mode === "beep" ? handleSendBeep : handleSendBlink;
  const actionTitle =
    mode === "blink" ? (recording ? "RECORDING 2 SEC" : "SEND BLINK") : "SEND BEEP";
  const disabled = !code || sending || recording;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: theme.colors.background,
        },
        content: {
          padding: theme.spacing.lg,
          gap: theme.spacing.lg,
        },
        to: {
          fontFamily: theme.fonts.lcd,
          fontSize: 20,
          color: theme.colors.primary,
          textAlign: "center",
          marginTop: theme.spacing.xl,
        },
        modePanel: {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.borderRadius.md,
          borderWidth: 1,
          padding: theme.spacing.sm,
          gap: theme.spacing.sm,
          ...theme.shadows.raised,
        },
        modeLabel: {
          color: theme.colors.textSecondary,
          fontFamily: theme.fonts.pixel,
          fontSize: 10,
          letterSpacing: 1.4,
          textAlign: "center",
        },
        modeRow: {
          flexDirection: "row",
          gap: theme.spacing.sm,
        },
        modeTab: {
          alignItems: "center",
          borderColor: theme.colors.border,
          borderRadius: theme.borderRadius.sm,
          borderWidth: 1,
          flex: 1,
          paddingVertical: 12,
        },
        modeTabActive: {
          backgroundColor: theme.colors.background,
          borderColor: theme.colors.primary,
        },
        modeTabText: {
          color: theme.colors.textSecondary,
          fontFamily: theme.fonts.pixel,
          fontSize: 10,
        },
        modeTabTextActive: {
          color: theme.colors.primary,
        },
        blinkPanel: {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.textPrimary,
          borderRadius: theme.borderRadius.md,
          borderWidth: 1,
          overflow: "hidden",
        },
        blinkHeader: {
          alignItems: "center",
          borderBottomColor: theme.colors.textPrimary,
          borderBottomWidth: 1,
          flexDirection: "row",
          justifyContent: "space-between",
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.sm,
        },
        blinkTitle: {
          color: theme.colors.textPrimary,
          fontFamily: theme.fonts.pixel,
          fontSize: 10,
          letterSpacing: 1.2,
        },
        blinkLimit: {
          color: theme.colors.textSecondary,
          fontFamily: theme.fonts.mono,
          fontSize: 10,
        },
        cameraFrame: {
          aspectRatio: 1,
          backgroundColor: theme.colors.background,
        },
        camera: {
          flex: 1,
        },
        permissionBox: {
          alignItems: "center",
          flex: 1,
          gap: theme.spacing.md,
          justifyContent: "center",
          padding: theme.spacing.lg,
        },
        permissionText: {
          color: theme.colors.textPrimary,
          fontFamily: theme.fonts.lcd,
          fontSize: 18,
          textAlign: "center",
        },
        blinkMeta: {
          borderTopColor: theme.colors.textPrimary,
          borderTopWidth: 1,
          color: theme.colors.textSecondary,
          fontFamily: theme.fonts.mono,
          fontSize: 10,
          letterSpacing: 1.2,
          padding: theme.spacing.sm,
          textAlign: "center",
        },
      }),
    [theme]
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.to}>TO: {friendName}</Text>

      <View style={styles.modePanel}>
        <Text style={styles.modeLabel}>SIGNAL TYPE</Text>
        <View style={styles.modeRow}>
          {(["beep", "blink"] as const).map((value) => {
            const active = mode === value;
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                key={value}
                onPress={() => setMode(value)}
                style={[styles.modeTab, active && styles.modeTabActive]}
              >
                <Text
                  style={[
                    styles.modeTabText,
                    active && styles.modeTabTextActive,
                  ]}
                >
                  {value.toUpperCase()}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <CodeInput value={code} onChangeText={setCode} label="NUMBER CODE" />
      <CodeInput
        value={memo}
        onChangeText={setMemo}
        label="MEMO (OPTIONAL)"
        placeholder="tiny note"
        maxLength={30}
      />

      {mode === "blink" && (
        <View style={styles.blinkPanel}>
          <View style={styles.blinkHeader}>
            <Text style={styles.blinkTitle}>BLINK CAPTURE</Text>
            <Text style={styles.blinkLimit}>2 SEC / 750 KB</Text>
          </View>
          <View style={styles.cameraFrame}>
            {cameraPermission?.granted ? (
              <CameraView
                ref={cameraRef}
                active={mode === "blink"}
                facing="front"
                mirror
                mode="video"
                mute
                style={styles.camera}
                videoBitrate={2500000}
                videoQuality="480p"
              />
            ) : (
              <View style={styles.permissionBox}>
                <Text style={styles.permissionText}>
                  Camera opens when you send a Blink.
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.blinkMeta}>
            FRONT CAMERA / PRIVATE SIGNED UPLOAD / NO PUBLIC URL
          </Text>
        </View>
      )}

      <BeepButton title={actionTitle} onPress={handleSend} disabled={disabled} />
    </ScrollView>
  );
}
