import React, { useState } from "react";
import { Alert, Linking, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppSurface } from "@/components/AppSurface";
import { Avatar, KotlinHeader, MockupCard, MockupSection, StatusPill } from "@/components/KotlinMockupUI";
import { XLineIcon } from "@/components/MockupLineIcons";
import { AppearancePreferenceCard } from "@/components/settings/AppearancePreferenceCard";
import { SettingsActionRow } from "@/components/settings/SettingsActionRow";
import { spacing } from "@/design/tokens";
import { type } from "@/design/typography";
import { useAppPalette } from "@/design/appTheme";
import { useThemeStore } from "@/stores/themeStore";
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
import { getAvatarImageSource, getAvatarLabel } from "@/lib/avatarSource";
import { accountDeletionUrl, privacyPolicyUrl, supportUrl } from "@/lib/releaseFlags";

function resetUserStores() {
  useMessageStore.getState().reset();
  useFriendStore.getState().reset();
  useDictionaryStore.getState().reset();
  useCollectionStore.getState().reset();
  useSkinStore.getState().reset();
}

export function SettingsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { profile, setSession } = useAuthStore();
  const palette = useAppPalette();
  const themePreference = useThemeStore((state) => state.themePreference);
  const setThemePreference = useThemeStore((state) => state.setThemePreference);
  const [busy, setBusy] = useState(false);
  const avatarLabel = getAvatarLabel(profile, "ME");
  const avatarSource = getAvatarImageSource(profile?.avatar_url);
  const displayName = profile?.nickname?.trim() || "Profile";
  const beepHandle = profile?.beep_id?.trim() ? `@${profile.beep_id}` : "@--------";

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

  const openUrl = async (url: string | null, label: string) => {
    if (!url) {
      Alert.alert("Link unavailable", `${label} URL is not configured for this build.`);
      return;
    }

    try {
      await Linking.openURL(url);
    } catch (err: unknown) {
      if (!(err instanceof Error)) throw err;
      Alert.alert("BEEP-GET", "Could not open this link.");
    }
  };

  const logout = async () => {
    try {
      setBusy(true);
      await signOut();
      resetUserStores();
      setSession(null);
    } catch (err: unknown) {
      Alert.alert("Logout failed", getErrorMessage(err));
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
    } catch (err: unknown) {
      Alert.alert("Delete failed", getErrorMessage(err, "Try again or use the web request link."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppSurface backgroundColor={palette.background}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <KotlinHeader
          title="Settings"
          centered
          avatarLabel={avatarLabel}
          avatarSource={avatarSource}
          actions={[{ label: "Close", icon: <XLineIcon />, accessibilityLabel: "Close account settings", onPress: closeToMy }]}
        />

        <MockupSection label="My Beep ID" style={styles.sectionInset} />
        <MockupCard style={styles.identityCard}>
          <Avatar label={avatarLabel} source={avatarSource} size={46} />
          <View style={styles.identityCopy}>
            <Text style={[styles.name, { color: palette.text }]}>{displayName}</Text>
            <Text selectable style={[styles.handle, { color: palette.muted }]}>
              {beepHandle}
            </Text>
          </View>
          <StatusPill label={profile?.status_icon ?? "online"} tone="green" />
        </MockupCard>

        <MockupSection label="Account Actions" style={styles.sectionInset} />
        <MockupCard style={styles.listCard}>
          <SettingsActionRow
            label="Share Beep ID"
            detail={beepHandle}
            onPress={shareBeepId}
            disabled={!profile || busy}
          />
          <SettingsActionRow
            label="Log Out"
            detail="Leave this device"
            onPress={logout}
            disabled={busy}
            isLast
          />
        </MockupCard>

        <MockupSection label="Appearance" hint="System / Light / Dark" style={styles.sectionInset} />
        <AppearancePreferenceCard
          value={themePreference}
          onChange={(preference) => void setThemePreference(preference)}
          style={styles.cardInset}
        />

        <MockupSection label="Privacy & Data" style={styles.sectionInset} />
        <MockupCard style={styles.listCard}>
          <SettingsActionRow
            label="Privacy Policy"
            detail="Data handling"
            onPress={() => openUrl(privacyPolicyUrl, "Privacy policy")}
            disabled={busy}
          />
          <SettingsActionRow
            label="Support"
            detail="Help and contact"
            onPress={() => openUrl(supportUrl, "Support")}
            disabled={busy}
          />
          <SettingsActionRow
            label="Web Delete Request"
            detail="Fallback form"
            onPress={() => openUrl(accountDeletionUrl, "Account deletion")}
            disabled={busy}
          />
          <SettingsActionRow
            label={busy ? "Deleting" : "Delete Account"}
            detail="Remove profile and private data"
            tone="danger"
            onPress={confirmDeleteAccount}
            disabled={busy}
            isLast
          />
        </MockupCard>
      </ScrollView>
    </AppSurface>
  );
}

function getErrorMessage(err: unknown, fallback = "Try again.") {
  return err instanceof Error ? err.message : fallback;
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 96,
    gap: spacing[4],
  },
  sectionInset: {
    marginHorizontal: spacing[5],
  },
  identityCard: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[4],
    marginHorizontal: spacing[5],
    padding: spacing[4],
  },
  identityCopy: {
    flex: 1,
    gap: spacing[1],
  },
  name: {
    ...type.metaValue,
    fontSize: 12,
  },
  handle: {
    ...type.bodyMuted,
  },
  listCard: {
    marginHorizontal: spacing[5],
    paddingVertical: spacing[2],
  },
  cardInset: {
    marginHorizontal: spacing[5],
  },
});
