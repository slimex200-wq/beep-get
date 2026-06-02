import React, { useState } from "react";
import { Alert, Linking, Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ActionButton } from "@/components/ActionButton";
import { AppSurface } from "@/components/AppSurface";
import { Avatar, KotlinHeader, MockupCard, MockupSection, StatusPill } from "@/components/KotlinMockupUI";
import { XLineIcon } from "@/components/MockupLineIcons";
import { colors, radius, spacing } from "@/design/tokens";
import { font, type } from "@/design/typography";
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
import { mockupPhotoUris } from "@/design/mockupPhotos";
import { accountDeletionUrl, privacyPolicyUrl, supportUrl } from "@/lib/releaseFlags";

function resetUserStores() {
  useMessageStore.getState().reset();
  useFriendStore.getState().reset();
  useDictionaryStore.getState().reset();
  useCollectionStore.getState().reset();
  useSkinStore.getState().reset();
}

const APPEARANCE_OPTIONS: ReadonlyArray<{ value: ThemePreference; label: string }> = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

export function SettingsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { profile, setSession } = useAuthStore();
  const palette = useAppPalette();
  const themePreference = useThemeStore((state) => state.themePreference);
  const setThemePreference = useThemeStore((state) => state.setThemePreference);
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

  const openUrl = async (url: string | null, label: string) => {
    if (!url) {
      Alert.alert("Link unavailable", `${label} URL is not configured for this build.`);
      return;
    }

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
    <AppSurface backgroundColor="#F8F6F1">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <KotlinHeader title="Account" centered actions={[{ label: "Close", icon: <XLineIcon />, accessibilityLabel: "Close account settings", onPress: closeToMy }]} />

        <MockupSection label="My Beep ID" />
        <MockupCard style={styles.identityCard}>
          <Avatar label={profile?.nickname ?? "Me"} source={{ uri: profile?.avatar_url ?? mockupPhotoUris.profile }} size={46} />
          <View style={styles.identityCopy}>
            <Text style={[styles.name, { color: palette.text }]}>{profile?.nickname ?? "Unknown"}</Text>
            <Text selectable style={[styles.handle, { color: palette.muted }]}>
              @{profile?.beep_id ?? "--------"}
            </Text>
          </View>
          <StatusPill label={profile?.status_icon ?? "online"} tone="green" />
        </MockupCard>

        <MockupSection label="Account Actions" />
        <MockupCard style={styles.actionCard}>
          <ActionButton label="Share Beep ID" onPress={shareBeepId} disabled={!profile || busy} />
          <ActionButton label="Log Out" variant="ghost" onPress={logout} disabled={busy} />
        </MockupCard>

        <MockupSection label="Appearance" hint="System / Light / Dark" />
        <MockupCard style={styles.actionCard}>
          <Text style={[type.bodyMuted, { color: palette.muted }]}>
            Choose the app theme. System follows your device light or dark setting.
          </Text>
          <View
            accessibilityRole="radiogroup"
            style={[styles.appearanceRow, { backgroundColor: palette.input, borderColor: palette.rule }]}
          >
            {APPEARANCE_OPTIONS.map((option) => {
              const selected = themePreference === option.value;
              return (
                <Pressable
                  key={option.value}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`${option.label} theme`}
                  onPress={() => void setThemePreference(option.value)}
                  style={[
                    styles.appearanceOption,
                    selected && { backgroundColor: palette.card, borderColor: palette.ruleStrong },
                  ]}
                >
                  <Text
                    style={[
                      styles.appearanceOptionText,
                      { color: selected ? palette.text : palette.muted },
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </MockupCard>

        <MockupSection label="Privacy & Data" />
        <MockupCard style={styles.actionCard}>
          <Text style={[type.bodyMuted, { color: palette.muted }]}>
            Account deletion removes your profile, relationships, Beeps, Blinks, and private Blink media.
          </Text>
          <ActionButton
            label="Privacy Policy"
            variant="ghost"
            onPress={() => openUrl(privacyPolicyUrl, "Privacy policy")}
            disabled={busy}
          />
          <ActionButton
            label="Support"
            variant="ghost"
            onPress={() => openUrl(supportUrl, "Support")}
            disabled={busy}
          />
          <ActionButton
            label="Web Delete Request"
            variant="ghost"
            onPress={() => openUrl(accountDeletionUrl, "Account deletion")}
            disabled={busy}
          />
          <ActionButton
            label={busy ? "Deleting" : "Delete Account"}
            variant="danger"
            onPress={confirmDeleteAccount}
            disabled={busy}
          />
        </MockupCard>
      </ScrollView>
    </AppSurface>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 96,
    gap: spacing[4],
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
  actionCard: {
    gap: spacing[3],
    marginHorizontal: spacing[5],
    padding: spacing[4],
    borderRadius: radius.slipSmall,
  },
  appearanceRow: {
    flexDirection: "row",
    gap: spacing[2],
    padding: spacing[2],
    borderWidth: 1,
    borderRadius: radius.control,
  },
  appearanceOption: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing[4],
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: colors.transparent,
  },
  appearanceOptionText: {
    fontFamily: font.sansSemiBold,
    fontSize: 12,
    letterSpacing: 0.4,
  },
});
