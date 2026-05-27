import React, { useEffect, useMemo, useState } from "react";
import { Alert, ImageBackground, Modal, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from "react-native";
import * as Haptics from "expo-haptics";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { colors, radius, spacing } from "@/design/tokens";
import { type } from "@/design/typography";
import { ActionButton } from "@/components/ActionButton";
import { AppSurface } from "@/components/AppSurface";
import {
  Avatar,
  MockupCard,
  MockupSection,
  NameDot,
} from "@/components/KotlinMockupUI";
import type { RootStackParamList } from "@/navigation/RootNavigator";
import { relationshipToSlipFriend, type SlipFriend } from "@/lib/slipUiModels";
import { generateShareText } from "@/services/contactService";
import { useAuthStore } from "@/stores/authStore";
import { useFriendStore } from "@/stores/friendStore";
import { useMessageStore } from "@/stores/messageStore";

const relationshipPresets = ["CLOSE FRIEND", "BEST", "ROOMMATE", "FAMILY"] as const;
const favoriteSignalCode = "486";
const blinkHeroImage = require("../../assets/brand/blink/blink-person-model-strip.png");
type RelationshipPreset = (typeof relationshipPresets)[number];

export function PeopleScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { profile } = useAuthStore();
  const { friends, fetch, add } = useFriendStore();
  const { received, fetchReceived } = useMessageStore();
  const [beepId, setBeepId] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [addDialogVisible, setAddDialogVisible] = useState(false);
  const [selectedPreset] = useState<RelationshipPreset>("CLOSE FRIEND");

  useEffect(() => {
    if (!profile) return;
    fetch(profile.id).catch(reportError);
  }, [profile?.id, fetch]);

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

  const lastSignalByFriend = useMemo(() => {
    const map = new Map<string, string>();
    received.forEach((message) => {
      if (map.has(message.from_user)) return;
      const kind = message.kind === "blink" || message.media ? "Widget seen" : "uses code often";
      map.set(message.from_user, kind);
    });
    return map;
  }, [received]);
  const featuredFriend = visibleFriends[1] ?? visibleFriends[0] ?? null;

  const pulse = () => {
    Haptics.selectionAsync().catch(() => undefined);
  };

  const addByBeepId = async () => {
    if (!profile || !beepId.trim()) return;
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
        <FriendsHeader onSettingsPress={openSettings} />
        <View style={styles.searchPanel}>
          <Text style={styles.searchGlyph}>⌕</Text>
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search ID or name"
            placeholderTextColor={colors.muted2}
            style={styles.searchInput}
          />
        </View>

        <MockupSection label="MY ID" hint="SHARE" />
        <MockupCard style={styles.myIdCard}>
          <Avatar label="Me" size={42} />
          <View style={styles.myIdCopy}>
            <Text style={styles.friendName}>{profile?.nickname ?? "Alex"} · BEEP-{formatOwnNo(profile?.beep_id)}</Text>
            <Text style={styles.handle}>@{profile?.beep_id ?? "alexb"}</Text>
          </View>
          <RoundTextButton label="⧉" accessibilityLabel="Share my Beep ID" onPress={profile ? shareMyBeepId : undefined} />
        </MockupCard>

        <Pressable
          accessibilityRole="button"
          onPress={openAddDialog}
          style={({ pressed }) => [styles.addFriendCard, pressed && styles.pressed]}
        >
          <View style={styles.addIcon}>
            <Text style={styles.addIconText}>+</Text>
          </View>
          <View style={styles.addCopy}>
            <Text style={styles.friendName}>친구 추가</Text>
            <Text style={type.bodyMuted}>ID나 초대 링크로 연결</Text>
          </View>
          <Text style={styles.addActionText}>ADD</Text>
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
                  (index === 0 ? "Widget seen · 18:05" : index === 1 ? "자주 쓰는 코드 486" : "quiet receiving")
                }
                accent={index === 0 ? colors.red : index === 1 ? "#F27F0C" : colors.greenDot}
                online={index === 0}
                rightText={index === 1 ? favoriteSignalCode : undefined}
                onPress={() => navigateSend(friend, index % 2 === 0 ? "blink" : "beep")}
              />
            ))
          ) : (
            <MockupCard soft style={styles.empty}>
              <Text style={type.metaValue}>{searchQuery ? "NO MATCHES" : "NO FRIENDS YET"}</Text>
              <Text style={type.bodyMuted}>Add a friend by Beep ID to start sending slips.</Text>
            </MockupCard>
          )}
        </View>

        {featuredFriend ? (
          <FavoriteSignalCard
            friend={featuredFriend}
            code={favoriteSignalCode}
            onSend={() => navigateSend(featuredFriend, "blink", favoriteSignalCode)}
          />
        ) : null}
      </ScrollView>

      <Modal transparent visible={addDialogVisible} animationType="fade" onRequestClose={() => setAddDialogVisible(false)}>
        <View style={styles.dialogOverlay}>
          <View style={styles.dialog}>
            <Text style={styles.dialogTitle}>Configure Friend Info</Text>
            <TextInput
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Display Name"
              placeholderTextColor={colors.muted2}
              style={styles.dialogInput}
            />
            <TextInput
              value={beepId}
              onChangeText={(value) => setBeepId(value.replace(/[^0-9]/g, ""))}
              keyboardType="number-pad"
              maxLength={8}
              placeholder="ID Handle / Beep ID"
              placeholderTextColor={colors.muted2}
              style={styles.dialogInput}
            />
            <View style={styles.dialogActions}>
              <ActionButton label="Cancel" variant="ghost" onPress={() => setAddDialogVisible(false)} />
              <ActionButton label="Add" variant="dark" onPress={addByBeepId} disabled={!beepId} />
            </View>
          </View>
        </View>
      </Modal>
    </AppSurface>
  );
}

function FriendsHeader({ onSettingsPress }: { onSettingsPress: () => void }) {
  return (
    <View style={styles.headerRow}>
      <View style={styles.headerCopy}>
        <Text style={styles.headerKicker}>FRIENDS</Text>
        <Text style={styles.headerTitle}>Friends</Text>
      </View>
      <RoundTextButton label="⚙" accessibilityLabel="Open settings" onPress={onSettingsPress} />
    </View>
  );
}

function RoundTextButton({
  label,
  accessibilityLabel,
  onPress,
}: {
  label: string;
  accessibilityLabel: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityLabel={accessibilityLabel}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [styles.roundButton, pressed && styles.pressed]}
    >
      <Text style={styles.roundButtonText}>{label}</Text>
    </Pressable>
  );
}

function FavoriteSignalCard({
  friend,
  code,
  onSend,
}: {
  friend: SlipFriend;
  code: string;
  onSend: () => void;
}) {
  return (
    <ImageBackground source={blinkHeroImage} resizeMode="cover" style={styles.favoriteCard} imageStyle={styles.favoriteImage}>
      <View style={styles.favoriteOverlay} />
      <View style={styles.favoriteTopRow}>
        <NewBadge />
        <View style={styles.codeBubble}>
          <Text style={styles.codeBubbleText}>{code}</Text>
        </View>
      </View>
      <View style={styles.favoriteCopy}>
        <Text style={styles.favoriteTitle}>{friend.name}에게 자주 보내는 신호</Text>
        <Text style={styles.favoriteSubtitle}>2초 전에 받은 Blink · 코드 {code}</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Send Blink to ${friend.name}`}
        onPress={onSend}
        style={({ pressed }) => [styles.sendBlinkButton, pressed && styles.sendBlinkButtonPressed]}
      >
        <Text style={styles.sendBlinkText}>✈ Send Blink</Text>
      </Pressable>
    </ImageBackground>
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
}: {
  friend: SlipFriend;
  status: string;
  accent: string;
  online?: boolean;
  rightText?: string;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.friendRow, pressed && styles.pressed]}>
      <View style={styles.friendAvatar}>
        <Text style={styles.friendInitial}>{friend.name.slice(0, 1)}</Text>
        <NameDot color={accent} />
      </View>
      <View style={styles.friendCopy}>
        <Text style={styles.friendName}>{friend.name}</Text>
        <Text style={styles.friendStatus}>{status}</Text>
      </View>
      {online ? <View style={styles.onlineDot} /> : <Text style={styles.timeText}>{rightText ?? friend.no}</Text>}
    </Pressable>
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
  headerRow: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing[4],
  },
  headerCopy: {
    flex: 1,
  },
  headerKicker: {
    ...type.tinyMono,
    color: colors.muted,
  },
  headerTitle: {
    ...type.screenTitle,
    fontSize: 22,
    lineHeight: 26,
  },
  roundButton: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(10,10,10,0.14)",
    borderRadius: 19,
    backgroundColor: "#FFFFFF",
    shadowColor: colors.ink,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  roundButtonText: {
    ...type.metaValue,
    fontSize: 17,
    lineHeight: 20,
  },
  searchPanel: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
    paddingHorizontal: spacing[5],
    borderWidth: 1,
    borderColor: "rgba(10,10,10,0.08)",
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    shadowColor: colors.ink,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  searchGlyph: {
    ...type.metaValue,
    fontSize: 15,
  },
  searchInput: {
    flex: 1,
    minHeight: 38,
    ...type.body,
    color: colors.ink,
  },
  myIdCard: {
    minHeight: 84,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[4],
    padding: spacing[5],
    borderRadius: 20,
    shadowColor: colors.ink,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  myIdCopy: {
    flex: 1,
    gap: spacing[1],
  },
  handle: {
    ...type.bodyMuted,
    color: colors.muted,
  },
  addFriendCard: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[4],
    padding: spacing[5],
    borderWidth: 1,
    borderColor: "rgba(10,10,10,0.08)",
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    shadowColor: colors.ink,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  addIcon: {
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 25,
    backgroundColor: "#F4EDF1",
  },
  addIconText: {
    ...type.metaValue,
    fontSize: 18,
  },
  addCopy: {
    flex: 1,
    gap: spacing[1],
  },
  addActionText: {
    ...type.tinyMono,
    color: colors.ink,
  },
  friendList: {
    gap: spacing[3],
  },
  friendRow: {
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[4],
    padding: spacing[4],
    borderWidth: 1,
    borderColor: "rgba(10,10,10,0.08)",
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
  },
  friendAvatar: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 21,
    backgroundColor: colors.paperDeep,
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
  empty: {
    minHeight: 112,
    justifyContent: "center",
    gap: spacing[2],
    padding: spacing[5],
  },
  favoriteCard: {
    minHeight: 172,
    justifyContent: "space-between",
    overflow: "hidden",
    padding: spacing[5],
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: 20,
    backgroundColor: colors.paperDeep,
  },
  favoriteImage: {
    borderRadius: 20,
  },
  favoriteOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(4,20,25,0.18)",
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
    fontSize: 13,
    color: colors.ink,
  },
  favoriteSubtitle: {
    ...type.bodyMuted,
    color: "rgba(10,10,10,0.76)",
  },
  codeBubble: {
    minWidth: 44,
    minHeight: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    backgroundColor: colors.ink,
  },
  codeBubbleText: {
    ...type.monoValue,
    color: colors.paperWarm,
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
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.paperWarm,
    borderRadius: radius.pill,
    backgroundColor: colors.ink,
    shadowColor: colors.ink,
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  sendBlinkButtonPressed: {
    opacity: 0.88,
    transform: [{ translateY: 1 }],
  },
  sendBlinkText: {
    ...type.button,
    color: colors.paperWarm,
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
    borderRadius: 18,
    backgroundColor: "#EFE9F4",
  },
  dialogTitle: {
    ...type.screenTitle,
    fontSize: 20,
    lineHeight: 26,
  },
  dialogInput: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: "rgba(170,150,176,0.28)",
    borderRadius: radius.control,
    paddingHorizontal: spacing[4],
    backgroundColor: "rgba(255,255,255,0.18)",
    ...type.body,
    color: colors.ink,
  },
  dialogActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing[3],
  },
});
