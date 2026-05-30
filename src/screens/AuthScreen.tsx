import React, { useEffect, useRef, useState } from "react";
import * as AppleAuthentication from "expo-apple-authentication";
import { StatusBar } from "expo-status-bar";
import {
  Alert,
  Animated,
  Easing,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { BeepyMascot } from "@/components/BeepyMascot";
import { AVATAR_PRESETS } from "@/design/avatarPresets";
import { mockupPhotoUris } from "@/design/mockupPhotos";
import { colors, radius, spacing } from "@/design/tokens";
import { type } from "@/design/typography";
import {
  getPlatformAuthLabel,
  getPlatformAuthProviders,
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

const authBeepyFrames = {
  waiting: require("../../assets/brand/emotes/classic-paper/classic-paper__waiting.png"),
  ping: require("../../assets/brand/emotes/classic-paper/classic-paper__ping.png"),
  openSignal: require("../../assets/brand/emotes/classic-paper/classic-paper__open-signal.png"),
} as const;

export function AuthScreen() {
  const { enterPreviewMode, initProfile, profile, user } = useAuthStore();
  const [nickname, setNickname] = useState(profile?.nickname ?? "");
  const [avatarUri, setAvatarUri] = useState(profile?.avatar_url ?? mockupPhotoUris.profile);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const authProviders = getPlatformAuthProviders(Platform.OS);
  const showNicknameForm = Boolean(user);
  const profileHint = profile?.nickname
    ? "Choose a profile photo to finish your Beep ID."
    : "Set a nickname and profile photo to create your Beep ID.";

  useEffect(() => {
    if (profile?.nickname) setNickname(profile.nickname);
    setAvatarUri(profile?.avatar_url?.trim() ? profile.avatar_url : mockupPhotoUris.profile);
  }, [profile?.avatar_url, profile?.nickname]);

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
      await initProfile(trimmed, avatarUri);
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
          {showNicknameForm ? (
            <BeepyMascot size={112} style={styles.mascot} />
          ) : (
            <AuthSignalDemo />
          )}
          <Text style={styles.logo}>BEEP-GET</Text>
          <Text style={styles.subtitle}>A private pager for close friends.</Text>
          <View style={styles.rule} />

          {showNicknameForm ? (
            <View style={styles.form}>
              <Text style={styles.label}>NICKNAME</Text>
              <Text style={styles.authHint}>{profileHint}</Text>
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
              <View style={styles.avatarSetup}>
                <Text style={styles.label}>PROFILE PHOTO</Text>
                <View style={styles.avatarPreviewFrame}>
                  <Image source={{ uri: avatarUri }} style={styles.avatarPreviewImage} resizeMode="cover" />
                </View>
                <View style={styles.avatarOptions}>
                  {AVATAR_PRESETS.map((uri, index) => {
                    const active = avatarUri === uri;
                    return (
                      <Pressable
                        key={uri}
                        accessibilityLabel={`Choose profile photo ${index + 1}`}
                        accessibilityRole="button"
                        accessibilityState={{ selected: active }}
                        onPress={() => setAvatarUri(uri)}
                        style={({ pressed }) => [
                          styles.avatarChoice,
                          active && styles.avatarChoiceSelected,
                          pressed && styles.pressed,
                        ]}
                      >
                        <Image source={{ uri }} style={styles.avatarChoiceImage} resizeMode="cover" />
                      </Pressable>
                    );
                  })}
                </View>
              </View>
              <Pressable
                accessibilityLabel="Finish profile"
                accessibilityRole="button"
                onPress={handleSetNickname}
                style={({ pressed }) => [styles.finishButton, pressed && styles.pressed]}
              >
                <Text style={styles.finishButtonText}>FINISH PROFILE</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.buttons}>
              <Text style={styles.authHint}>
                Sign in once. Your private Beep ID comes next.
              </Text>
              <ProviderAuthButton
                provider={authProviders[0]}
                onPress={() => handleProviderLogin(authProviders[0])}
                prominent
              />
              {authProviders.slice(1).map((provider) => (
                <ProviderAuthButton
                  key={provider}
                  provider={provider}
                  onPress={() => handleProviderLogin(provider)}
                />
              ))}
              {isUiPreviewEnabled ? (
                <Pressable
                  accessibilityLabel="Open UI preview"
                  accessibilityRole="button"
                  onPress={enterPreviewMode}
                  style={({ pressed }) => [styles.previewButton, pressed && styles.pressed]}
                >
                  <Text style={styles.previewButtonText}>UI PREVIEW</Text>
                </Pressable>
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

type ProviderAuthButtonProps = {
  provider: PlatformAuthProvider;
  onPress: () => void;
  prominent?: boolean;
  compact?: boolean;
  style?: ViewStyle;
};

function ProviderAuthButton({
  provider,
  onPress,
  prominent = false,
  compact = false,
  style,
}: ProviderAuthButtonProps) {
  const label = getPlatformAuthLabel(provider);

  if (provider === "apple" && Platform.OS === "ios" && prominent) {
    return (
      <AppleAuthentication.AppleAuthenticationButton
        buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
        buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
        cornerRadius={radius.button}
        onPress={onPress}
        style={[styles.appleNativeButton, style]}
      />
    );
  }

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.providerButton,
        prominent && styles.providerButtonProminent,
        compact && styles.providerButtonCompact,
        provider === "apple" && styles.providerApple,
        provider === "google" && styles.providerGoogle,
        provider === "kakao" && styles.providerKakao,
        pressed && styles.pressed,
        style,
      ]}
    >
      <ProviderLogo provider={provider} light={provider === "apple"} />
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        style={[
          styles.providerLabel,
          provider === "apple" && styles.providerLabelLight,
          provider === "kakao" && styles.providerLabelKakao,
          compact && styles.providerLabelCompact,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function ProviderLogo({ provider, light = false }: { provider: PlatformAuthProvider; light?: boolean }) {
  if (provider === "apple") {
    return (
      <Svg width={20} height={20} viewBox="0 0 24 24" accessibilityLabel="Apple logo">
        <Path
          fill={light ? colors.white : colors.ink}
          d="M18.71 19.5c-.83 1.24-1.71 2.45-3.06 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.26-2.15 3.76.03 2.99 2.62 3.99 2.65 4-.03.07-.42 1.44-1.35 2.86M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"
        />
      </Svg>
    );
  }

  if (provider === "google") {
    return (
      <Svg width={20} height={20} viewBox="0 0 24 24" accessibilityLabel="Google logo">
        <Path
          fill="#4285F4"
          d="M23.77 12.28c0-.82-.07-1.62-.21-2.4H12.24v4.52h6.48c-.29 1.48-1.13 2.74-2.41 3.59v2.98h3.9c2.28-2.1 3.56-5.2 3.56-8.69z"
        />
        <Path
          fill="#34A853"
          d="M12.24 24c3.24 0 5.96-1.07 7.94-2.9l-3.9-2.98c-1.08.72-2.46 1.15-4.04 1.15-3.11 0-5.75-2.1-6.69-4.93H1.54v3.08C3.51 21.33 7.56 24 12.24 24z"
        />
        <Path
          fill="#FBBC05"
          d="M5.55 14.34A7.22 7.22 0 0 1 5.17 12c0-.82.14-1.61.38-2.34V6.58H1.54A11.96 11.96 0 0 0 .24 12c0 1.94.47 3.78 1.3 5.42l4.01-3.08z"
        />
        <Path
          fill="#EA4335"
          d="M12.24 4.73c1.77 0 3.35.61 4.6 1.8l3.43-3.43C18.19 1.16 15.47 0 12.24 0 7.56 0 3.51 2.67 1.54 6.58l4.01 3.08c.94-2.83 3.58-4.93 6.69-4.93z"
        />
      </Svg>
    );
  }

  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" accessibilityLabel="Kakao logo">
      <Path
        fill="#191600"
        d="M12 3.75c5.52 0 10 3.46 10 7.72s-4.48 7.72-10 7.72c-.83 0-1.64-.08-2.41-.23l-3.09 2.1c-.2.13-.46-.05-.39-.28l.69-2.57C3.9 16.85 2 14.38 2 11.47c0-4.26 4.48-7.72 10-7.72z"
      />
    </Svg>
  );
}

function AuthSignalDemo() {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const useNativeDriver = Platform.OS !== "web";
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(progress, {
          toValue: 1,
          duration: 3200,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver,
        }),
        Animated.delay(520),
        Animated.timing(progress, {
          toValue: 0,
          duration: 1,
          useNativeDriver,
        }),
      ])
    );

    animation.start();
    return () => animation.stop();
  }, [progress]);

  const mascotX = progress.interpolate({
    inputRange: [0, 0.14, 0.25, 1],
    outputRange: [-34, -8, 0, 0],
  });
  const mascotY = progress.interpolate({
    inputRange: [0, 0.08, 0.16, 0.25, 0.56, 1],
    outputRange: [12, -10, 6, 0, 0, 0],
  });
  const mascotRotate = progress.interpolate({
    inputRange: [0, 0.15, 0.25, 0.52, 1],
    outputRange: ["-7deg", "5deg", "0deg", "-3deg", "0deg"],
  });
  const mascotScale = progress.interpolate({
    inputRange: [0, 0.16, 0.26, 0.6, 1],
    outputRange: [0.94, 1.12, 1.06, 1.1, 1.06],
  });
  const waitingOpacity = progress.interpolate({
    inputRange: [0, 0.22, 0.34, 1],
    outputRange: [1, 1, 0, 0],
  });
  const pingOpacity = progress.interpolate({
    inputRange: [0, 0.22, 0.35, 0.64, 0.76, 1],
    outputRange: [0, 0, 1, 1, 0, 0],
  });
  const openSignalOpacity = progress.interpolate({
    inputRange: [0, 0.56, 0.68, 0.92, 1],
    outputRange: [0, 0, 1, 1, 1],
  });
  const antennaRingOpacity = progress.interpolate({
    inputRange: [0, 0.32, 0.5, 0.78, 1],
    outputRange: [0, 0, 1, 0.16, 0],
  });
  const antennaRingScale = progress.interpolate({
    inputRange: [0, 0.36, 0.58, 0.86, 1],
    outputRange: [0.45, 0.45, 1.65, 2.35, 0.45],
  });
  const pulseX = progress.interpolate({
    inputRange: [0, 0.38, 0.76, 1],
    outputRange: [0, 0, 132, 132],
  });
  const pulseY = progress.interpolate({
    inputRange: [0, 0.38, 0.58, 0.76, 1],
    outputRange: [18, 18, -10, 0, 0],
  });
  const pulseOpacity = progress.interpolate({
    inputRange: [0, 0.34, 0.43, 0.78, 0.9, 1],
    outputRange: [0, 0, 1, 1, 0, 0],
  });
  const trailOpacity = progress.interpolate({
    inputRange: [0, 0.34, 0.44, 0.72, 0.92, 1],
    outputRange: [0, 0, 1, 1, 0.24, 0.12],
  });
  const trailScale = progress.interpolate({
    inputRange: [0, 0.42, 0.64, 0.9, 1],
    outputRange: [0.72, 1, 1.12, 0.9, 0.86],
  });
  const pulseScale = progress.interpolate({
    inputRange: [0, 0.42, 0.58, 0.77, 1],
    outputRange: [0.72, 1, 1.14, 0.9, 0.9],
  });
  const friendX = progress.interpolate({
    inputRange: [0, 0.18, 0.34, 1],
    outputRange: [104, 104, 0, 0],
  });
  const friendOpacity = progress.interpolate({
    inputRange: [0, 0.12, 0.3, 1],
    outputRange: [0, 0, 1, 1],
  });
  const friendScale = progress.interpolate({
    inputRange: [0, 0.72, 0.84, 1],
    outputRange: [0.98, 0.98, 1.04, 1],
  });
  const receiveGlowOpacity = progress.interpolate({
    inputRange: [0, 0.7, 0.79, 0.93, 1],
    outputRange: [0, 0, 1, 0.42, 0],
  });
  const receiptOpacity = progress.interpolate({
    inputRange: [0, 0.72, 0.84, 1],
    outputRange: [0, 0, 1, 1],
  });
  const receiptY = progress.interpolate({
    inputRange: [0, 0.72, 0.84, 1],
    outputRange: [9, 9, 0, 0],
  });
  const receiverCodeScale = progress.interpolate({
    inputRange: [0, 0.72, 0.82, 0.95, 1],
    outputRange: [0.92, 0.92, 1.08, 1, 1],
  });

  return (
    <View style={styles.demoWrap} accessibilityLabel="Animated Beepy sending a Beep to Mina's widget" accessibilityRole="image">
      <View style={styles.demoHeader}>
        <View style={styles.demoLiveDot} />
        <Text style={styles.demoHeaderText}>LIVE BEEP SEND</Text>
        <Text style={styles.demoTimer}>2.0s</Text>
      </View>
      <View style={styles.demoStage}>
        <View style={styles.demoGridLine} />
        <View style={[styles.demoGridLine, styles.demoGridLineLower]} />

        <Animated.View
          style={[
            styles.demoBeepySlot,
            {
              transform: [
                { translateX: mascotX },
                { translateY: mascotY },
                { rotate: mascotRotate },
                { scale: mascotScale },
              ],
            },
          ]}
        >
          <Animated.Image source={authBeepyFrames.waiting} resizeMode="contain" style={[styles.demoBeepyFrame, { opacity: waitingOpacity }]} />
          <Animated.Image source={authBeepyFrames.ping} resizeMode="contain" style={[styles.demoBeepyFrame, styles.demoBeepyFrameLayer, { opacity: pingOpacity }]} />
          <Animated.Image source={authBeepyFrames.openSignal} resizeMode="contain" style={[styles.demoBeepyFrame, styles.demoBeepyFrameLayer, { opacity: openSignalOpacity }]} />
          <Animated.View
            style={[
              styles.demoSignalHalo,
              { opacity: antennaRingOpacity, transform: [{ scale: antennaRingScale }] },
            ]}
          >
            <View style={styles.demoSignalHaloRing} />
          </Animated.View>
        </Animated.View>

        <View style={styles.demoSignalPath} />
        <Animated.View style={[styles.demoTrail, { opacity: trailOpacity, transform: [{ scaleX: trailScale }] }]}>
          <View style={[styles.demoTrailDot, styles.demoTrailDotRed]} />
          <View style={styles.demoTrailDot} />
          <View style={styles.demoTrailDash} />
          <View style={styles.demoTrailDot} />
        </Animated.View>
        <Animated.View
          style={[
            styles.demoPulse,
            {
              opacity: pulseOpacity,
              transform: [{ translateX: pulseX }, { translateY: pulseY }, { scale: pulseScale }],
            },
          ]}
        >
          <Text style={styles.demoPulseText}>8282</Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.demoReceiverCard,
            { opacity: friendOpacity, transform: [{ translateX: friendX }, { scale: friendScale }] },
          ]}
        >
          <Animated.View style={[styles.demoReceiveGlow, { opacity: receiveGlowOpacity }]} />
          <View style={styles.demoReceiverTop}>
            <Image source={{ uri: mockupPhotoUris.mina }} style={styles.demoFriendPhoto} resizeMode="cover" />
            <View style={styles.demoReceiverMeta}>
              <Text style={styles.demoFriendName}>Mina</Text>
              <Text style={styles.demoFriendCode}>WIDGET</Text>
            </View>
            <Animated.View style={[styles.demoReceiveDot, { opacity: receiptOpacity }]} />
          </View>
          <View style={styles.demoMiniWidget}>
            <Animated.Text style={[styles.demoWidgetCode, { transform: [{ scale: receiverCodeScale }] }]}>8282</Animated.Text>
            <Animated.Text style={[styles.demoReceiptText, { opacity: receiptOpacity, transform: [{ translateY: receiptY }] }]}>
              RECEIVED 18:05
            </Animated.Text>
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    flex: 1,
    backgroundColor: colors.stage,
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing[7],
    paddingVertical: spacing[12],
  },
  systemRow: {
    width: "100%",
    maxWidth: 360,
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
    maxWidth: 360,
    minHeight: 580,
    alignSelf: "center",
    position: "relative",
    overflow: "hidden",
    justifyContent: "flex-start",
    backgroundColor: colors.paper,
    borderRadius: radius.slip,
    borderWidth: 1,
    borderColor: colors.ruleStrong,
    paddingHorizontal: spacing[8],
    paddingTop: spacing[10],
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
    alignSelf: "center",
    marginBottom: spacing[4],
  },
  demoWrap: {
    width: "100%",
    alignSelf: "center",
    marginBottom: spacing[6],
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radius.control,
    backgroundColor: "rgba(255,255,255,0.18)",
    padding: spacing[4],
  },
  demoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
    marginBottom: spacing[3],
  },
  demoLiveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.red,
  },
  demoHeaderText: {
    ...type.tinyMono,
    flex: 1,
    color: colors.ink,
    letterSpacing: 0,
  },
  demoTimer: {
    ...type.tinyMono,
    color: colors.muted,
    letterSpacing: 0,
  },
  demoStage: {
    minHeight: 172,
    position: "relative",
    overflow: "hidden",
    borderRadius: radius.control,
    backgroundColor: "rgba(244,239,229,0.48)",
  },
  demoGridLine: {
    position: "absolute",
    left: 18,
    right: 18,
    top: 72,
    height: 1,
    backgroundColor: "rgba(10,10,10,0.11)",
  },
  demoGridLineLower: {
    top: 128,
    left: 46,
    right: 126,
    backgroundColor: colors.transparent,
    borderTopWidth: 1,
    borderStyle: "dashed",
    borderTopColor: "rgba(10,10,10,0.24)",
  },
  demoBeepySlot: {
    position: "absolute",
    left: 10,
    top: 31,
    width: 132,
    height: 124,
    alignItems: "center",
    justifyContent: "center",
  },
  demoBeepyFrame: {
    width: 128,
    height: 128,
  },
  demoBeepyFrameLayer: {
    position: "absolute",
    left: 0,
    top: 0,
  },
  demoSignalHalo: {
    position: "absolute",
    top: 6,
    right: 5,
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  demoSignalHaloRing: {
    width: 25,
    height: 25,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: colors.red,
    backgroundColor: "rgba(216,54,30,0.08)",
  },
  demoSignalPath: {
    position: "absolute",
    left: 132,
    right: 106,
    top: 88,
    height: 1,
    borderBottomWidth: 1,
    borderStyle: "dashed",
    borderBottomColor: colors.ruleStrong,
  },
  demoTrail: {
    position: "absolute",
    left: 124,
    top: 82,
    width: 96,
    height: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  demoTrailDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.ink,
  },
  demoTrailDotRed: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.red,
  },
  demoTrailDash: {
    flex: 1,
    height: 1,
    marginHorizontal: spacing[2],
    borderTopWidth: 1,
    borderStyle: "dashed",
    borderTopColor: colors.ruleStrong,
  },
  demoPulse: {
    position: "absolute",
    left: 112,
    top: 68,
    minWidth: 46,
    height: 25,
    borderRadius: 13,
    backgroundColor: colors.ink,
    borderWidth: 1,
    borderColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.red,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 2,
  },
  demoPulseText: {
    ...type.tinyMono,
    color: colors.white,
    letterSpacing: 0.2,
  },
  demoReceiverCard: {
    position: "absolute",
    right: 7,
    top: 24,
    width: 119,
    minHeight: 112,
    borderWidth: 1,
    borderColor: colors.ruleStrong,
    borderRadius: radius.control,
    backgroundColor: colors.paper,
    padding: spacing[3],
    shadowColor: colors.ink,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  demoReceiverTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
  },
  demoReceiveGlow: {
    position: "absolute",
    left: -7,
    right: -7,
    top: -7,
    bottom: -7,
    borderRadius: radius.control + 7,
    borderWidth: 2,
    borderColor: colors.red,
    backgroundColor: "rgba(216,54,30,0.08)",
  },
  demoFriendPhoto: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.ink,
  },
  demoReceiverMeta: {
    flex: 1,
    gap: 1,
  },
  demoFriendName: {
    ...type.body,
    fontWeight: "700",
    color: colors.ink,
    letterSpacing: 0,
  },
  demoFriendCode: {
    ...type.tinyMono,
    color: colors.muted,
    letterSpacing: 0,
  },
  demoMiniWidget: {
    minHeight: 59,
    marginTop: spacing[3],
    borderWidth: 1,
    borderColor: colors.ruleStrong,
    borderRadius: radius.control,
    backgroundColor: "rgba(255,255,255,0.34)",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing[1],
  },
  demoWidgetCode: {
    ...type.codeHero,
    fontSize: 29,
    lineHeight: 33,
    color: colors.ink,
    letterSpacing: 0,
  },
  demoReceiptText: {
    ...type.tinyMono,
    color: colors.red,
    letterSpacing: 0.4,
  },
  demoReceiveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.red,
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
  authHint: {
    ...type.bodyMuted,
    textAlign: "center",
    color: colors.muted,
  },
  providerButton: {
    minHeight: 46,
    width: "100%",
    borderWidth: 1,
    borderRadius: radius.button,
    paddingHorizontal: spacing[5],
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing[3],
  },
  providerButtonProminent: {
    minHeight: 48,
  },
  providerButtonCompact: {
    minHeight: 43,
    paddingHorizontal: spacing[3],
    gap: spacing[2],
  },
  providerApple: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  providerGoogle: {
    backgroundColor: "rgba(255,255,255,0.22)",
    borderColor: colors.ruleStrong,
  },
  providerKakao: {
    backgroundColor: "#FEE500",
    borderColor: "#D6BE00",
  },
  appleNativeButton: {
    width: "100%",
    minHeight: 48,
    height: 48,
  },
  providerLabel: {
    ...type.button,
    color: colors.ink,
    letterSpacing: 0,
  },
  providerLabelLight: {
    color: colors.white,
  },
  providerLabelKakao: {
    color: "#191600",
  },
  providerLabelCompact: {
    fontSize: 11,
    lineHeight: 14,
  },
  previewButton: {
    minHeight: 38,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radius.button,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  previewButtonText: {
    ...type.tinyMono,
    color: colors.ink,
    letterSpacing: 0.4,
  },
  finishButton: {
    width: "100%",
    minHeight: 43,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: colors.ink,
    backgroundColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  finishButtonText: {
    ...type.button,
    color: colors.white,
    letterSpacing: 0,
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
  avatarSetup: {
    alignItems: "center",
    gap: spacing[3],
    marginTop: spacing[1],
  },
  avatarPreviewFrame: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 1,
    borderColor: colors.ruleStrong,
    backgroundColor: "rgba(255,255,255,0.32)",
    padding: 3,
  },
  avatarPreviewImage: {
    width: "100%",
    height: "100%",
    borderRadius: 34,
  },
  avatarOptions: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing[3],
  },
  avatarChoice: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: "transparent",
    padding: 2,
  },
  avatarChoiceSelected: {
    borderColor: colors.ink,
    backgroundColor: "rgba(17,17,17,0.08)",
  },
  avatarChoiceImage: {
    width: "100%",
    height: "100%",
    borderRadius: 24,
  },
  pressed: {
    opacity: 0.72,
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
