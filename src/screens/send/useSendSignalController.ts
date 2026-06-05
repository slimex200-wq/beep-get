import { useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { CameraView, useCameraPermissions } from "expo-camera";
import type { PickableFriend } from "@/components/FriendPickerStrip";
import type { RecentSignalCombo } from "@/components/RecentSignalCombos";
import { normalizeAvatarUri } from "@/lib/avatarSource";
import { BLINK_DURATION_SECONDS, BLINK_MAX_BYTES } from "@/lib/beepBlinkLimits";
import { createBlinkDraft, type BlinkDraft } from "@/lib/blinkDraft";
import { isUiPreviewUser } from "@/lib/uiPreview";
import type { RootStackParamList } from "@/navigation/RootNavigator";
import {
  createPreviewBlinkDraft,
  DEFAULT_SLOT_DECK,
  friendNo,
  getErrorMessage,
  RECENT_COMBO_LABELS,
  RECENT_COMBO_SLOTS,
  reportError,
} from "@/screens/send/sendSignalHelpers";
import { sendBlinkVideo } from "@/services/blinkSendService";
import { useAuthStore } from "@/stores/authStore";
import { useDictionaryStore } from "@/stores/dictionaryStore";
import { useFriendStore } from "@/stores/friendStore";
import { useMessageStore } from "@/stores/messageStore";

export type SendMode = "beep" | "blink";
type SendRouteParams = Partial<RootStackParamList["Send"]>;

export function useSendSignalController() {
  const route = useRoute(), navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
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
  const [sendSettingsVisible, setSendSettingsVisible] = useState(false);
  const [sentFeedback, setSentFeedback] = useState(false);
  const previewMode = Boolean(profile && isUiPreviewUser(profile.id));
  const headerAvatarUri = normalizeAvatarUri(profile?.avatar_url);
  const profileId = profile?.id ?? null;

  useEffect(() => {
    if (!profileId) return;
    fetchFriends(profileId).catch(reportError);
    fetchDictionary(profileId).catch(reportError);
  }, [profileId, fetchFriends, fetchDictionary]);

  useEffect(() => {
    if (params.mode) setMode(params.mode);
  }, [params.mode]);

  useEffect(() => {
    if (params.initialCode) setCode(params.initialCode);
  }, [params.initialCode]);

  const friendOptions = useMemo<PickableFriend[]>(() => {
    const routeFriend = params.friendId
      ? [{
          id: params.friendId,
          name: params.friendName ?? "Friend",
          no: params.friendNo ?? friendNo(params.friendName),
          relation: "SELECTED",
          ...(params.friendAvatarUri ? { avatarUri: params.friendAvatarUri } : {}),
        }]
      : [];
    const storeFriends = friends.map((friend) => ({
      id: friend.friend_id,
      name: friend.nickname || friend.friend.nickname,
      no: friend.friend.beep_id.slice(-2),
      relation: friend.vibration_pattern || friend.friend.status_icon || "CLOSE",
      avatarUri: friend.friend.avatar_url,
    }));
    const byId = new Map<string, PickableFriend>();
    [...routeFriend, ...storeFriends].forEach((friend) => byId.set(friend.id, friend));
    return Array.from(byId.values());
  }, [friends, params.friendAvatarUri, params.friendId, params.friendName, params.friendNo]);

  useEffect(() => {
    if (params.friendId) {
      setSelectedRecipientId(params.friendId);
      return;
    }
    if (!selectedRecipientId && friendOptions[0]) setSelectedRecipientId(friendOptions[0].id);
  }, [params.friendId, selectedRecipientId, friendOptions]);

  const recipient = friendOptions.find((friend) => friend.id === selectedRecipientId) ?? friendOptions[0] ?? null;
  const slotDeck = useMemo(() => {
    const userSlots = entries.map((entry) => entry.code).filter(Boolean);
    return Array.from(new Set([...DEFAULT_SLOT_DECK, ...userSlots])).slice(0, 8);
  }, [entries]);
  const recentCombos = useMemo<RecentSignalCombo[]>(
    () => RECENT_COMBO_SLOTS.flatMap((slot, index) => {
      const friend = friendOptions[index % Math.max(friendOptions.length, 1)];
      if (!friend) return [];
      return [{
        id: `${friend.id}-${slot}`,
        friendId: friend.id,
        friendName: friend.name,
        friendNo: friend.no,
        slot,
        label: RECENT_COMBO_LABELS[index] ?? `${slot} + ${friend.name}`,
      }];
    }),
    [friendOptions],
  );
  const visibleFrameUris = useMemo(
    () => blinkDraft?.previewFrameUris?.slice(0, 3) ?? [],
    [blinkDraft?.previewFrameUris],
  );

  useEffect(() => setBlinkDraft(null), [recipient?.id]);
  useEffect(() => {
    if (!code && slotDeck[0]) setCode(slotDeck[0]);
  }, [code, slotDeck]);

  const selectRecipient = (friend: PickableFriend) => setSelectedRecipientId(friend.id);
  const selectSlot = (slot: string) => setCode(slot);
  const selectRecentCombo = (combo: RecentSignalCombo) => {
    setSelectedRecipientId(combo.friendId);
    setCode(combo.slot);
  };
  const openPeople = () => navigation.navigate("Main", { screen: "People" });
  const openSendSettings = () => setSendSettingsVisible(true);
  const closeSendSettings = () => setSendSettingsVisible(false);
  const clearBlinkDraft = () => {
    setBlinkDraft(null);
    setSentFeedback(false);
  };
  const flashSentFeedback = () => {
    setSentFeedback(true);
    setTimeout(() => setSentFeedback(false), 1400);
  };
  const goBackToFlow = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate("Main", { screen: "People" });
  };

  const sendBeep = async () => {
    if (!profile || !recipient || !code || sending) return;
    setSending(true);
    try {
      await send(profile.id, recipient.id, code, memo || undefined);
      flashSentFeedback();
      Alert.alert("Beep sent", `${code} to ${recipient.name}`);
      setMemo("");
    } catch (error) {
      Alert.alert("Beep failed", getErrorMessage(error));
    } finally {
      setSending(false);
    }
  };

  const sendCapturedBlink = async (profileIdArg: string, recipientId: string, recipientName: string) => {
    if (!blinkDraft) return;
    setSending(true);
    try {
      if (previewMode) {
        await send(profileIdArg, recipientId, code, memo || "Blink");
      } else {
        await sendBlinkVideo({
          senderId: profileIdArg,
          receiverId: recipientId,
          code,
          memo: memo || undefined,
          video: blinkDraft.video,
          createTeaser: async () => blinkDraft.teaser,
        });
      }
      flashSentFeedback();
      setBlinkDraft(null);
      setMemo("");
    } catch (error) {
      Alert.alert("Blink failed", getErrorMessage(error));
    } finally {
      setSending(false);
    }
  };

  const sendBlink = async () => {
    if (!profile || !recipient || !code || sending || recording) return;
    if (!blinkDraft && previewMode) {
      setBlinkDraft(createPreviewBlinkDraft());
      Alert.alert("Blink preview", `3 frame Blink preview is ready for ${recipient.name}`);
      return;
    }
    if (blinkDraft) {
      await sendCapturedBlink(profile.id, recipient.id, recipient.name);
      return;
    }
    const permission = cameraPermission?.granted ? cameraPermission : await requestCameraPermission();
    if (!permission.granted || !cameraRef.current) {
      Alert.alert("Camera required", "Blink needs camera access to capture a 2 second video.");
      return;
    }
    setRecording(true);
    setSending(true);
    try {
      const captured = await cameraRef.current.recordAsync({
        codec: "avc1",
        maxDuration: BLINK_DURATION_SECONDS,
        maxFileSize: BLINK_MAX_BYTES,
      });
      if (!captured?.uri) throw new Error("Camera did not return a video file.");
      const draft = await createBlinkDraft({ senderId: profile.id, receiverId: recipient.id, videoUri: captured.uri });
      setBlinkDraft(draft);
      Alert.alert("Blink preview ready", "Check the 3 frames, then send or retake.");
    } catch (error) {
      Alert.alert("Blink failed", getErrorMessage(error));
    } finally {
      setRecording(false);
      setSending(false);
    }
  };

  return {
    isModalFlow,
    mode,
    setMode,
    friendOptions,
    recipient,
    code,
    setCode,
    memo,
    setMemo,
    slotDeck,
    recentCombos,
    sending,
    recording,
    blinkDraft,
    sentFeedback,
    visibleFrameUris,
    previewMode,
    headerAvatarUri,
    cameraRef,
    cameraPermissionGranted: Boolean(cameraPermission?.granted),
    requestCameraPermission,
    sendSettingsVisible,
    selectRecipient,
    selectSlot,
    selectRecentCombo,
    openPeople,
    openSendSettings,
    closeSendSettings,
    clearBlinkDraft,
    goBackToFlow,
    sendBeep,
    sendBlink,
  };
}
