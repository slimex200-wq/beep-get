import React, { useEffect, useMemo, useRef, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { CameraView, useCameraPermissions } from "expo-camera";
import { colors, radius, spacing } from "@/design/tokens";
import { type } from "@/design/typography";
import { ActionButton } from "@/components/ActionButton";
import { AppSurface } from "@/components/AppSurface";
import { FriendPickerStrip, type PickableFriend } from "@/components/FriendPickerStrip";
import { HeaderBar } from "@/components/HeaderBar";
import { MockupCard, MockupSection, StatusPill } from "@/components/KotlinMockupUI";
import { SignalSlotRail } from "@/components/SignalSlotRail";
import type { RootStackParamList } from "@/navigation/RootNavigator";
import { BLINK_DURATION_SECONDS, BLINK_MAX_BYTES, BLINK_MAX_DURATION_MS } from "@/lib/beepBlinkLimits";
import { createBlinkDraft, type BlinkDraft } from "@/lib/blinkDraft";
import { DEMO_BLINK_FRAME_DATA_URIS } from "@/lib/demoBlinkFrameData";
import { isDemoFriend } from "@/lib/demoFriend";
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

const DEFAULT_SLOT_DECK = ["8282", "486", "1004", "7942", "0404"];

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
  const [blinkDraft, setBlinkDraft] = useState<BlinkDraft | null>(null);
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

  useEffect(() => {
    setBlinkDraft(null);
  }, [recipient?.id]);

  const slotDeck = useMemo(() => {
    const userSlots = entries.map((entry) => entry.code).filter(Boolean);
    return Array.from(new Set([...userSlots, ...DEFAULT_SLOT_DECK])).slice(0, 8);
  }, [entries]);

  useEffect(() => {
    if (!code && slotDeck[0]) setCode(slotDeck[0]);
  }, [code, slotDeck]);

  const modeSwitch = (
    <View style={styles.switcher}>
      <ModeButton label="BEEP" active={mode === "beep"} onPress={() => setMode("beep")} />
      <ModeButton label="BLINK" active={mode === "blink"} onPress={() => setMode("blink")} />
    </View>
  );

  const deckHeader = recipient ? (
    <View style={styles.deck}>
      <MockupCard soft style={styles.capturePreview}>
        <View style={styles.captureTopRow}>
          <StatusPill label={mode.toUpperCase()} tone={mode === "blink" ? "red" : "muted"} />
          <StatusPill label={mode === "blink" ? "2.0s" : "ready"} />
        </View>
        <View style={styles.captureGrid}>
          <View style={styles.crosshairHorizontal} />
          <View style={styles.crosshairVertical} />
          <View style={styles.crosshairCircle} />
        </View>
        <Text style={styles.captureHint}>Ready to transmit</Text>
      </MockupCard>
      <MockupSection label="Captured Frames" />
      <View style={styles.capturedRow}>
        {["#153E37", "#D17A23", "#E9C4A0"].map((color, index) => (
          <View key={color} style={[styles.capturedThumb, { backgroundColor: color }, index === 0 && styles.capturedActive]} />
        ))}
        <View style={styles.capturedCamera}>
          <Text style={styles.capturedCameraText}>▣</Text>
        </View>
      </View>
      <Text style={type.tinyMono}>TO:</Text>
      <FriendPickerStrip
        friends={friendOptions}
        selectedId={recipient.id}
        onSelect={(friend) => setSelectedRecipientId(friend.id)}
      />
      <Text style={type.tinyMono}>SIGNAL TYPE</Text>
      <View style={styles.inlineSwitch}>{modeSwitch}</View>
      <Text style={type.tinyMono}>SIGNAL DECK</Text>
      <SignalSlotRail slots={slotDeck} selected={code} onSelect={setCode} />
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
    if (isDemoFriend(recipient.id)) {
      Alert.alert(
        "Beepy is a demo friend",
        `${code} 송신 시연이에요. 진짜 친구는 FRIENDS 에서 Beep ID 로 추가하세요.`,
      );
      setMemo("");
      return;
    }
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

    if (isDemoFriend(recipient.id)) {
      Alert.alert(
        "Beepy is a demo friend",
        "Blink 시연은 진짜 친구가 추가된 뒤에 가능합니다.",
      );
      return;
    }

    if (!blinkDraft && previewMode) {
      setBlinkDraft(createPreviewBlinkDraft());
      Alert.alert("Blink preview", `3 frame Blink preview is ready for ${recipient.name}`);
      return;
    }

    if (blinkDraft) {
      if (previewMode) {
        Alert.alert("Blink preview", `2 sec Blink previewed to ${recipient.name}`);
        setBlinkDraft(null);
        setMemo("");
        return;
      }

      setSending(true);
      try {
        await sendBlinkVideo({
          senderId: profile.id,
          receiverId: recipient.id,
          code,
          memo: memo || undefined,
          video: blinkDraft.video,
          createTeaser: async () => blinkDraft.teaser,
        });
        Alert.alert("Blink sent", `2 sec Blink to ${recipient.name}`);
        setBlinkDraft(null);
        setMemo("");
      } catch (err: any) {
        Alert.alert("Blink failed", err?.message ?? "Try again.");
      } finally {
        setSending(false);
      }
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

      const draft = await createBlinkDraft({
        senderId: profile.id,
        receiverId: recipient.id,
        videoUri: captured.uri,
      });
      setBlinkDraft(draft);
      Alert.alert("Blink preview ready", "Check the 3 frames, then send or retake.");
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
          title="Send"
          left="BACK"
          right="FRIENDS"
          onLeftPress={goBackToFlow}
          onRightPress={() => navigation.navigate("Main", { screen: "People" })}
        />
        <ScrollView contentContainerStyle={styles.emptyContent} showsVerticalScrollIndicator={false}>
          <View style={styles.emptyDeck}>
            <View style={styles.emptyDeckTop}>
              <View>
                <Text style={type.tinyMono}>SIGNAL DECK</Text>
                <Text style={styles.emptyDeckTitle}>Pick a close friend first</Text>
              </View>
              <View style={styles.emptyBadge}>
                <Text style={type.tinyMono}>NO FRIEND</Text>
              </View>
            </View>

            <Text style={type.bodyMuted}>
              Add a friend to unlock the To strip, Blink capture, reply chips, and outgoing summary.
            </Text>

            <Text style={type.tinyMono}>TO:</Text>
            <Text style={type.tinyMono}>SIGNAL TYPE</Text>
            {modeSwitch}

            <Text style={type.tinyMono}>SIGNAL DECK</Text>
            <View style={styles.slotPreviewRow}>
              {DEFAULT_SLOT_DECK.slice(0, 5).map((slot) => (
                <View key={slot} style={styles.slotPreviewChip}>
                  <Text style={styles.slotPreviewText}>{slot}</Text>
                </View>
              ))}
            </View>

            <ActionButton
              label="OPEN FRIENDS"
              variant="dark"
              onPress={() => navigation.navigate("Main", { screen: "People" })}
            />
          </View>
        </ScrollView>
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
      hasCapturedBlink={Boolean(blinkDraft)}
      previewFrameUris={blinkDraft?.previewFrameUris}
      cameraPermissionGranted={Boolean(cameraPermission?.granted)}
      cameraRef={cameraRef}
      onCodeChange={setCode}
      onMemoChange={setMemo}
      onPreset={setCode}
      onRequestPermission={() => requestCameraPermission()}
      onSend={sendBlink}
      onRetake={() => setBlinkDraft(null)}
      onBack={goBackToFlow}
      onOpenLogs={openLogs}
      previewMode={previewMode}
    />
  );
}

function createPreviewBlinkDraft(): BlinkDraft {
  return {
    video: {
      uri: "preview-private-playback",
      durationMs: BLINK_MAX_DURATION_MS,
      mimeType: "video/mp4",
    },
    teaser: {
      thumbnailKey: null,
      stripKeys: [],
      assets: DEMO_BLINK_FRAME_DATA_URIS.map((uri, index) => ({
        uri,
        objectKey: `preview-strip-${index + 1}`,
        mimeType: "image/jpeg" as const,
        timeMs: Math.floor(BLINK_MAX_DURATION_MS * (index / 3)),
      })),
    },
    previewFrameUris: [...DEMO_BLINK_FRAME_DATA_URIS],
  };
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
    marginBottom: spacing[3],
    marginHorizontal: spacing[5],
    padding: spacing[3],
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
  },
  capturePreview: {
    minHeight: 116,
    padding: spacing[4],
    gap: spacing[3],
  },
  captureTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  captureGrid: {
    flex: 1,
    minHeight: 64,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  crosshairHorizontal: {
    position: "absolute",
    width: "72%",
    height: 1,
    backgroundColor: "rgba(10,10,10,0.08)",
  },
  crosshairVertical: {
    position: "absolute",
    width: 1,
    height: "72%",
    backgroundColor: "rgba(10,10,10,0.08)",
  },
  crosshairCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "rgba(10,10,10,0.10)",
  },
  captureHint: {
    ...type.tinyMono,
    textAlign: "center",
  },
  capturedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
  },
  capturedThumb: {
    width: 48,
    height: 38,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: colors.rule,
  },
  capturedActive: {
    borderColor: colors.ink,
    borderWidth: 2,
  },
  capturedCamera: {
    width: 42,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 7,
    backgroundColor: "#F0EEE9",
  },
  capturedCameraText: {
    ...type.metaValue,
  },
  inlineSwitch: {
    maxWidth: 260,
  },
  switcher: {
    alignSelf: "stretch",
    backgroundColor: "rgba(10,10,10,0.03)",
    borderColor: colors.ruleStrong,
    borderRadius: radius.control,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing[2],
    padding: spacing[2],
  },
  emptyContent: {
    flexGrow: 1,
    justifyContent: "flex-start",
    padding: spacing[5],
    paddingBottom: 96,
    gap: spacing[5],
  },
  emptyDeck: {
    gap: spacing[4],
    padding: spacing[5],
    borderWidth: 1,
    borderColor: colors.ruleStrong,
    borderRadius: 12,
    backgroundColor: colors.paperWarm,
  },
  emptyDeckTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing[4],
    paddingBottom: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
  },
  emptyDeckTitle: {
    ...type.slipTitle,
  },
  emptyBadge: {
    borderWidth: 1,
    borderColor: colors.ruleStrong,
    borderRadius: radius.pill,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    backgroundColor: colors.paper,
  },
  slotPreviewRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing[2],
  },
  slotPreviewChip: {
    minHeight: 34,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.ruleStrong,
    borderRadius: radius.button,
    paddingHorizontal: spacing[4],
    backgroundColor: colors.paper,
  },
  slotPreviewText: {
    ...type.buttonMono,
    color: colors.ink,
  },
});
