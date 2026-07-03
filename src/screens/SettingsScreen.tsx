import React, { useState } from "react";
import {
  Alert,
  Image,
  Linking,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Card, ListRow, RowChevron, Screen, SectionLabel, Segmented } from "@/ui/primitives";

import { radius, spacing } from "@/design/tokens";
import { type } from "@/design/typography";
import { useAppPalette } from "@/design/appTheme";
import { useThemeStore, type ThemePreference } from "@/stores/themeStore";
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

const APPEARANCE_OPTIONS: readonly { readonly key: ThemePreference; readonly label: string }[] = [
  { key: "system", label: "System" },
  { key: "light", label: "Light" },
  { key: "dark", label: "Dark" },
] as const;

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
      if (err instanceof Error) {
        Alert.alert("Logout failed", getErrorMessage(err));
        return;
      }
      throw err;
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
      if (err instanceof Error) {
        Alert.alert("Delete failed", getErrorMessage(err, "Try again or use the web request link."));
        return;
      }
      throw err;
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen
      title="Account"
      onBack={closeToMy}
      backAccessibilityLabel="Back to My"
    >
      <SectionLabel>My Beep ID</SectionLabel>
      <Card style={styles.identityCard}>
        <IdentityAvatar label={avatarLabel} source={avatarSource} />
        <View style={styles.identityCopy}>
          <Text style={[styles.name, { color: palette.text }]}>{displayName}</Text>
          <Text selectable style={[styles.handle, { color: palette.muted }]}>
            {beepHandle}
          </Text>
        </View>
        <StatusChip label={profile?.status_icon ?? "online"} />
      </Card>

      <SectionLabel>Account Actions</SectionLabel>
      <Card>
        <ListRow
          title="Share Beep ID"
          meta={beepHandle}
          metaMono
          right={<RowChevron />}
          onPress={() => {
            if (!profile || busy) return;
            void shareBeepId();
          }}
        />
        <ListRow
          title="Log Out"
          meta="Leave this device"
          right={<RowChevron />}
          isLast
          onPress={() => {
            if (busy) return;
            void logout();
          }}
        />
      </Card>

      <SectionLabel>Appearance</SectionLabel>
      <Card style={styles.appearanceCard}>
        <Segmented
          options={APPEARANCE_OPTIONS}
          value={themePreference}
          onChange={(preference) => void setThemePreference(preference)}
        />
      </Card>

      <SectionLabel>Privacy & Data</SectionLabel>
      <Card>
        <ListRow
          title="Privacy Policy"
          meta="Data handling"
          right={<RowChevron />}
          onPress={() => {
            if (busy) return;
            void openUrl(privacyPolicyUrl, "Privacy policy");
          }}
        />
        <ListRow
          title="Support"
          meta="Help and contact"
          right={<RowChevron />}
          onPress={() => {
            if (busy) return;
            void openUrl(supportUrl, "Support");
          }}
        />
        <ListRow
          title="Web Delete Request"
          meta="Fallback form"
          right={<RowChevron />}
          onPress={() => {
            if (busy) return;
            void openUrl(accountDeletionUrl, "Account deletion");
          }}
        />
        <ListRow
          title={busy ? "Deleting" : "Delete Account"}
          meta="Remove profile and private data"
          right={<RowChevron />}
          isLast
          onPress={() => {
            if (busy) return;
            confirmDeleteAccount();
          }}
        />
      </Card>
    </Screen>
  );
}

function IdentityAvatar({
  label,
  source,
}: {
  readonly label: string;
  readonly source?: ImageSourcePropType;
}) {
  const palette = useAppPalette();
  return (
    <View
      style={[
        styles.avatar,
        { backgroundColor: palette.input, borderColor: palette.ruleStrong },
      ]}
    >
      {source ? (
        <Image source={source} style={styles.avatarImage} resizeMode="cover" />
      ) : (
        <Text style={[styles.avatarLabel, { color: palette.text }]}>{label.slice(0, 2)}</Text>
      )}
    </View>
  );
}

function StatusChip({ label }: { readonly label: string }) {
  const palette = useAppPalette();
  return (
    <View style={[styles.statusChip, { backgroundColor: palette.chip }]}>
      <View style={[styles.statusChipDot, { backgroundColor: palette.good }]} />
      <Text numberOfLines={1} style={[styles.statusChipText, { color: palette.muted }]}>
        {label}
      </Text>
    </View>
  );
}

function getErrorMessage(err: unknown, fallback = "Try again.") {
  return err instanceof Error ? err.message : fallback;
}

const styles = StyleSheet.create({
  identityCard: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[4],
    padding: spacing[8],
  },
  identityCopy: {
    flex: 1,
    gap: spacing[1],
    minWidth: 0,
  },
  name: {
    ...type.metaValue,
    fontSize: 12,
  },
  handle: {
    ...type.bodyMuted,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarLabel: {
    ...type.metaValue,
    fontSize: 12,
  },
  statusChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
    minHeight: 26,
    paddingHorizontal: spacing[4],
    borderRadius: radius.pill,
  },
  statusChipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusChipText: {
    ...type.tinyMono,
  },
  appearanceCard: {
    padding: spacing[4],
  },
  pressed: {
    opacity: 0.82,
    transform: [{ translateY: 1 }],
  },
});
