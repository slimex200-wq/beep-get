import React, { useEffect, useRef, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { CameraView, useCameraPermissions } from "expo-camera";
import { colors, radius, spacing } from "@/design/tokens";
import { type } from "@/design/typography";
import { ActionButton } from "@/components/ActionButton";
import { AppSurface } from "@/components/AppSurface";
import type { RootStackParamList } from "@/navigation/RootNavigator";
import { BLINK_DURATION_SECONDS, BLINK_MAX_BYTES, BLINK_MAX_DURATION_MS } from "@/lib/beepBlinkLimits";
import { isUiPreviewUser } from "@/lib/uiPreview";
import { sendBlinkVideo } from "@/services/blinkSendService";
import { useAuthStore } from "@/stores/authStore";
import { useFriendStore } from "@/stores/friendStore";
import { useMessageStore } from "@/stores/messageStore";
import { SendBeepScreen } from "@/screens/SendBeepScreen";
import { SendBlinkScreen } from "@/screens/SendBlinkScreen";

type SendMode = "beep" | "blink";
type SendRouteParams = Partial<RootStackParamList["Send"]>;

export function SendSignalScreen() {
  const route = useRoute();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const params = (route.params ?? {}) as SendRouteParams;
  const { profile } = useAuthStore();
  const { friends, fetch: fetchFriends } = useFriendStore();
  const { send } = useMessageStore();
  const cameraRef = useRef<CameraView | null>(null);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [mode, setMode] = useState<SendMode>("beep");
  const [code, setCode] = useState("8282");
  const [memo, setMemo] = useState("");
  const [sending, setSending] = useState(false);
  const [recording, setRecording] = useState(false);
  const previewMode = Boolean(profile && isUiPreviewUser(profile.id));

  useEffect(() => {
    if (!profile) return;
    fetchFriends(profile.id).catch(reportError);
  }, [profile?.id, fetchFriends]);

  const fallbackFriend = friends[0];
  const recipient = params.friendId
    ? {
        id: params.friendId,
        name: params.friendName ?? "Friend",
        no: params.friendNo ?? friendNo(params.friendName),
      }
    : fallbackFriend
      ? {
          id: fallbackFriend.friend_id,
          name: fallbackFriend.nickname || fallbackFriend.friend.nickname,
          no: fallbackFriend.friend.beep_id.slice(-2),
        }
      : null;

  const modeSwitch = (
    <View style={styles.switcher}>
      <ModeButton label="BEEP" active={mode === "beep"} onPress={() => setMode("beep")} />
      <ModeButton label="BLINK" active={mode === "blink"} onPress={() => setMode("blink")} />
    </View>
  );

  const goBackToFlow = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate("Main", { screen: "People" });
  };

  const openLogs = () => {
    navigation.navigate("Main", { screen: "Logs" });
  };

  const sendBeep = async () => {
    if (!profile || !recipient || !code || sending) return;
    setSending(true);
    try {
      await send(profile.id, recipient.id, code, memo || undefined);
      Alert.alert("Beep sent", `${code} to ${recipient.name}`);
      setMemo("");
    } catch (err: any) {
      Alert.alert("Beep failed", err?.message ?? "Try again.");
    } finally {
      setSending(false);
    }
  };

  const sendBlink = async () => {
    if (!profile || !recipient || !code || sending || recording) return;

    if (previewMode) {
      Alert.alert("Blink preview", `2 sec Blink previewed to ${recipient.name}`);
      return;
    }

    const permission = cameraPermission?.granted
      ? cameraPermission
      : await requestCameraPermission();
    if (!permission.granted) {
      Alert.alert("Camera required", "Blink needs camera access to capture a 2 second video.");
      return;
    }
    if (!cameraRef.current) {
      Alert.alert("Camera not ready", "Give the lens a second, then try again.");
      return;
    }

    setRecording(true);
    setSending(true);
    try {
      const captured = await cameraRef.current.recordAsync({
        maxDuration: BLINK_DURATION_SECONDS,
        maxFileSize: BLINK_MAX_BYTES,
      });
      if (!captured?.uri) throw new Error("Camera did not return a video file.");

      await sendBlinkVideo({
        senderId: profile.id,
        receiverId: recipient.id,
        code,
        memo: memo || undefined,
        video: {
          uri: captured.uri,
          durationMs: BLINK_MAX_DURATION_MS,
          mimeType: "video/mp4",
        },
      });
      Alert.alert("Blink sent", `2 sec Blink to ${recipient.name}`);
      setMemo("");
    } catch (err: any) {
      Alert.alert("Blink failed", err?.message ?? "Try again.");
    } finally {
      setRecording(false);
      setSending(false);
    }
  };

  if (!recipient) {
    return (
      <AppSurface>
        <View style={styles.empty}>
          <Text style={type.metaValue}>NO RECIPIENT</Text>
          <Text style={type.bodyMuted}>Add a close-circuit friend before sending a slip.</Text>
          <ActionButton label="OPEN PEOPLE" variant="dark" onPress={() => navigation.navigate("Main")} />
        </View>
      </AppSurface>
    );
  }

  return mode === "beep" ? (
    <SendBeepScreen
      modeSwitch={modeSwitch}
      recipientName={recipient.name}
      recipientNo={recipient.no}
      code={code}
      memo={memo}
      sending={sending}
      onCodeChange={setCode}
      onMemoChange={setMemo}
      onPreset={setCode}
      onSend={sendBeep}
      onBack={goBackToFlow}
      onOpenLogs={openLogs}
    />
  ) : (
    <SendBlinkScreen
      modeSwitch={modeSwitch}
      recipientName={recipient.name}
      recipientNo={recipient.no}
      code={code}
      memo={memo}
      sending={sending}
      recording={recording}
      cameraPermissionGranted={Boolean(cameraPermission?.granted)}
      cameraRef={cameraRef}
      onCodeChange={setCode}
      onMemoChange={setMemo}
      onPreset={setCode}
      onRequestPermission={() => requestCameraPermission()}
      onSend={sendBlink}
      onRetake={() => setMemo("")}
      onBack={goBackToFlow}
      onOpenLogs={openLogs}
      previewMode={previewMode}
    />
  );
}

function ModeButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <ActionButton label={label} mono flex variant={active ? "dark" : "light"} onPress={onPress} />
  );
}

function friendNo(label?: string) {
  const digits = label?.replace(/\D/g, "");
  return digits?.slice(-2) || "01";
}

function reportError(err: unknown) {
  const message = err instanceof Error ? err.message : "Unexpected error";
  Alert.alert("BEEP-GET", message);
}

const styles = StyleSheet.create({
  switcher: {
    alignSelf: "center",
    backgroundColor: "rgba(10,10,10,0.04)",
    borderColor: colors.ruleStrong,
    borderRadius: radius.control,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing[2],
    marginBottom: spacing[4],
    marginHorizontal: spacing[5],
    padding: spacing[2],
    width: "92%",
    maxWidth: 430,
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    gap: spacing[4],
    padding: spacing[6],
  },
});
