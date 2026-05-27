import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { ActionButton } from "@/components/ActionButton";
import { BeepyMascot } from "@/components/BeepyMascot";
import { colors, radius, spacing } from "@/design/tokens";
import { type } from "@/design/typography";
import {
  getPlatformAuthLabel,
  getPlatformAuthProviders,
  getPlatformAuthVariant,
  shouldUseNativeAppleSignIn,
  type PlatformAuthProvider,
} from "@/lib/platformAuth";
import { isUiPreviewEnabled } from "@/lib/uiPreview";
import {
  signInWithApple,
  signInWithAppleOAuth,
  signInWithGoogle,
  signInWithKakao,
} from "@/services/authService";
import { useAuthStore } from "@/stores/authStore";

export function AuthScreen() {
  const { enterPreviewMode, initProfile, user } = useAuthStore();
  const [nickname, setNickname] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const authProviders = getPlatformAuthProviders(Platform.OS);
  const showNicknameForm = Boolean(user);

  const handleProviderLogin = async (provider: PlatformAuthProvider) => {
    try {
      setStatusMessage(null);
      if (shouldUseNativeAppleSignIn(provider, Platform.OS)) {
        await signInWithApple();
      } else if (provider === "apple") {
        await signInWithAppleOAuth();
      } else if (provider === "kakao") {
        await signInWithKakao();
      } else {
        await signInWithGoogle();
      }
    } catch (err: any) {
      const message = normalizeAuthError(err?.message);
      setStatusMessage(message);
      Alert.alert("Login failed", message);
    }
  };

  const handleSetNickname = async () => {
    const trimmed = nickname.trim();
    if (!trimmed) {
      Alert.alert("Nickname needed", "Pick a nickname before entering BEEP-GET.");
      return;
    }

    try {
      setStatusMessage(null);
      await initProfile(trimmed);
    } catch (err: any) {
      const message = err?.message ?? "Try again.";
      setStatusMessage(message);
      Alert.alert("Profile failed", message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.stage}
    >
      <StatusBar style="light" backgroundColor={colors.stage} />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.systemRow}>
          <Text style={styles.systemMark}>+</Text>
          <Text style={styles.systemCopy}>BEEP-GET SYSTEM{"\n"}VER 1.0</Text>
        </View>

        <View style={styles.slip}>
          <View style={styles.topNotch} />
          <BeepyMascot size={148} style={styles.mascot} />
          <Text style={styles.logo}>BEEP-GET</Text>
          <Text style={styles.subtitle}>A private pager for close friends.</Text>
          <View style={styles.rule} />

          {showNicknameForm ? (
            <View style={styles.form}>
              <Text style={styles.label}>NICKNAME</Text>
              <TextInput
                style={styles.input}
                value={nickname}
                onChangeText={setNickname}
                placeholder="2-20 characters"
                placeholderTextColor={colors.muted2}
                maxLength={20}
                returnKeyType="done"
                onSubmitEditing={handleSetNickname}
              />
              <ActionButton
                label="ENTER BEEP-GET"
                onPress={handleSetNickname}
                variant="dark"
                style={styles.fullButton}
              />
            </View>
          ) : (
            <View style={styles.buttons}>
              {authProviders.map((provider) => (
                <ActionButton
                  key={provider}
                  label={getPlatformAuthLabel(provider)}
                  onPress={() => handleProviderLogin(provider)}
                  variant={getPlatformAuthVariant(provider)}
                  style={styles.fullButton}
                />
              ))}
              {isUiPreviewEnabled ? (
                <ActionButton
                  label="UI PREVIEW"
                  onPress={enterPreviewMode}
                  variant="ghost"
                  mono
                  style={styles.fullButton}
                />
              ) : null}
            </View>
          )}

          {statusMessage ? <Text style={styles.statusMessage}>{statusMessage}</Text> : null}

          <View style={styles.footerStamp}>
            <Text style={styles.footerText}>PRIVATE PAGER{"\n"}FOR CLOSE FRIENDS</Text>
          </View>
          <View style={styles.perforation}>
            {Array.from({ length: 15 }).map((_, index) => (
              <View key={index} style={styles.perforationDot} />
            ))}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function normalizeAuthError(message?: string): string {
  if (!message) return "Try again.";
  if (message.includes("Unsupported provider")) {
    return "This login provider is not enabled yet. Try another sign-in option.";
  }
  return message;
}

const styles = StyleSheet.create({
  stage: {
    flex: 1,
    backgroundColor: colors.stage,
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: spacing[7],
    paddingVertical: spacing[12],
  },
  systemRow: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing[6],
  },
  systemMark: {
    ...type.boardLabel,
    fontSize: 22,
    lineHeight: 24,
    color: "rgba(247,243,234,0.52)",
  },
  systemCopy: {
    ...type.tinyMono,
    textAlign: "right",
    color: "rgba(247,243,234,0.58)",
    letterSpacing: 1.1,
  },
  slip: {
    width: "100%",
    maxWidth: 420,
    minHeight: 560,
    alignSelf: "center",
    position: "relative",
    overflow: "hidden",
    justifyContent: "center",
    backgroundColor: colors.paper,
    borderRadius: radius.slip,
    borderWidth: 1,
    borderColor: colors.ruleStrong,
    paddingHorizontal: spacing[8],
    paddingTop: spacing[12],
    paddingBottom: spacing[12],
  },
  topNotch: {
    position: "absolute",
    top: -1,
    left: "50%",
    width: 34,
    height: 13,
    marginLeft: -17,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    backgroundColor: colors.stage,
  },
  mascot: {
    marginBottom: spacing[4],
  },
  logo: {
    fontFamily: type.codeHero.fontFamily,
    color: colors.ink,
    fontSize: 42,
    lineHeight: 48,
    textAlign: "center",
    fontWeight: "900",
  },
  subtitle: {
    ...type.bodyMuted,
    textAlign: "center",
    color: colors.ink,
    marginTop: spacing[2],
  },
  rule: {
    height: 1,
    borderBottomWidth: 1,
    borderStyle: "dashed",
    borderBottomColor: colors.ruleStrong,
    marginTop: spacing[8],
    marginBottom: spacing[7],
  },
  buttons: {
    gap: spacing[4],
  },
  fullButton: {
    width: "100%",
  },
  form: {
    gap: spacing[4],
  },
  label: {
    ...type.metaLabel,
    color: colors.muted,
  },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.ruleStrong,
    borderRadius: radius.button,
    backgroundColor: "rgba(255,255,255,0.22)",
    paddingHorizontal: spacing[5],
    textAlign: "center",
    ...type.body,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "700",
  },
  statusMessage: {
    ...type.bodyMuted,
    color: colors.red,
    textAlign: "center",
    marginTop: spacing[5],
  },
  footerStamp: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: colors.ruleStrong,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    marginTop: spacing[8],
  },
  footerText: {
    ...type.tinyMono,
    color: colors.ink,
  },
  perforation: {
    position: "absolute",
    left: spacing[6],
    right: spacing[6],
    bottom: -5,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  perforationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.stage,
  },
});
