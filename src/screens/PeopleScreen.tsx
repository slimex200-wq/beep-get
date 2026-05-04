import React, { useEffect, useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { colors, spacing } from "@/design/tokens";
import { type } from "@/design/typography";
import { ActionButton } from "@/components/ActionButton";
import { AppSurface } from "@/components/AppSurface";
import { DotRadar } from "@/components/DotRadar";
import { FriendCard } from "@/components/FriendCard";
import { HeaderBar } from "@/components/HeaderBar";
import type { RootStackParamList } from "@/navigation/RootNavigator";
import { useAuthStore } from "@/stores/authStore";
import { useFriendStore } from "@/stores/friendStore";
import { relationshipToSlipFriend } from "@/lib/slipUiModels";

export function PeopleScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { profile } = useAuthStore();
  const { friends, loading, fetch, add } = useFriendStore();
  const [beepId, setBeepId] = useState("");

  useEffect(() => {
    if (!profile) return;
    fetch(profile.id).catch(reportError);
  }, [profile?.id, fetch]);

  const slipFriends = useMemo(
    () => friends.map((friend, index) => relationshipToSlipFriend(friend, index)),
    [friends]
  );

  const addByBeepId = async () => {
    if (!profile || !beepId.trim()) return;
    try {
      await add(profile.id, beepId.trim());
      setBeepId("");
      Alert.alert("Friend added", "Close-circuit contact is ready.");
    } catch (err: any) {
      Alert.alert("Add failed", err?.message ?? "Try again.");
    }
  };

  return (
    <AppSurface>
      <HeaderBar title="PEOPLE" right={loading ? "SYNC" : "+"} showDot />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.radarArea}>
          <DotRadar size={210} />
        </View>

        <View style={styles.invitePanel}>
          <Text style={type.tinyMono}>INVITE BY BEEP ID</Text>
          <View style={styles.inviteRow}>
            <TextInput
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

        <View style={styles.friendRow}>
          {slipFriends.length > 0 ? (
            slipFriends.map((friend) => (
              <FriendCard
                key={friend.id}
                friend={friend}
                onPress={() =>
                  navigation.navigate("Send", {
                    friendId: friend.id,
                    friendName: friend.name,
                    friendNo: friend.no,
                  })
                }
              />
            ))
          ) : (
            <View style={styles.empty}>
              <Text style={type.metaValue}>NO CLOSE CIRCUIT YET</Text>
              <Text style={type.bodyMuted}>Add a friend by Beep ID to start sending slips.</Text>
            </View>
          )}
        </View>

        <Text style={type.tinyMono}>RELATIONSHIP PRESETS</Text>
        <View style={styles.chips}>
          {["CLOSE", "BEST", "ROOMMATE", "FAMILY"].map((label, index) => (
            <ActionButton key={label} label={label} variant={index === 0 ? "dark" : "light"} />
          ))}
        </View>
      </ScrollView>
    </AppSurface>
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
  radarArea: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
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
    flexDirection: "row",
    flexWrap: "wrap",
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
});
