import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { radius, spacing } from "@/design/tokens";
import { type } from "@/design/typography";
import { useAppPalette } from "@/design/appTheme";
import {
  Card,
  ListRow,
  MonoValue,
  PillButton,
  PrimaryButton,
  RowChevron,
  Screen,
  SectionLabel,
  StatusDot,
} from "@/ui/primitives";
import { AddPersonLineIcon, SearchLineIcon } from "@/components/MockupLineIcons";
import type { RootStackParamList } from "@/navigation/RootNavigator";
import {
  formatSlipTime,
  relationshipToSlipFriend,
  type SlipFriend,
} from "@/lib/slipUiModels";
import { getAvatarImageSource } from "@/lib/avatarSource";
import { generateShareText } from "@/services/contactService";
import { isValidBeepId } from "@/services/authService";
import {
  buildFriendSignalSummaries,
  getFriendSignalSummary,
} from "@/screens/people/peopleSignalStatus";
import { useAuthStore } from "@/stores/authStore";
import { useFriendStore } from "@/stores/friendStore";
import { useMessageStore } from "@/stores/messageStore";

const relationshipPresets = ["CLOSE FRIEND", "BEST", "ROOMMATE", "FAMILY"] as const;
const blinkHeroImage = require("../../assets/brand/blink/blink-person-model-strip.png");

type RelationshipPreset = (typeof relationshipPresets)[number];

export function PeopleScreen() {
  const palette = useAppPalette();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { profile } = useAuthStore();
  const { friends, inboundFriends, fetch, fetchInbound, markInboundSeen, add } =
    useFriendStore();
  const { received, fetchReceived } = useMessageStore();
  const [beepId, setBeepId] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [addDialogVisible, setAddDialogVisible] = useState(false);
  const [selectedPreset] = useState<RelationshipPreset>("CLOSE FRIEND");
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [focusedDialogInput, setFocusedDialogInput] = useState<"nickname" | "beepId" | null>(null);
  const myBeepId = profile?.beep_id?.trim() || "--------";

  useEffect(() => {
    if (!profile) return;
    fetch(profile.id).catch(reportError);
  }, [profile?.id, fetch]);

  useEffect(() => {
    if (!profile) return;
    let cancelled = false;
    fetchInbound(profile.id)
      .then(() => {
        if (!cancelled) return markInboundSeen();
      })
      .catch(reportError);
    return () => {
      cancelled = true;
    };
  }, [profile?.id, fetchInbound, markInboundSeen]);

  useEffect(() => {
    if (!profile) return;
    fetchReceived(profile.id, friends).catch(reportError);
  }, [profile?.id, friends.length, fetchReceived]);

  const slipFriends = useMemo(
    () => friends.map((friend, index) => relationshipToSlipFriend(friend, index)),
    [friends],
  );
  const visibleFriends = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return slipFriends;
    return slipFriends.filter((friend) =>
      `${friend.name} ${friend.no} ${friend.relation}`.toLowerCase().includes(query),
    );
  }, [searchQuery, slipFriends]);
  const canAddFriend = isValidBeepId(beepId.trim());
  const featuredBlink = useMemo(() => {
    const visibleFriendIds = new Set(visibleFriends.map((friend) => friend.id));
    const message = received.find(
      (item) =>
        visibleFriendIds.has(item.from_user) &&
        (item.kind === "blink" || Boolean(item.media?.thumbnailUri) || Boolean(item.media?.stripFrameUris?.length)),
    );
    if (!message) return null;

    const friend = visibleFriends.find((item) => item.id === message.from_user);
    const imageUri = message.media?.stripFrameUris?.[0] ?? message.media?.thumbnailUri ?? null;
    if (!friend || !imageUri) return null;

    return {
      friend,
      code: message.number_code,
      imageUri,
      time: formatSlipTime(message.created_at),
    };
  }, [received, visibleFriends]);
  const signalSummaries = useMemo(() => buildFriendSignalSummaries(received), [received]);

  const pulse = () => {
    Haptics.selectionAsync().catch(() => undefined);
  };

  const addByBeepId = async () => {
    if (!profile || !canAddFriend) return;
    try {
      await add(profile.id, beepId.trim(), displayName.trim() || undefined, selectedPreset);
      setBeepId("");
      setDisplayName("");
      setAddDialogVisible(false);
      Alert.alert("친구 추가 완료", "가까운 친구가 준비됐어요.");
    } catch (err: unknown) {
      if (err instanceof Error) {
        Alert.alert("추가 실패", err.message);
        return;
      }
      throw err;
    }
  };

  const shareMyBeepId = async () => {
    pulse();
    if (!profile) return;
    await Share.share({ message: generateShareText(profile.beep_id, profile.nickname) });
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 1500);
  };

  const openAddDialog = () => {
    pulse();
    setAddDialogVisible(true);
  };

  const navigateSend = (friend: SlipFriend, mode: "beep" | "blink", initialCode?: string) => {
    pulse();
    navigation.navigate("Send", {
      friendId: friend.id,
      friendName: friend.name,
      friendNo: friend.no,
      ...(friend.avatarUri ? { friendAvatarUri: friend.avatarUri } : {}),
      mode,
      initialCode,
    });
  };

  const addFriendSheet = (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.sheetOverlay}
    >
      <Pressable accessibilityLabel="Close add friend" onPress={() => setAddDialogVisible(false)} style={styles.sheetBackdrop} />
      <View style={[styles.sheetPanel, Platform.OS === "web" && styles.webSheetPanel, { backgroundColor: palette.card, borderColor: palette.rule }]}>
        <View style={[styles.grabBar, { backgroundColor: palette.rule }]} />
        <Text style={[styles.dialogTitle, { color: palette.text }]}>친구 정보 입력</Text>
        <Text style={[type.bodyMuted, { color: palette.muted }]}>8자리 Beep ID를 입력하세요. 닉네임은 선택이에요.</Text>
        <TextInput
          value={displayName}
          onChangeText={setDisplayName}
          onFocus={() => setFocusedDialogInput("nickname")}
          onBlur={() => setFocusedDialogInput((current) => (current === "nickname" ? null : current))}
          placeholder="닉네임 (선택)"
          placeholderTextColor={palette.muted2}
          style={[styles.dialogInput, { backgroundColor: palette.card, borderColor: focusedDialogInput === "nickname" ? palette.text : palette.rule, color: palette.text }]}
        />
        <TextInput
          value={beepId}
          onChangeText={(value) => setBeepId(value.replace(/[^0-9]/g, ""))}
          onFocus={() => setFocusedDialogInput("beepId")}
          onBlur={() => setFocusedDialogInput((current) => (current === "beepId" ? null : current))}
          keyboardType="number-pad"
          maxLength={8}
          placeholder="8자리 Beep ID"
          placeholderTextColor={palette.muted2}
          style={[styles.dialogInput, { backgroundColor: palette.card, borderColor: focusedDialogInput === "beepId" ? palette.text : palette.rule, color: palette.text }]}
        />
        <View style={styles.dialogActions}>
          <PillButton label="취소" onPress={() => setAddDialogVisible(false)} />
          <View style={styles.dialogPrimary}>
            <PrimaryButton label="추가" onPress={addByBeepId} disabled={!canAddFriend} />
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );

  return (
    <Screen title="Friends" side={`${friends.length}명`}>
      <View style={[styles.searchPanel, { backgroundColor: palette.card, borderColor: searchFocused ? palette.text : palette.rule }]}>
        <SearchLineIcon color={palette.muted2} style={styles.searchIcon} />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          placeholder="ID나 이름 검색"
          placeholderTextColor={palette.muted2}
          style={[styles.searchInput, { color: palette.text }]}
        />
      </View>

      <SectionLabel>친구 추가</SectionLabel>
      <View style={styles.stack}>
        <Card style={styles.myIdCard}>
          <View style={styles.myIdCopy}>
            <Text style={[styles.myIdLabel, { color: palette.muted }]}>MY BEEP ID</Text>
            <MonoValue style={styles.myIdCode}>{myBeepId}</MonoValue>
          </View>
          <PillButton
            label={copyFeedback ? "복사됨" : "복사"}
            accessibilityLabel={copyFeedback ? "Beep ID shared" : "Copy Beep ID"}
            disabled={!profile}
            onPress={shareMyBeepId}
          />
        </Card>

        <Card>
          <ListRow
            left={
              <View style={[styles.addIcon, { backgroundColor: palette.chip }]}>
                <AddPersonLineIcon />
              </View>
            }
            title="친구 추가"
            meta="친구 Beep ID로 바로 추가"
            right={<RowChevron />}
            onPress={openAddDialog}
            isLast
          />
        </Card>
      </View>

      <SectionLabel>가까운 친구</SectionLabel>
      {visibleFriends.length > 0 ? (
        <Card>
          {visibleFriends.map((friend, index) => {
            const summary = getFriendSignalSummary(signalSummaries, friend.id);
            const sendMode = summary.circuitStatus === "BLINK" ? "blink" : "beep";
            const hasNewSignal = summary.circuitStatus !== "quiet";
            return (
              <FriendRow
                key={friend.id}
                friend={friend}
                status={summary.rowStatus}
                hasNewSignal={hasNewSignal}
                avatarUri={friend.avatarUri}
                rightText={summary.badgeText}
                isLast={index === visibleFriends.length - 1}
                onPress={() => navigateSend(friend, sendMode)}
              />
            );
          })}
        </Card>
      ) : (
        <Card style={styles.empty}>
          <MonoValue>{searchQuery ? "NO MATCHES" : "NO FRIENDS YET"}</MonoValue>
          <Text style={[type.bodyMuted, { color: palette.muted }]}>Beep ID로 친구를 추가해 보세요.</Text>
        </Card>
      )}

      {inboundFriends.length > 0 ? (
        <>
          <SectionLabel>나를 추가한 친구</SectionLabel>
          <Card>
            {inboundFriends.map((inbound, index) => (
              <InboundRow
                key={inbound.id}
                name={inbound.owner.nickname?.trim() || inbound.owner.beep_id}
                beepId={inbound.owner.beep_id}
                avatarUri={inbound.owner.avatar_url}
                time={formatSlipTime(inbound.created_at)}
                isLast={index === inboundFriends.length - 1}
              />
            ))}
          </Card>
        </>
      ) : null}

      {featuredBlink ? (
        <>
          <SectionLabel>최근 Blink</SectionLabel>
          <FavoriteSignalCard
            friend={featuredBlink.friend}
            code={featuredBlink.code}
            imageUri={featuredBlink.imageUri}
            subtitle={`Blink 받음 · ${featuredBlink.code} · ${featuredBlink.time}`}
            onSend={() => navigateSend(featuredBlink.friend, "blink", featuredBlink.code)}
          />
        </>
      ) : null}

      {Platform.OS === "web" ? (
        addDialogVisible ? <View style={styles.webSheetHost}>{addFriendSheet}</View> : null
      ) : (
        <Modal transparent visible={addDialogVisible} animationType="slide" onRequestClose={() => setAddDialogVisible(false)}>
          {addFriendSheet}
        </Modal>
      )}
    </Screen>
  );
}

// On-media surface: FavoriteSignalCard renders text and scrims over a user photo,
// so literal overlay/white colors are allowed here (not themable chrome).
function FavoriteSignalCard({
  friend,
  code,
  imageUri,
  subtitle,
  onSend,
}: {
  friend: SlipFriend;
  code: string;
  imageUri?: string;
  subtitle: string;
  onSend: () => void;
}) {
  const imageSource = imageUri ? { uri: imageUri } : blinkHeroImage;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Send Blink to ${friend.name}`}
      onPress={onSend}
      style={({ pressed }) => [styles.favoritePressable, pressed && styles.pressed]}
    >
      <ImageBackground source={imageSource} resizeMode="cover" style={styles.favoriteCard} imageStyle={styles.favoriteImage}>
        <View style={styles.favoriteOverlay} />
        <View style={styles.favoriteTopRow}>
          <NewBadge />
          <View style={styles.codeBubble}>
            <Text style={styles.codeBubbleText}>{code}</Text>
          </View>
        </View>
        <View style={styles.favoriteCopy}>
          <Text style={styles.favoriteTitle}>{friend.name}의 최근 Blink</Text>
          <Text style={styles.favoriteSubtitle}>{subtitle}</Text>
        </View>
        <View style={styles.sendBlinkButton}>
          <Text style={styles.sendBlinkText}>SEND BLINK</Text>
        </View>
      </ImageBackground>
    </Pressable>
  );
}

function NewBadge() {
  const palette = useAppPalette();
  return (
    <View style={[styles.newBadge, { backgroundColor: palette.sigSoft }]}>
      <Text style={[styles.newBadgeText, { color: palette.sig }]}>NEW</Text>
    </View>
  );
}

function FriendRow({
  friend,
  status,
  hasNewSignal,
  rightText,
  onPress,
  avatarUri,
  isLast,
}: {
  friend: SlipFriend;
  status: string;
  hasNewSignal: boolean;
  rightText?: string;
  avatarUri?: string;
  isLast: boolean;
  onPress: () => void;
}) {
  const palette = useAppPalette();
  const avatarSource = getAvatarImageSource(avatarUri);

  return (
    <ListRow
      left={
        <View style={styles.avatarWrap}>
          <View style={[styles.friendAvatar, { backgroundColor: palette.input }]}>
            {avatarSource ? (
              <Image source={avatarSource} style={styles.friendAvatarImage} resizeMode="cover" />
            ) : (
              <Text style={[styles.friendInitial, { color: palette.text }]}>{friend.name.slice(0, 1)}</Text>
            )}
          </View>
          <StatusDot kind={hasNewSignal ? "new" : "on"} />
        </View>
      }
      title={friend.name}
      meta={status}
      right={
        <MonoValue sig={hasNewSignal} dim={!hasNewSignal}>
          {rightText ?? friend.no}
        </MonoValue>
      }
      onPress={onPress}
      isLast={isLast}
    />
  );
}

function InboundRow({
  name,
  beepId,
  time,
  avatarUri,
  isLast,
}: {
  name: string;
  beepId: string;
  time: string;
  avatarUri?: string | null;
  isLast: boolean;
}) {
  const palette = useAppPalette();
  const avatarSource = getAvatarImageSource(avatarUri);

  return (
    <ListRow
      left={
        <View style={[styles.friendAvatar, { backgroundColor: palette.input }]}>
          {avatarSource ? (
            <Image source={avatarSource} style={styles.friendAvatarImage} resizeMode="cover" />
          ) : (
            <Text style={[styles.friendInitial, { color: palette.text }]}>{name.slice(0, 1)}</Text>
          )}
        </View>
      }
      title={name}
      meta={`나를 추가했어요 · ${time}`}
      right={<MonoValue>{beepId.slice(-2)}</MonoValue>}
      isLast={isLast}
    />
  );
}

function reportError(err: unknown) {
  const message = err instanceof Error ? err.message : "알 수 없는 오류";
  Alert.alert("BEEP-GET", message);
}

const styles = StyleSheet.create({
  searchPanel: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
    paddingHorizontal: spacing[4],
    borderWidth: 1,
    borderRadius: radius.pill,
  },
  searchIcon: {
    width: 22,
    height: 22,
  },
  searchInput: {
    flex: 1,
    minHeight: 38,
    ...type.body,
    fontSize: 12,
  },
  stack: {
    gap: spacing[4],
  },
  myIdCard: {
    minHeight: 74,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[4],
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[5],
  },
  myIdCopy: {
    flex: 1,
    gap: spacing[1],
  },
  myIdLabel: {
    ...type.tinyMono,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 1.2,
  },
  myIdCode: {
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -1,
    fontVariant: ["tabular-nums"],
  },
  addIcon: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
  },
  avatarWrap: {
    width: 42,
    height: 42,
  },
  friendAvatar: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    overflow: "hidden",
  },
  friendAvatarImage: {
    width: "100%",
    height: "100%",
  },
  friendInitial: {
    ...type.metaValue,
    fontSize: 13,
  },
  empty: {
    minHeight: 112,
    justifyContent: "center",
    gap: spacing[2],
    padding: spacing[8],
  },
  favoritePressable: {
    borderRadius: 22,
  },
  /* --- on-media hero card: literal colors below are on-image only --- */
  favoriteCard: {
    minHeight: 168,
    justifyContent: "space-between",
    overflow: "hidden",
    padding: spacing[4],
    borderWidth: 1,
    borderColor: "rgba(10,10,10,0.10)",
    borderRadius: 22,
    backgroundColor: "#0A0A0A",
  },
  favoriteImage: {
    borderRadius: 22,
  },
  favoriteOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.28)",
  },
  favoriteTopRow: {
    position: "relative",
    zIndex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  favoriteCopy: {
    position: "relative",
    zIndex: 1,
    gap: spacing[1],
  },
  favoriteTitle: {
    ...type.metaValue,
    color: "#FFFFFF",
    fontSize: 13,
  },
  favoriteSubtitle: {
    ...type.bodyMuted,
    color: "rgba(255,255,255,0.78)",
  },
  codeBubble: {
    minWidth: 44,
    minHeight: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: "rgba(10,10,10,0.88)",
  },
  codeBubbleText: {
    ...type.buttonMono,
    color: "#FFFFFF",
  },
  newBadge: {
    minHeight: 26,
    alignSelf: "flex-start",
    justifyContent: "center",
    paddingHorizontal: spacing[4],
    borderRadius: radius.pill,
  },
  newBadgeText: {
    ...type.tinyMono,
  },
  sendBlinkButton: {
    position: "relative",
    zIndex: 1,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.72)",
    borderRadius: 10,
    backgroundColor: "rgba(10,10,10,0.88)",
  },
  sendBlinkText: {
    ...type.buttonMono,
    color: "#FFFFFF",
    fontSize: 13,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ translateY: 1 }],
  },
  sheetOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    // functional scrim, not a palette color
    backgroundColor: "rgba(0,0,0,0.52)",
  },
  webSheetHost: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
    elevation: 20,
  },
  webSheetPanel: {
    marginBottom: 86,
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetPanel: {
    gap: spacing[5],
    padding: spacing[6],
    paddingBottom: spacing[8],
    borderWidth: 1,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },
  grabBar: {
    alignSelf: "center",
    width: 44,
    height: 4,
    borderRadius: radius.pill,
  },
  dialogTitle: {
    ...type.screenTitle,
    fontSize: 20,
    lineHeight: 26,
  },
  dialogInput: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing[5],
    ...type.body,
  },
  dialogActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
  },
  dialogPrimary: {
    flex: 1,
  },
});
