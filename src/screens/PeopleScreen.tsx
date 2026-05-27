import React, { useEffect, useMemo, useState } from "react";
import { Alert, Modal, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { colors, radius, spacing } from "@/design/tokens";
import { type } from "@/design/typography";
import { ActionButton } from "@/components/ActionButton";
import { AppSurface } from "@/components/AppSurface";
import {
  Avatar,
  IconButton,
  KotlinHeader,
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
type RelationshipPreset = (typeof relationshipPresets)[number];

export function PeopleScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { profile } = useAuthStore();
  const { friends, loading, fetch, add } = useFriendStore();
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

  const refreshPeople = () => {
    if (!profile) return;
    fetch(profile.id).catch(reportError);
    fetchReceived(profile.id, friends).catch(reportError);
  };

  const shareMyBeepId = async () => {
    if (!profile) return;
    await Share.share({ message: generateShareText(profile.beep_id, profile.nickname) });
  };

  const navigateSend = (friend: SlipFriend, mode: "beep" | "blink") => {
    navigation.navigate("Send", {
      friendId: friend.id,
      friendName: friend.name,
      friendNo: friend.no,
      mode,
    });
  };

  return (
    <AppSurface backgroundColor="#F8F6F1">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <KotlinHeader
          title="Friends"
          centered
          actions={[{ label: loading ? "…" : "⚙", onPress: refreshPeople }]}
        />
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

        <MockupSection label="My Beep ID" />
        <MockupCard style={styles.myIdCard}>
          <Avatar label="Me" size={42} />
          <View style={styles.myIdCopy}>
            <Text style={styles.friendName}>{profile?.nickname ?? "Alex Chen"}</Text>
            <Text style={styles.handle}>@{profile?.beep_id ?? "alex"}</Text>
          </View>
          <IconButton label="⧉" onPress={profile ? shareMyBeepId : undefined} />
        </MockupCard>

        <MockupSection label="Discover" />
        <Pressable
          accessibilityRole="button"
          onPress={() => setAddDialogVisible(true)}
          style={({ pressed }) => [styles.addFriendCard, pressed && styles.pressed]}
        >
          <View style={styles.addIcon}>
            <Text style={styles.addIconText}>☻+</Text>
          </View>
          <View style={styles.addCopy}>
            <Text style={styles.friendName}>Add new friends</Text>
            <Text style={type.bodyMuted}>Invite via link or contacts</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>

        <MockupSection label="Close Friends" hint={`${visibleFriends.length} Online`} />
        <View style={styles.friendList}>
          {visibleFriends.length > 0 ? (
            visibleFriends.map((friend, index) => (
              <FriendRow
                key={friend.id}
                friend={friend}
                status={lastSignalByFriend.get(friend.id) ?? (index === 0 ? "Widget seen" : "quiet receiving")}
                time={index === 0 ? "18:05" : index === 1 ? "17:30" : "14:12"}
                accent={index === 0 ? colors.red : index === 1 ? "#F27F0C" : colors.greenDot}
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

function FriendRow({
  friend,
  status,
  time,
  accent,
  onPress,
}: {
  friend: SlipFriend;
  status: string;
  time: string;
  accent: string;
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
      <Text style={styles.timeText}>{time}</Text>
    </Pressable>
  );
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
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
    paddingHorizontal: spacing[4],
    borderRadius: 11,
    backgroundColor: "#F0EEE9",
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
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[4],
    padding: spacing[4],
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
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[4],
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radius.slipSmall,
    backgroundColor: "#FFFFFF",
  },
  addIcon: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 19,
    backgroundColor: "#F0EEE9",
  },
  addIconText: {
    ...type.metaValue,
    fontSize: 12,
  },
  addCopy: {
    flex: 1,
    gap: spacing[1],
  },
  chevron: {
    ...type.codeSmall,
    fontSize: 22,
    lineHeight: 26,
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
    borderRadius: radius.slipSmall,
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
