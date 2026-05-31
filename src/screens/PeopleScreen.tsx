import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { colors, radius, spacing } from "@/design/tokens";
import { type } from "@/design/typography";
import { useAppPalette } from "@/design/appTheme";
import { ActionButton } from "@/components/ActionButton";
import { AppSurface } from "@/components/AppSurface";
import {
  KotlinHeader,
  MockupCard,
  MockupSection,
  NameDot,
} from "@/components/KotlinMockupUI";
import {
  AddPersonLineIcon,
  ChevronRightLineIcon,
  CheckCircleLineIcon,
  CopyLineIcon,
  GearLineIcon,
  SearchLineIcon,
} from "@/components/MockupLineIcons";
import type { RootStackParamList } from "@/navigation/RootNavigator";
import { getMockupFriendPhotoUri, mockupPhotoUris } from "@/design/mockupPhotos";
import {
  formatSlipTime,
  relationshipToSlipFriend,
  type SlipFriend,
} from "@/lib/slipUiModels";
import { generateShareText } from "@/services/contactService";
import { isValidBeepId } from "@/services/authService";
import { useAuthStore } from "@/stores/authStore";
import { useFriendStore } from "@/stores/friendStore";
import { useMessageStore } from "@/stores/messageStore";

const relationshipPresets = ["CLOSE FRIEND", "BEST", "ROOMMATE", "FAMILY"] as const;
const favoriteSignalCode = "486";
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
  const featuredFriend = visibleFriends[1] ?? visibleFriends[0] ?? null;

  const lastSignalByFriend = useMemo(() => {
    const map = new Map<string, string>();
    received.forEach((message) => {
      if (map.has(message.from_user)) return;
      const kind = message.kind === "blink" || message.media ? "Widget seen" : "uses code often";
      map.set(message.from_user, kind);
    });
    return map;
  }, [received]);

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
      Alert.alert("Friend added", "Close friend is ready.");
    } catch (err: any) {
      Alert.alert("Add failed", err?.message ?? "Try again.");
    }
  };

  const openSettings = () => {
    pulse();
    navigation.navigate("Account");
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
      mode,
      initialCode,
    });
  };

  return (
    <AppSurface backgroundColor="#F8F6F1">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <KotlinHeader
          title="Friends"
          centered
          avatarSource={{ uri: profile?.avatar_url ?? mockupPhotoUris.profile }}
          actions={[
            {
              label: "Settings",
              icon: <GearLineIcon />,
              accessibilityLabel: "Friends settings",
              onPress: openSettings,
            },
          ]}
        />
        <View style={[styles.searchPanel, { backgroundColor: palette.input }]}>
          <SearchLineIcon color={palette.muted2} style={styles.searchIcon} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search ID or name"
            placeholderTextColor={palette.muted2}
            style={[styles.searchInput, { color: palette.text }]}
          />
        </View>

        <MockupSection label="MY ID" hint="SHARE" />
        <MockupCard style={styles.myIdCard}>
          <Image source={{ uri: profile?.avatar_url ?? mockupPhotoUris.profile }} style={styles.myIdAvatar} resizeMode="cover" />
          <View style={styles.myIdCopy}>
            <Text style={[styles.friendName, { color: palette.text }]}>{profile?.nickname ?? "Alex"} - BEEP-{formatOwnNo(profile?.beep_id)}</Text>
            <Text style={[styles.handle, { color: palette.muted }]}>@{profile?.beep_id ?? "alexb"}</Text>
          </View>
          <Pressable
            accessibilityLabel={copyFeedback ? "Beep ID shared" : "Copy Beep ID"}
            accessibilityRole="button"
            disabled={!profile}
            onPress={profile ? shareMyBeepId : undefined}
            style={({ pressed }) => [styles.copyButton, { backgroundColor: palette.chip }, copyFeedback && styles.copyButtonDone, pressed && styles.pressed]}
          >
            {copyFeedback ? <CheckCircleLineIcon /> : <CopyLineIcon />}
          </Pressable>
        </MockupCard>

        <Pressable
          accessibilityRole="button"
          onPress={openAddDialog}
          style={({ pressed }) => [styles.addFriendCard, { backgroundColor: palette.card, borderColor: palette.rule }, pressed && styles.pressed]}
        >
          <View style={[styles.addIcon, { backgroundColor: palette.chip }]}>
            <AddPersonLineIcon />
          </View>
          <View style={styles.addCopy}>
            <Text style={[styles.friendName, { color: palette.text }]}>Add Friend</Text>
            <Text style={[type.bodyMuted, { color: palette.muted }]}>Connect with an 8-digit Beep ID</Text>
          </View>
          <ChevronRightLineIcon />
        </Pressable>

        <MockupSection label="Close Friends" hint={`${visibleFriends.length} ONLINE`} />
        <View style={styles.friendList}>
          {visibleFriends.length > 0 ? (
            visibleFriends.map((friend, index) => (
              <FriendRow
                key={friend.id}
                friend={friend}
                status={
                  lastSignalByFriend.get(friend.id) ??
                  (index === 0 ? "Widget seen - 18:05" : index === 1 ? "frequent code 486" : "quiet receiving")
                }
                accent={index === 0 ? colors.red : index === 1 ? "#F27F0C" : colors.greenDot}
                avatarUri={getMockupFriendPhotoUri(friend.name, index)}
                online={index === 0}
                rightText={index === 1 ? favoriteSignalCode : friend.no}
                onPress={() => navigateSend(friend, index % 2 === 0 ? "blink" : "beep")}
              />
            ))
          ) : (
            <MockupCard soft style={styles.empty}>
              <Text style={[type.metaValue, { color: palette.text }]}>{searchQuery ? "NO MATCHES" : "NO FRIENDS YET"}</Text>
              <Text style={[type.bodyMuted, { color: palette.muted }]}>Add a friend by Beep ID to start sending slips.</Text>
            </MockupCard>
          )}
        </View>

        {inboundFriends.length > 0 ? (
          <>
            <MockupSection label="Added You" hint={`${inboundFriends.length}`} />
            <View style={styles.friendList}>
              {inboundFriends.map((inbound) => (
                <InboundRow
                  key={inbound.id}
                  name={inbound.owner.nickname?.trim() || inbound.owner.beep_id}
                  beepId={inbound.owner.beep_id}
                  time={formatSlipTime(inbound.created_at)}
                />
              ))}
            </View>
          </>
        ) : null}

        {featuredBlink ? (
          <FavoriteSignalCard
            friend={featuredBlink.friend}
            code={featuredBlink.code}
            imageUri={featuredBlink.imageUri}
            subtitle={`${featuredBlink.time} received Blink - code ${featuredBlink.code}`}
            onSend={() => navigateSend(featuredBlink.friend, "blink", featuredBlink.code)}
          />
        ) : featuredFriend ? (
          <FavoriteSignalCard
            friend={featuredFriend}
            code={favoriteSignalCode}
            subtitle={`2 sec Blink - code ${favoriteSignalCode}`}
            onSend={() => navigateSend(featuredFriend, "blink", favoriteSignalCode)}
          />
        ) : null}
      </ScrollView>

      <Modal transparent visible={addDialogVisible} animationType="fade" onRequestClose={() => setAddDialogVisible(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.dialogOverlay}
        >
          <View style={[styles.dialog, { backgroundColor: palette.card }]}>
            <Text style={[styles.dialogTitle, { color: palette.text }]}>Configure Friend Info</Text>
            <Text style={[type.bodyMuted, { color: palette.muted }]}>Enter an 8-digit Beep ID. Nickname is optional.</Text>
            <TextInput
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Optional nickname"
              placeholderTextColor={palette.muted2}
              style={[styles.dialogInput, { backgroundColor: palette.input, borderColor: palette.rule, color: palette.text }]}
            />
            <TextInput
              value={beepId}
              onChangeText={(value) => setBeepId(value.replace(/[^0-9]/g, ""))}
              keyboardType="number-pad"
              maxLength={8}
              placeholder="8-digit Beep ID"
              placeholderTextColor={palette.muted2}
              style={[styles.dialogInput, { backgroundColor: palette.input, borderColor: palette.rule, color: palette.text }]}
            />
            <View style={styles.dialogActions}>
              <ActionButton label="Cancel" variant="ghost" onPress={() => setAddDialogVisible(false)} />
              <ActionButton label="Add" variant="dark" onPress={addByBeepId} disabled={!canAddFriend} />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </AppSurface>
  );
}

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
          <Text style={styles.favoriteTitle}>Frequent signal for {friend.name}</Text>
          <Text style={styles.favoriteSubtitle}>{subtitle}</Text>
        </View>
        <View style={styles.sendBlinkButton}>
          <Text style={styles.sendBlinkText}>Send Blink</Text>
        </View>
      </ImageBackground>
    </Pressable>
  );
}

function NewBadge() {
  return (
    <View style={styles.newBadge}>
      <Text style={styles.newBadgeText}>NEW</Text>
    </View>
  );
}

function FriendRow({
  friend,
  status,
  accent,
  online,
  rightText,
  onPress,
  avatarUri,
}: {
  friend: SlipFriend;
  status: string;
  accent: string;
  online?: boolean;
  rightText?: string;
  avatarUri?: string;
  onPress: () => void;
}) {
  const palette = useAppPalette();

  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.friendRow, { backgroundColor: palette.card, borderColor: palette.rule }, pressed && styles.pressed]}>
      <View style={[styles.friendAvatar, { backgroundColor: palette.input }]}>
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} style={styles.friendAvatarImage} resizeMode="cover" />
        ) : (
          <Text style={[styles.friendInitial, { color: palette.text }]}>{friend.name.slice(0, 1)}</Text>
        )}
        <NameDot color={accent} />
      </View>
      <View style={styles.friendCopy}>
        <Text style={[styles.friendName, { color: palette.text }]}>{friend.name}</Text>
        <Text style={[styles.friendStatus, { color: palette.muted }]}>{status}</Text>
      </View>
      {online ? <View style={styles.onlineDot} /> : <Text style={[styles.timeText, { color: palette.text }]}>{rightText ?? friend.no}</Text>}
    </Pressable>
  );
}

function InboundRow({
  name,
  beepId,
  time,
}: {
  name: string;
  beepId: string;
  time: string;
}) {
  const palette = useAppPalette();

  return (
    <View style={[styles.friendRow, { backgroundColor: palette.card, borderColor: palette.rule }]}>
      <View style={[styles.friendAvatar, { backgroundColor: palette.input }]}>
        <Text style={[styles.friendInitial, { color: palette.text }]}>{name.slice(0, 1)}</Text>
      </View>
      <View style={styles.friendCopy}>
        <Text style={[styles.friendName, { color: palette.text }]}>{name}</Text>
        <Text style={[styles.friendStatus, { color: palette.muted }]}>added you - {time}</Text>
      </View>
      <Text style={[styles.timeText, { color: palette.text }]}>{beepId.slice(-2)}</Text>
    </View>
  );
}

function formatOwnNo(beepId?: string | null) {
  const digits = beepId?.replace(/\D/g, "");
  return digits && digits.length >= 2 ? digits.slice(-2) : "04";
}

function reportError(err: unknown) {
  const message = err instanceof Error ? err.message : "Unexpected error";
  Alert.alert("BEEP-GET", message);
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing[5],
    paddingBottom: 96,
    gap: spacing[4],
  },
  searchPanel: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
    paddingHorizontal: spacing[4],
    borderRadius: 12,
    backgroundColor: "#F0EFEB",
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
    color: colors.ink,
  },
  myIdCard: {
    minHeight: 74,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[4],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    borderRadius: 12,
  },
  myIdAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  myIdCopy: {
    flex: 1,
    gap: spacing[1],
  },
  handle: {
    ...type.bodyMuted,
    color: colors.muted,
  },
  copyButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#F2F0EC",
  },
  copyButtonDone: {
    backgroundColor: colors.lcd,
  },
  addFriendCard: {
    minHeight: 70,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[4],
    padding: spacing[4],
    borderWidth: 1,
    borderColor: "rgba(10,10,10,0.10)",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
  },
  addIcon: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 23,
    backgroundColor: "#F2F0EC",
  },
  addCopy: {
    flex: 1,
    gap: spacing[1],
  },
  friendList: {
    gap: spacing[3],
  },
  friendRow: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[4],
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
  },
  friendAvatar: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 21,
    backgroundColor: colors.paperDeep,
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
  friendCopy: {
    flex: 1,
    gap: spacing[1],
  },
  friendName: {
    ...type.metaValue,
    fontSize: 12,
  },
  friendStatus: {
    ...type.bodyMuted,
  },
  timeText: {
    ...type.tinyMono,
    color: colors.ink,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#16C784",
  },
  favoritePressable: {
    borderRadius: 12,
  },
  favoriteCard: {
    minHeight: 168,
    justifyContent: "space-between",
    overflow: "hidden",
    padding: spacing[4],
    borderWidth: 1,
    borderColor: "rgba(10,10,10,0.10)",
    borderRadius: 12,
    backgroundColor: colors.ink,
  },
  favoriteImage: {
    borderRadius: 12,
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
    backgroundColor: "#FFF1EE",
  },
  newBadgeText: {
    ...type.tinyMono,
    color: colors.red,
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
    ...type.button,
    color: "#FFFFFF",
    fontSize: 13,
  },
  empty: {
    minHeight: 112,
    justifyContent: "center",
    gap: spacing[2],
    padding: spacing[5],
  },
  pressed: {
    opacity: 0.82,
    transform: [{ translateY: 1 }],
  },
  dialogOverlay: {
    flex: 1,
    justifyContent: "center",
    padding: spacing[8],
    backgroundColor: "rgba(0,0,0,0.58)",
  },
  dialog: {
    gap: spacing[5],
    padding: spacing[6],
    borderRadius: 14,
    backgroundColor: "#F8F6F1",
  },
  dialogTitle: {
    ...type.screenTitle,
    fontSize: 20,
    lineHeight: 26,
  },
  dialogInput: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: "rgba(10,10,10,0.12)",
    borderRadius: radius.control,
    paddingHorizontal: spacing[4],
    backgroundColor: "#FFFFFF",
    ...type.body,
    color: colors.ink,
  },
  dialogActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing[3],
  },
});
