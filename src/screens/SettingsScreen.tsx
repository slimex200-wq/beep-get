import React, { useState } from "react";
import { Alert, Linking, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ActionButton } from "@/components/ActionButton";
import { AppSurface } from "@/components/AppSurface";
import { HeaderBar } from "@/components/HeaderBar";
import { StatusDot } from "@/components/StatusDot";
import { colors, spacing } from "@/design/tokens";
import { type } from "@/design/typography";
import type { RootStackParamList } from "@/navigation/RootNavigator";
import { generateShareText } from "@/services/contactService";
import { deleteAccount } from "@/services/accountService";
import { signOut } from "@/services/authService";
import { useAuthStore } from "@/stores/authStore";
import { useMessageStore } from "@/stores/messageStore";
import { useFriendStore } from "@/stores/friendStore";
import { useDictionaryStore } from "@/stores/dictionaryStore";
import { useCollectionStore } from "@/stores/collectionStore";
import { useSkinStore } from "@/stores/skinStore";

function resetUserStores() {
  useMessageStore.getState().reset();
  useFriendStore.getState().reset();
  useDictionaryStore.getState().reset();
  useCollectionStore.getState().reset();
  useSkinStore.getState().reset();
}

const PRIVACY_POLICY_URL =
  process.env.EXPO_PUBLIC_PRIVACY_URL ?? "https://hypeboyo.com/beep-get/privacy";
const ACCOUNT_DELETION_URL =
  process.env.EXPO_PUBLIC_ACCOUNT_DELETION_URL ?? "https://hypeboyo.com/beep-get/delete-account";

export function SettingsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { profile, setSession } = useAuthStore();
  const [busy, setBusy] = useState(false);

  const closeToMy = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate("Main", { screen: "My" });
  };

  const shareBeepId = async () => {
    if (!profile) return;
    await Share.share({ message: generateShareText(profile.beep_id, profile.nickname) });
  };

  const openUrl = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert("BEEP-GET", "Could not open this link.");
    }
  };

  const logout = async () => {
    try {
      setBusy(true);
      await signOut();
      resetUserStores();
      setSession(null);
    } catch (err: any) {
      Alert.alert("Logout failed", err?.message ?? "Try again.");
    } finally {
      setBusy(false);
    }
  };

  const confirmDeleteAccount = () => {
    Alert.alert(
      "Delete account?",
      "This permanently removes your profile, Beep ID, relationships, Beeps, Blinks, and private Blink media. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete account",
          style: "destructive",
          onPress: () => void runDeleteAccount(),
        },
      ],
    );
  };

  const runDeleteAccount = async () => {
    try {
      setBusy(true);
      await deleteAccount();
      resetUserStores();
      setSession(null);
      Alert.alert("Account deleted", "Your BEEP-GET account deletion has been completed.");
    } catch (err: any) {
      Alert.alert("Delete failed", err?.message ?? "Try again or use the web request link.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppSurface>
      <HeaderBar
        title="ACCOUNT"
        left="CLOSE"
        right={busy ? "..." : "ME"}
        showDot
        onLeftPress={closeToMy}
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.slip}>
          <View style={styles.slipHeader}>
            <Text style={type.slipTitle}>My Beep Slip</Text>
            <StatusDot size={7} />
          </View>
          <InfoRow label="NO." value={profile?.beep_id ?? "--------"} mono />
          <InfoRow label="NICKNAME" value={profile?.nickname ?? "Unknown"} />
          <InfoRow label="STATUS" value={profile?.status_icon ?? "online"} />
        </View>

        <View style={styles.panel}>
          <Text style={type.metaValue}>ACCOUNT ACTIONS</Text>
          <ActionButton label="SHARE BEEP ID" onPress={shareBeepId} disabled={!profile || busy} />
          <ActionButton label="LOG OUT" variant="ghost" onPress={logout} disabled={busy} />
        </View>

        <View style={styles.panel}>
          <Text style={type.metaValue}>PRIVACY & DATA</Text>
          <Text style={type.bodyMuted}>
            Account deletion starts in-app and removes your account record plus personal Beep/Blink data.
          </Text>
          <ActionButton
            label="PRIVACY POLICY"
            variant="ghost"
            onPress={() => openUrl(PRIVACY_POLICY_URL)}
            disabled={busy}
          />
          <ActionButton
            label="WEB DELETE REQUEST"
            variant="ghost"
            onPress={() => openUrl(ACCOUNT_DELETION_URL)}
            disabled={busy}
          />
          <ActionButton
            label={busy ? "DELETING..." : "DELETE ACCOUNT"}
            variant="danger"
            onPress={confirmDeleteAccount}
            disabled={busy}
          />
        </View>

        <View style={styles.footer}>
          <Text style={type.tinyMono}>BEEP-GET / PRIVATE PAGER SYSTEM</Text>
          <Text style={type.bodyMuted}>Use this page for review, privacy, and account control.</Text>
        </View>
      </ScrollView>
    </AppSurface>
  );
}

function InfoRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <View style={styles.infoRow}>
      <Text style={type.metaLabel}>{label}</Text>
      <Text selectable style={mono ? type.codeSmall : type.metaValue}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[8],
    gap: spacing[5],
  },
  slip: {
    borderWidth: 1,
    borderColor: colors.ruleStrong,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: colors.paperWarm,
  },
  slipHeader: {
    minHeight: 46,
    paddingHorizontal: spacing[5],
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: colors.ruleStrong,
  },
  infoRow: {
    minHeight: 48,
    paddingHorizontal: spacing[5],
    justifyContent: "center",
    gap: spacing[1],
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
  },
  panel: {
    gap: spacing[3],
    padding: spacing[5],
    borderWidth: 1,
    borderColor: colors.ruleStrong,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  footer: {
    gap: spacing[2],
    paddingTop: spacing[3],
  },
});
