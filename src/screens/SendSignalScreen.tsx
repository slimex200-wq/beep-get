import React, { useEffect, useMemo, useRef, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { CameraView, useCameraPermissions } from "expo-camera";
import { colors, radius, spacing } from "@/design/tokens";
import { type } from "@/design/typography";
import { ActionButton } from "@/components/ActionButton";
import { AppSurface } from "@/components/AppSurface";
import { FriendPickerStrip, type PickableFriend } from "@/components/FriendPickerStrip";
import { HeaderBar } from "@/components/HeaderBar";
import { RecentSignalCombos, type RecentSignalCombo } from "@/components/RecentSignalCombos";
import { SignalSlotRail } from "@/components/SignalSlotRail";
import type { RootStackParamList } from "@/navigation/RootNavigator";
import { BLINK_DURATION_SECONDS, BLINK_MAX_BYTES, BLINK_MAX_DURATION_MS } from "@/lib/beepBlinkLimits";
import { isUiPreviewUser } from "@/lib/uiPreview";
import { sendBlinkVideo } from "@/services/blinkSendService";
import { useAuthStore } from "@/stores/authStore";
import { useDictionaryStore } from "@/stores/dictionaryStore";
import { useFriendStore } from "@/stores/friendStore";
import { useMessageStore } from "@/stores/messageStore";
import { SendBeepScreen } from "@/screens/SendBeepScreen";
import { SendBlinkScreen } from "@/screens/SendBlinkScreen";

type SendMode = "beep" | "blink";
type SendRouteParams = Partial<RootStackParamList["Send"]>;

const DEFAULT_SLOT_DECK = ["배고픔", "집중중", "끝나고", "8282", "486", "1004", "000"];

export function SendSignalScreen() {
  const route = useRoute();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const params = (route.params ?? {}) as SendRouteParams;
  const { profile } = useAuthStore();
  const { entries, fetch: fetchDictionary } = useDictionaryStore();
  const { friends, fetch: fetchFriends } = useFriendStore();
  const { send } = useMessageStore();
  const cameraRef = useRef<CameraView | null>(null);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [mode, setMode] = useState<SendMode>(params.mode ?? "beep");
  const [selectedRecipientId, setSelectedRecipientId] = useState<string | null>(params.friendId ?? null);
  const [code, setCode] = useState("");
  const [memo, setMemo] = useState("");
  const [sending, setSending] = useState(false);
  const [recording, setRecording] = useState(false);
  const previewMode = Boolean(profile && isUiPreviewUser(profile.id));

  useEffect(() => {
    if (!profile) return;
    fetchFriends(profile.id).catch(reportError);
    fetchDictionary(profile.id).catch(reportError);
  }, [profile?.id, fetchFriends, fetchDictionary]);

  useEffect(() => {
    if (params.mode) setMode(params.mode);
  }, [params.mode]);

  const friendOptions = useMemo<PickableFriend[]>(() => {
    const routeFriend = params.friendId
      ? [
          {
            id: params.friendId,
            name: params.friendName ?? "Friend",
            no: params.friendNo ?? friendNo(params.friendName),
            relation: "SELECTED",
          },
        ]
      : [];

    const storeFriends = friends.map((friend) => ({
      id: friend.friend_id,
      name: friend.nickname || friend.friend.nickname,
      no: friend.friend.beep_id.slice(-2),
      relation: friend.vibration_pattern || friend.friend.status_icon || "CLOSE",
    }));

    const byId = new Map<string, PickableFriend>();
    [...routeFriend, ...storeFriends].forEach((friend) => byId.set(friend.id, friend));
    return Array.from(byId.values());
  }, [friends, params.friendId, params.friendName, params.friendNo]);

  useEffect(() => {
    if (params.friendId) {
      setSelectedRecipientId(params.friendId);
      return;
    }

    if (!selectedRecipientId && friendOptions[0]) {
      setSelectedRecipientId(friendOptions[0].id);
    }
  }, [params.friendId, selectedRecipientId, friendOptions]);

  const recipient = friendOptions.find((friend) => friend.id === selectedRecipientId) ?? friendOptions[0] ?? null;

  const slotDeck = useMemo(() => {
    const userSlots = entries.map((entry) => entry.code).filter(Boolean);
    return Array.from(new Set([...userSlots, ...DEFAULT_SLOT_DECK])).slice(0, 8);
  }, [entries]);

  useEffect(() => {
    if (!code && slotDeck[0]) setCode(slotDeck[0]);
  }, [code, slotDeck]);

  const recentCombos = useMemo<RecentSignalCombo[]>(() => {
    return friendOptions.slice(0, 3).map((friend, index) => {
      const slot = slotDeck[index] ?? DEFAULT_SLOT_DECK[index] ?? "8282";
      return {
        id: `${friend.id}-${slot}`,
        friendId: friend.id,
        friendName: friend.name,
        friendNo: friend.no,
        slot,
        label: `${friend.name} + ${slot}`,
      };
    });
  }, [friendOptions, slotDeck]);

  const modeSwitch = (
    <View style={styles.switcher}>
      <ModeButton label="BEEP" active={mode === "beep"} onPress={() => setMode("beep")} />
      <ModeButton label="BLINK" active={mode === "blink"} onPress={() => setMode("blink")} />
    </View>
  );

  const deckHeader = recipient ? (
    <View style={styles.deck}>
      <Text style={type.tinyMono}>TO STRIP</Text>
      <FriendPickerStrip
        friends={friendOptions}
        selectedId={recipient.id}
        onSelect={(friend) => setSelectedRecipientId(friend.id)}
      />
      <Text style={type.tinyMono}>SIGNAL TYPE</Text>
      {modeSwitch}
      <Text style={type.tinyMono}>SLOT DECK</Text>
      <SignalSlotRail slots={slotDeck} selected={code} onSelect={setCode} />
      <Text style={type.tinyMono}>RECENT COMBOS</Text>
      <RecentSignalCombos
        combos={recentCombos}
        onSelect={(combo) => {
          setSelectedRecipientId(combo.friendId);
          setCode(combo.slot);
        }}
      />
    </View>
  ) : null;

  const goBackToFlow = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate("Main", { screen: "People" });
  };

  const openLogs = () => {
    navigation.navigate("Logs");
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
        <HeaderBar
          title="SEND SIGNAL"
          left="BACK"
          right="PEOPLE"
          onLeftPress={goBackToFlow}
          onRightPress={() => navigation.navigate("Main", { screen: "People" })}
        />
        <View style={styles.empty}>
          <View style={styles.emptyPanel}>
            <Text style={type.metaValue}>NO CLOSE CIRCUIT</Text>
            <Text style={type.bodyMuted}>
              Add a close-circuit friend first. Pick someone from People, then send a Beep or
              2-second Blink.
            </Text>
            <ActionButton
              label="OPEN PEOPLE"
              variant="dark"
              onPress={() => navigation.navigate("Main", { screen: "People" })}
            />
          </View>
        </View>
      </AppSurface>
    );
  }

  return mode === "beep" ? (
    <SendBeepScreen
      deckHeader={deckHeader}
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
      deckHeader={deckHeader}
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
  deck: {
    gap: spacing[3],
    marginBottom: spacing[4],
    marginHorizontal: spacing[5],
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.ruleStrong,
    borderRadius: radius.control,
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  switcher: {
    alignSelf: "stretch",
    backgroundColor: "rgba(10,10,10,0.04)",
    borderColor: colors.ruleStrong,
    borderRadius: radius.control,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing[2],
    padding: spacing[2],
  },
  empty: {
    flex: 1,
    justifyContent: "flex-start",
    gap: spacing[4],
    padding: spacing[6],
    paddingTop: spacing[20] * 4,
  },
  emptyPanel: {
    gap: spacing[4],
    padding: spacing[5],
    borderWidth: 1,
    borderColor: colors.ruleStrong,
    borderRadius: radius.control,
    backgroundColor: colors.paperWarm,
  },
});
