import React, { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { CameraView, useCameraPermissions } from "expo-camera";
import { colors, radius, spacing } from "@/design/tokens";
import { type } from "@/design/typography";
import { ActionButton } from "@/components/ActionButton";
import { AppSurface } from "@/components/AppSurface";
import { FriendPickerStrip, type PickableFriend } from "@/components/FriendPickerStrip";
import { KotlinHeader, MockupCard, StatusPill } from "@/components/KotlinMockupUI";
import {
  CameraLineIcon,
  GearLineIcon,
  SendPlaneIcon,
} from "@/components/MockupLineIcons";
import { SignalSlotRail } from "@/components/SignalSlotRail";
import type { RootStackParamList } from "@/navigation/RootNavigator";
import { getMockupFriendPhotoUri, mockupPhotoUris } from "@/design/mockupPhotos";
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
type CameraCaptureMode = "picture" | "video";
type SendRouteParams = Partial<RootStackParamList["Send"]>;

const DEFAULT_SLOT_DECK = ["8282", "486", "1004", "7942", "0404"];

export function SendSignalScreen() {
  const route = useRoute();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const params = (route.params ?? {}) as SendRouteParams;
  const isModalFlow = route.name === "Send";
  const { profile } = useAuthStore();
  const { entries, fetch: fetchDictionary } = useDictionaryStore();
  const { friends, fetch: fetchFriends } = useFriendStore();
  const { send } = useMessageStore();
  const cameraRef = useRef<CameraView | null>(null);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [mode, setMode] = useState<SendMode>(params.mode ?? "beep");
  const [selectedRecipientId, setSelectedRecipientId] = useState<string | null>(params.friendId ?? null);
  const [code, setCode] = useState(params.initialCode ?? "");
  const [memo, setMemo] = useState("");
  const [sending, setSending] = useState(false);
  const [recording, setRecording] = useState(false);
  const [blinkDraft, setBlinkDraft] = useState<BlinkDraft | null>(null);
  const [captureStatus, setCaptureStatus] = useState("Ready to capture Blink");
  const [cameraMode, setCameraMode] = useState<CameraCaptureMode>("picture");
  const [sendSettingsVisible, setSendSettingsVisible] = useState(false);
  const [sentFeedback, setSentFeedback] = useState(false);
  const previewMode = Boolean(profile && isUiPreviewUser(profile.id));
  const headerAvatarUri = profile?.avatar_url ?? mockupPhotoUris.profile;

  useEffect(() => {
    if (!profile) return;
    fetchFriends(profile.id).catch(reportError);
    fetchDictionary(profile.id).catch(reportError);
  }, [profile?.id, fetchFriends, fetchDictionary]);

  useEffect(() => {
    if (params.mode) setMode(params.mode);
  }, [params.mode]);

  useEffect(() => {
    if (params.initialCode) setCode(params.initialCode);
  }, [params.initialCode]);

  const friendOptions = useMemo<PickableFriend[]>(() => {
    const routeFriend = params.friendId
      ? [
          {
            id: params.friendId,
            name: params.friendName ?? "Friend",
            no: params.friendNo ?? friendNo(params.friendName),
            relation: "SELECTED",
            avatarUri: getMockupFriendPhotoUri(params.friendName ?? "Friend", 0),
          },
        ]
      : [];

    const storeFriends = friends.map((friend, index) => ({
      id: friend.friend_id,
      name: friend.nickname || friend.friend.nickname,
      no: friend.friend.beep_id.slice(-2),
      relation: friend.vibration_pattern || friend.friend.status_icon || "CLOSE",
      avatarUri: getMockupFriendPhotoUri(friend.nickname || friend.friend.nickname, index),
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
    setCaptureStatus("Ready to capture Blink");
  }, [recipient?.id]);

  const slotDeck = useMemo(() => {
    const userSlots = entries.map((entry) => entry.code).filter(Boolean);
    return Array.from(new Set([DEFAULT_SLOT_DECK[0], ...userSlots, ...DEFAULT_SLOT_DECK])).slice(0, 5);
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

  const openPeople = () => {
    navigation.navigate("Main", { screen: "People" });
  };

  const selectRecipient = (friend: PickableFriend) => {
    setSelectedRecipientId(friend.id);
  };

  const selectSlot = (slot: string) => {
    setCode(slot);
  };

  const openSendSettings = () => {
    setSendSettingsVisible(true);
  };

  const closeSendSettings = () => {
    setSendSettingsVisible(false);
  };

  const clearBlinkDraft = () => {
    setBlinkDraft(null);
    setCaptureStatus("Ready to capture Blink");
    setSentFeedback(false);
  };

  const flashSentFeedback = () => {
    setSentFeedback(true);
    setTimeout(() => setSentFeedback(false), 1400);
  };

  const visibleFrameUris = useMemo(() => {
    if (blinkDraft?.previewFrameUris?.length) return blinkDraft.previewFrameUris.slice(0, 3);
    return [];
  }, [blinkDraft?.previewFrameUris]);

  const prepareCameraMode = async (nextMode: CameraCaptureMode) => {
    setCameraMode(nextMode);
    await new Promise((resolve) => setTimeout(resolve, 120));
  };

  const deckHeader = recipient ? (
    <View style={styles.deck}>
      <View style={styles.deckSection}>
        <Text style={styles.deckLabel}>SEND TYPE</Text>
        {modeSwitch}
      </View>
      <MockupCard soft style={mode === "beep" ? styles.beepCapturePreview : styles.capturePreview}>
        <View style={styles.captureTopRow}>
          <StatusPill label={mode === "blink" ? "BLINK" : "BEEP"} tone={mode === "blink" ? "red" : "muted"} />
          <StatusPill label={mode === "blink" ? "2.0s" : "ready"} />
        </View>
        {mode === "blink" ? (
          cameraPermission?.granted && !previewMode ? (
            <View style={styles.captureCameraFrame}>
              <CameraView
                ref={cameraRef}
                active
                facing="front"
                mirror
                mute
                style={styles.captureCamera}
                mode={cameraMode}
                videoBitrate={2500000}
                videoQuality="480p"
              />
            </View>
          ) : (
            <CaptureReticlePanel />
          )
        ) : (
          <View style={styles.captureFramesBlock}>
            <Text style={styles.captureFramesLabel}>SM WIDGET PREVIEW</Text>
            <SmBeepWidgetPreview code={code} recipientName={recipient.name} />
          </View>
        )}
        {mode === "blink" ? (
          <>
            <Text style={styles.captureHint}>
              {recording ? "Recording 2 second Blink" : captureStatus}
            </Text>
            <View style={styles.captureFramesBlock}>
              <Text style={styles.captureFramesLabel}>MD WIDGET PREVIEW</Text>
              <BlinkMdWidgetPreview code={code} recipientName={recipient.name} frameUris={visibleFrameUris} />
            </View>
          </>
        ) : null}
      </MockupCard>
      <View style={styles.deckSection}>
        <Text style={styles.deckLabel}>TO:</Text>
        <FriendPickerStrip
          friends={friendOptions}
          selectedId={recipient.id}
          onSelect={selectRecipient}
          onAddPress={openPeople}
        />
      </View>
      <View style={styles.deckSection}>
        <Text style={styles.deckLabel}>SIGNAL DECK</Text>
        <SignalSlotRail compact slots={slotDeck} selected={code} onSelect={selectSlot} />
      </View>
    </View>
  ) : null;

  const goBackToFlow = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate("Main", { screen: "People" });
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
      flashSentFeedback();
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
      setCaptureStatus("3 frames extracted from preview Blink");
      Alert.alert("Blink preview", `3 frame Blink preview is ready for ${recipient.name}`);
      return;
    }

    if (blinkDraft) {
      if (previewMode) {
        flashSentFeedback();
        setCaptureStatus(`Sent to ${recipient.name}`);
        setBlinkDraft(null);
        setMemo("");
        setTimeout(() => setCaptureStatus("Ready to capture Blink"), 1400);
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
        flashSentFeedback();
        setCaptureStatus(`Sent to ${recipient.name}`);
        setBlinkDraft(null);
        setMemo("");
        setTimeout(() => setCaptureStatus("Ready to capture Blink"), 1400);
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
      await prepareCameraMode("video");
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
      setCaptureStatus("3 frames extracted from 2s Blink");
      Alert.alert("Blink preview ready", "Check the 3 frames, then send or retake.");
    } catch (err: any) {
      Alert.alert("Blink failed", err?.message ?? "Try again.");
    } finally {
      setRecording(false);
      setSending(false);
      setCameraMode("picture");
    }
  };

  if (!recipient) {
    return (
      <AppSurface backgroundColor="#F8F6F1">
        <KotlinHeader
          title="Send"
          centered
          avatarSource={{ uri: headerAvatarUri }}
          actions={[
            {
              label: "Settings",
              icon: <GearLineIcon />,
              accessibilityLabel: "Send settings",
              onPress: openSendSettings,
            },
          ]}
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
              Add a friend to unlock the To strip, Beep codes, optional Blink capture, and outgoing summary.
            </Text>

            <Text style={type.tinyMono}>TO:</Text>
            <Text style={type.tinyMono}>SEND TYPE</Text>
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
        <SendSettingsSheet
          visible={sendSettingsVisible}
          blinkFrameCount={visibleFrameUris.length}
          onClose={closeSendSettings}
          onClearDraft={clearBlinkDraft}
        />
      </AppSurface>
    );
  }

  const activeScreen = mode === "beep" ? (
    <SendBeepScreen
      deckHeader={deckHeader}
      recipientName={recipient.name}
      recipientNo={recipient.no}
      code={code}
      memo={memo}
      sending={sending}
      sentFeedback={sentFeedback}
      onCodeChange={setCode}
      onMemoChange={setMemo}
      onPreset={setCode}
      onSend={sendBeep}
      onBack={goBackToFlow}
      onOpenSettings={openSendSettings}
      headerAvatarUri={headerAvatarUri}
      showBackAction={isModalFlow}
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
      sentFeedback={sentFeedback}
      previewFrameUris={blinkDraft?.previewFrameUris}
      cameraPermissionGranted={Boolean(cameraPermission?.granted)}
      cameraRef={cameraRef}
      onCodeChange={setCode}
      onMemoChange={setMemo}
      onPreset={setCode}
      onRequestPermission={() => requestCameraPermission()}
      onSend={sendBlink}
      onRetake={clearBlinkDraft}
      onBack={goBackToFlow}
      onOpenSettings={openSendSettings}
      headerAvatarUri={headerAvatarUri}
      previewMode={previewMode}
      showBackAction={isModalFlow}
    />
  );

  return (
    <>
      {activeScreen}
      <SendSettingsSheet
        visible={sendSettingsVisible}
        blinkFrameCount={visibleFrameUris.length}
        onClose={closeSendSettings}
        onClearDraft={clearBlinkDraft}
      />
    </>
  );
}

function SmBeepWidgetPreview({
  code,
  recipientName,
}: {
  code: string;
  recipientName: string;
}) {
  return (
    <View style={styles.smBeepWidgetPreview}>
      <View style={styles.smBeepWidgetHead}>
        <Text style={styles.smBeepWidgetBrand}>BEEP-GET</Text>
        <View style={styles.smBeepWidgetDot} />
      </View>
      <View style={styles.smBeepWidgetBody}>
        <Text style={styles.smBeepWidgetCode}>{code || "____"}</Text>
        <Text numberOfLines={1} style={styles.smBeepWidgetMeta}>
          BEEP / {recipientName}
        </Text>
      </View>
    </View>
  );
}

function BlinkMdWidgetPreview({
  code,
  recipientName,
  frameUris,
}: {
  code: string;
  recipientName: string;
  frameUris: readonly string[];
}) {
  const hasFrames = frameUris.length > 0;

  return (
    <View style={styles.mdWidgetPreview}>
      <View style={styles.mdWidgetHead}>
        <View style={styles.mdWidgetTitleRow}>
          <Text style={styles.mdWidgetIncoming}>Incoming</Text>
          <Text style={styles.mdWidgetKind}>Blink</Text>
        </View>
        <Text style={styles.mdWidgetMeta}>NO.97 - 2.0s</Text>
      </View>
      <View style={styles.mdWidgetRule} />
      <View style={styles.mdWidgetBody}>
        <View style={styles.mdWidgetNumberBlock}>
          <Text style={styles.mdWidgetCode}>{code || "____"}</Text>
          <View style={styles.mdWidgetFromRow}>
            <Text style={styles.mdWidgetLabel}>FROM</Text>
            <Text numberOfLines={1} style={styles.mdWidgetFrom}>{recipientName}</Text>
          </View>
          <Text style={styles.mdWidgetSub}>2.0s - MUTE</Text>
        </View>
        <View style={styles.mdWidgetVerticalRule} />
        <View style={styles.mdWidgetSignalPane}>
          <View style={styles.mdWidgetSignalHead}>
            <Text style={styles.mdWidgetLabel}>SIGNAL SLOTS</Text>
            <Text style={styles.mdWidgetStatus}>{hasFrames ? "NEW" : "READY"}</Text>
          </View>
          <CaptureFrameStrip frameUris={frameUris} />
        </View>
      </View>
    </View>
  );
}

function CaptureFrameStrip({
  frameUris,
}: {
  frameUris: readonly string[];
}) {
  const labels = ["0.0s", "0.7s", "1.3s"];

  return (
    <View style={styles.captureFrameStrip}>
      {labels.map((label, index) => (
        <View key={`${frameUris[index] ?? label}-${index}`} style={styles.captureFrameThumb}>
          {frameUris[index] ? (
            <Image source={{ uri: frameUris[index] }} style={styles.captureFrameImage} resizeMode="cover" />
          ) : (
            <Text style={styles.captureFramePlaceholder}>{label}</Text>
          )}
        </View>
      ))}
    </View>
  );
}

function SendSettingsSheet({
  visible,
  blinkFrameCount,
  onClose,
  onClearDraft,
}: {
  visible: boolean;
  blinkFrameCount: number;
  onClose: () => void;
  onClearDraft: () => void;
}) {
  if (!visible) return null;

  return (
    <View style={styles.sheetOverlay}>
      <Pressable accessibilityLabel="Close Send settings" onPress={onClose} style={styles.sheetBackdrop} />
      <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Send Settings</Text>
            <Pressable accessibilityRole="button" onPress={onClose} style={styles.sheetClose}>
              <Text style={styles.sheetCloseText}>Close</Text>
            </Pressable>
          </View>

          <View style={styles.sheetRow}>
            <View style={styles.sheetIconCircle}>
              <SendPlaneIcon color={colors.ink} />
            </View>
            <View style={styles.sheetCopy}>
              <Text style={styles.sheetRowTitle}>Default Send</Text>
              <Text style={styles.sheetRowSub}>Beep sends code. Blink sends the code with a 2s video.</Text>
            </View>
          </View>

          <View style={styles.sheetRow}>
            <View style={styles.sheetIconCircle}>
              <CameraLineIcon color={colors.ink} />
            </View>
            <View style={styles.sheetCopy}>
              <Text style={styles.sheetRowTitle}>Blink Draft Frames</Text>
              <Text style={styles.sheetRowSub}>{blinkFrameCount} extracted from this 2s Blink</Text>
            </View>
            <Pressable accessibilityRole="button" onPress={onClearDraft} style={styles.smallPill}>
              <Text style={styles.smallPillText}>Clear</Text>
            </Pressable>
          </View>

      </View>
    </View>
  );
}

function createPreviewBlinkDraft(frameUris: readonly string[] = DEMO_BLINK_FRAME_DATA_URIS): BlinkDraft {
  const previewFrameUris = [...frameUris].slice(0, 3);
  return {
    video: {
      uri: "preview-private-playback",
      durationMs: BLINK_MAX_DURATION_MS,
      mimeType: "video/mp4",
    },
    teaser: {
      thumbnailKey: null,
      stripKeys: [],
      assets: previewFrameUris.map((uri, index) => ({
        uri,
        objectKey: `preview-strip-${index + 1}`,
        mimeType: "image/jpeg" as const,
        timeMs: Math.floor(BLINK_MAX_DURATION_MS * (index / 3)),
      })),
    },
    previewFrameUris,
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

function CaptureReticlePanel() {
  return (
    <View style={styles.captureGrid}>
      <View style={styles.crosshairHorizontal} />
      <View style={styles.crosshairVertical} />
      <View style={styles.crosshairCircle} />
    </View>
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
    gap: spacing[4],
    marginBottom: spacing[3],
    marginHorizontal: spacing[0],
    paddingTop: spacing[1],
  },
  deckSection: {
    gap: spacing[1],
  },
  deckLabel: {
    ...type.tinyMono,
  },
  capturePreview: {
    minHeight: 248,
    padding: spacing[4],
    gap: spacing[3],
  },
  beepCapturePreview: {
    minHeight: 188,
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
    minHeight: 104,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    borderRadius: radius.control,
    backgroundColor: "#EAE4DA",
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
    width: 66,
    height: 66,
    borderRadius: 33,
    borderWidth: 1,
    borderColor: "rgba(10,10,10,0.10)",
  },
  captureCameraFrame: {
    minHeight: 118,
    borderRadius: radius.control,
    overflow: "hidden",
    backgroundColor: colors.ink,
  },
  captureCamera: {
    flex: 1,
  },
  captureHint: {
    ...type.tinyMono,
    textAlign: "center",
  },
  captureFramesBlock: {
    gap: spacing[2],
  },
  captureFramesLabel: {
    ...type.tinyMono,
  },
  smBeepWidgetPreview: {
    alignSelf: "center",
    width: "100%",
    maxWidth: 216,
    minHeight: 156,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.ruleStrong,
    borderRadius: 12,
    backgroundColor: "#F8F6F1",
  },
  smBeepWidgetHead: {
    minHeight: 34,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing[3],
  },
  smBeepWidgetBrand: {
    ...type.tinyMono,
    color: colors.muted,
  },
  smBeepWidgetDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.red,
  },
  smBeepWidgetBody: {
    flex: 1,
    minHeight: 118,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing[2],
    padding: spacing[4],
  },
  smBeepWidgetCode: {
    ...type.codeMedium,
    color: colors.ink,
    fontSize: 42,
    lineHeight: 46,
    textAlign: "center",
  },
  smBeepWidgetMeta: {
    ...type.tinyMono,
    maxWidth: "100%",
    color: colors.muted,
    textAlign: "center",
  },
  mdWidgetPreview: {
    minHeight: 176,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.ruleStrong,
    borderRadius: 10,
    backgroundColor: "#F8F6F1",
  },
  mdWidgetHead: {
    minHeight: 34,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing[2],
    paddingHorizontal: spacing[3],
  },
  mdWidgetTitleRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing[1],
  },
  mdWidgetIncoming: {
    ...type.metaValue,
    fontSize: 13,
    lineHeight: 16,
  },
  mdWidgetKind: {
    ...type.metaValue,
    fontSize: 13,
    fontStyle: "italic",
    lineHeight: 16,
  },
  mdWidgetMeta: {
    ...type.tinyMono,
    color: colors.muted,
  },
  mdWidgetRule: {
    height: 1,
    backgroundColor: colors.ink,
  },
  mdWidgetBody: {
    flex: 1,
    minHeight: 140,
    flexDirection: "row",
  },
  mdWidgetNumberBlock: {
    width: 104,
    justifyContent: "center",
    gap: spacing[1],
    paddingHorizontal: spacing[3],
  },
  mdWidgetCode: {
    ...type.codeSmall,
    color: colors.ink,
    fontSize: 30,
    lineHeight: 34,
  },
  mdWidgetFromRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing[1],
  },
  mdWidgetFrom: {
    ...type.tinyMono,
    flex: 1,
    color: colors.ink,
  },
  mdWidgetSub: {
    ...type.tinyMono,
    color: colors.muted,
  },
  mdWidgetVerticalRule: {
    width: 1,
    backgroundColor: colors.ink,
  },
  mdWidgetSignalPane: {
    flex: 1,
    gap: spacing[2],
    padding: spacing[3],
  },
  mdWidgetSignalHead: {
    minHeight: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing[2],
  },
  mdWidgetLabel: {
    ...type.tinyMono,
    color: colors.muted,
  },
  mdWidgetStatus: {
    ...type.tinyMono,
    color: colors.red,
  },
  captureFrameStrip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "stretch",
    gap: spacing[2],
    minHeight: 86,
  },
  captureFrameThumb: {
    flex: 1,
    minHeight: 86,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderRadius: 7,
    borderWidth: 1,
    borderColor: colors.rule,
    backgroundColor: "#EAE4DA",
  },
  captureFrameImage: {
    width: "100%",
    height: "100%",
    transform: [{ scale: 1.08 }],
  },
  captureFramePlaceholder: {
    ...type.tinyMono,
    color: colors.muted,
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
  pressed: {
    opacity: 0.82,
    transform: [{ translateY: 1 }],
  },
  sheetOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.48)",
    zIndex: 10000,
    elevation: 10000,
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    gap: spacing[3],
    padding: spacing[5],
    paddingBottom: 88,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: "#F8F6F1",
    zIndex: 10001,
    elevation: 10001,
  },
  sheetHeader: {
    minHeight: 36,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing[4],
  },
  sheetTitle: {
    ...type.slipTitle,
    fontSize: 18,
  },
  sheetClose: {
    minHeight: 30,
    justifyContent: "center",
    paddingHorizontal: spacing[4],
    borderRadius: 10,
    backgroundColor: "#ECE8E1",
  },
  sheetCloseText: {
    ...type.tinyMono,
    color: colors.ink,
  },
  sheetRow: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[4],
    padding: spacing[4],
    borderWidth: 1,
    borderColor: "rgba(10,10,10,0.10)",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
  },
  sheetIconCircle: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 21,
    backgroundColor: "#F0EEE9",
  },
  sheetCopy: {
    flex: 1,
    gap: spacing[1],
  },
  sheetRowTitle: {
    ...type.metaValue,
    fontSize: 12,
  },
  sheetRowSub: {
    ...type.bodyMuted,
  },
  smallPill: {
    minHeight: 30,
    justifyContent: "center",
    paddingHorizontal: spacing[4],
    borderRadius: 10,
    backgroundColor: colors.ink,
  },
  smallPillText: {
    ...type.tinyMono,
    color: "#FFFFFF",
  },
});
