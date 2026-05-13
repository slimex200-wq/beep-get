import React, { useEffect, useMemo, useRef, useState } from "react";
import { Alert, ScrollView, Share, StyleSheet, Text, TextInput, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { colors, spacing } from "@/design/tokens";
import { type } from "@/design/typography";
import { ActionButton } from "@/components/ActionButton";
import { AppSurface } from "@/components/AppSurface";
import { FriendCard } from "@/components/FriendCard";
import { HeaderBar } from "@/components/HeaderBar";
import type { RootStackParamList } from "@/navigation/RootNavigator";
import { relationshipToSlipFriend } from "@/lib/slipUiModels";
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
  const [selectedPreset, setSelectedPreset] = useState<RelationshipPreset>("CLOSE FRIEND");
  const inviteInputRef = useRef<TextInput>(null);

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
    [friends]
  );

  const lastSignalByFriend = useMemo(() => {
    const map = new Map<string, string>();
    received.forEach((message) => {
      if (map.has(message.from_user)) return;
      const kind = message.kind === "blink" || message.media ? "Blink" : "Beep";
      map.set(message.from_user, `${kind} / ${message.number_code}`);
    });
    return map;
  }, [received]);

  const addByBeepId = async () => {
    if (!profile || !beepId.trim()) return;
    try {
      await add(profile.id, beepId.trim(), undefined, selectedPreset);
      setBeepId("");
      Alert.alert("Friend added", `${selectedPreset} contact is ready.`);
    } catch (err: any) {
      Alert.alert("Add failed", err?.message ?? "Try again.");
    }
  };

  const refreshPeople = () => {
    if (!profile) return;
    fetch(profile.id).catch(reportError);
    fetchReceived(profile.id, friends).catch(reportError);
  };

  const focusInvite = () => {
    inviteInputRef.current?.focus();
  };

  const shareMyBeepId = async () => {
    if (!profile) return;
    await Share.share({ message: generateShareText(profile.beep_id, profile.nickname) });
  };

  const navigateSend = (friend: { id: string; name: string; no: string }, mode: "beep" | "blink") => {
    navigation.navigate("Send", {
      friendId: friend.id,
      friendName: friend.name,
      friendNo: friend.no,
      mode,
    });
  };

  return (
    <AppSurface>
      <HeaderBar
        title="PEOPLE"
        right={loading ? "SYNC" : "+"}
        showDot
        onRightPress={loading ? refreshPeople : focusInvite}
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <HeroBlock
          titleTop="Close"
          titleBottom="Circuit"
          copy="Widget priority and recent signals replace the decorative circuit map."
          badge={slipFriends.length.toString().padStart(2, "0")}
        />

        <CompactBeepIdCard
          beepId={profile?.beep_id ?? "00000000"}
          nickname={profile?.nickname ?? "ME"}
          onShare={profile ? shareMyBeepId : undefined}
        />

        <SectionHeader label="WIDGET CIRCLE" hint="CLOSE CIRCUIT" />
        <View style={styles.widgetCircle}>
          <View style={styles.circleSummary}>
            <View>
              <Text style={type.metaValue}>홈 위젯 우선 친구</Text>
              <Text style={type.tinyMono}>PINNED FRIENDS APPEAR FIRST</Text>
            </View>
            <View style={styles.circleCount}>
              <Text style={type.monoValue}>{Math.min(slipFriends.length, 3).toString().padStart(2, "0")}</Text>
            </View>
          </View>
          {slipFriends.length > 0 ? (
            slipFriends.slice(0, 3).map((friend, index) => (
              <View key={friend.id} style={[styles.circleFriend, index === 0 && styles.circleFriendPinned]}>
                <View style={styles.circleFriendText}>
                  <Text style={type.metaValue}>{friend.name}</Text>
                  <Text style={type.tinyMono} numberOfLines={1}>
                    {index === 0 ? "PINNED / " : ""}
                    {lastSignalByFriend.get(friend.id) ?? "QUIET"}
                  </Text>
                </View>
                <View style={styles.circleActions}>
                  <ActionButton label="B" mono flex onPress={() => navigateSend(friend, "beep")} />
                  <ActionButton label="BL" mono flex onPress={() => navigateSend(friend, "blink")} />
                  <ActionButton
                    label={index === 0 ? "ON" : "PIN"}
                    mono
                    flex
                    variant={index === 0 ? "dark" : "ghost"}
                    onPress={() => Alert.alert("Pinned", `${friend.name} is marked for the widget.`)}
                  />
                </View>
              </View>
            ))
          ) : (
            <View style={styles.softPanel}>
              <Text style={type.metaValue}>No one is pinned to the home widget yet.</Text>
              <Text style={type.bodyMuted}>Add one Beep ID below, then pin the first close friend here.</Text>
              <View style={styles.softActions}>
                <ActionButton label="INVITE" flex onPress={focusInvite} />
                <ActionButton label="SHARE ID" flex variant="dark" onPress={profile ? shareMyBeepId : focusInvite} />
              </View>
            </View>
          )}
        </View>

        <SectionHeader label="FRIENDS" hint={`${slipFriends.length} TOTAL`} />
        <View style={styles.friendRow}>
          {slipFriends.length > 0 ? (
            slipFriends.map((friend) => (
              <FriendCard
                key={friend.id}
                friend={friend}
                lastSignal={lastSignalByFriend.get(friend.id)}
                onPress={() => navigateSend(friend, "beep")}
                onSendBeep={() => navigateSend(friend, "beep")}
                onSendBlink={() => navigateSend(friend, "blink")}
                onPin={() => Alert.alert("Pinned", `${friend.name} is marked for the widget.`)}
              />
            ))
          ) : (
            <View style={styles.empty}>
              <Text style={type.metaValue}>NO FRIENDS YET</Text>
              <Text style={type.bodyMuted}>Add a friend by Beep ID to start sending slips.</Text>
            </View>
          )}
        </View>

        <SectionHeader label="INVITE SLIP" hint="BEEP ID + RELATION" />
        <View style={styles.invitePanel}>
          <Text style={type.tinyMono}>INVITE BY BEEP ID</Text>
          <View style={styles.inviteRow}>
            <TextInput
              ref={inviteInputRef}
              value={beepId}
              onChangeText={(value) => setBeepId(value.replace(/[^0-9]/g, ""))}
              keyboardType="number-pad"
              maxLength={8}
              placeholder="8 DIGITS"
              placeholderTextColor={colors.muted2}
              style={styles.input}
            />
            <ActionButton label="ADD" variant="dark" onPress={addByBeepId} disabled={!beepId} />
          </View>
        </View>

        <Text style={type.tinyMono}>RELATIONSHIP PRESETS</Text>
        <View style={styles.chips}>
          {relationshipPresets.map((label) => (
            <ActionButton
              key={label}
              label={label}
              variant={selectedPreset === label ? "dark" : "light"}
              onPress={() => setSelectedPreset(label)}
            />
          ))}
        </View>
      </ScrollView>
    </AppSurface>
  );
}

function SectionHeader({ label, hint }: { label: string; hint: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={type.tinyMono}>{label}</Text>
      <View style={styles.sectionLine} />
      <Text style={type.tinyMono}>{hint}</Text>
    </View>
  );
}

function HeroBlock({
  titleTop,
  titleBottom,
  copy,
  badge,
}: {
  titleTop: string;
  titleBottom: string;
  copy: string;
  badge: string;
}) {
  return (
    <View style={styles.hero}>
      <View style={styles.heroText}>
        <Text style={styles.heroTitle}>{titleTop}</Text>
        <Text style={styles.heroTitle}>{titleBottom}</Text>
        <Text style={styles.heroCopy}>{copy}</Text>
      </View>
      <View style={styles.heroBadge}>
        <Text style={styles.heroBadgeText}>{badge}</Text>
      </View>
    </View>
  );
}

function CompactBeepIdCard({
  beepId,
  nickname,
  onShare,
}: {
  beepId: string;
  nickname: string;
  onShare?: () => void;
}) {
  return (
    <View style={styles.idCard}>
      <View style={styles.idCardHead}>
        <Text style={type.tinyMono}>MY BEEP ID</Text>
        <Text style={type.tinyMono}>SHARE</Text>
      </View>
      <View style={styles.idCardBody}>
        <View style={styles.idTextBlock}>
          <Text style={styles.compactId}>{beepId}</Text>
          <Text style={type.tinyMono}>{nickname} / PRIVATE INVITE</Text>
        </View>
        <ActionButton label="COPY" mono variant="light" onPress={onShare} disabled={!onShare} />
      </View>
    </View>
  );
}

function reportError(err: unknown) {
  const message = err instanceof Error ? err.message : "Unexpected error";
  Alert.alert("BEEP-GET", message);
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[8],
    gap: spacing[5],
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.rule,
  },
  hero: {
    minHeight: 86,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: spacing[4],
  },
  heroText: {
    flex: 1,
  },
  heroTitle: {
    ...type.screenTitle,
    fontSize: 34,
    lineHeight: 33,
    letterSpacing: -0.8,
  },
  heroCopy: {
    ...type.bodyMuted,
    marginTop: spacing[2],
    fontSize: 11,
    lineHeight: 15,
  },
  heroBadge: {
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.ink,
    backgroundColor: colors.lcd,
  },
  heroBadgeText: {
    ...type.codeSmall,
    fontSize: 18,
    lineHeight: 20,
  },
  idCard: {
    borderWidth: 1,
    borderColor: colors.ruleStrong,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: colors.paperWarm,
  },
  idCardHead: {
    minHeight: 34,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.ruleStrong,
  },
  idCardBody: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  idTextBlock: {
    flex: 1,
  },
  compactId: {
    ...type.codeSmall,
    lineHeight: 28,
  },
  widgetCircle: {
    gap: spacing[3],
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.ruleStrong,
    borderRadius: 12,
    backgroundColor: colors.paperWarm,
  },
  circleSummary: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing[4],
    paddingBottom: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
  },
  circleCount: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.ruleStrong,
    backgroundColor: colors.lcd,
  },
  circleFriend: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
    padding: spacing[3],
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: 9,
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  circleFriendPinned: {
    borderColor: colors.ruleStrong,
    backgroundColor: colors.paper,
  },
  circleFriendText: {
    flex: 1,
    gap: spacing[1],
  },
  circleActions: {
    width: 118,
    flexDirection: "row",
    gap: spacing[2],
  },
  invitePanel: {
    gap: spacing[3],
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.ruleStrong,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  inviteRow: {
    flexDirection: "row",
    gap: spacing[3],
    alignItems: "center",
  },
  input: {
    flex: 1,
    minHeight: 40,
    borderWidth: 1,
    borderColor: colors.ruleStrong,
    borderRadius: 8,
    paddingHorizontal: spacing[4],
    textAlign: "center",
    ...type.codeSmall,
    color: colors.ink,
    backgroundColor: colors.paperWarm,
  },
  friendRow: {
    gap: spacing[3],
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing[3],
  },
  empty: {
    flex: 1,
    minHeight: 120,
    justifyContent: "center",
    gap: spacing[2],
    padding: spacing[5],
    borderWidth: 1,
    borderColor: colors.ruleStrong,
    borderRadius: 12,
    backgroundColor: colors.paperWarm,
  },
  softPanel: {
    minHeight: 112,
    justifyContent: "center",
    gap: spacing[3],
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: 9,
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  softActions: {
    flexDirection: "row",
    gap: spacing[3],
  },
});
