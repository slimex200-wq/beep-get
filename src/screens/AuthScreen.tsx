import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, Alert } from "react-native";
import { neumorphism as theme } from "@/theme/neumorphism";
import { BeepButton } from "@/components/BeepButton";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/lib/supabase";

export function AuthScreen() {
  const { setSession, initProfile } = useAuthStore();
  const [nickname, setNickname] = useState("");
  const [step, setStep] = useState<"login" | "nickname">("login");

  const handleGoogleLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
      });
      if (error) throw error;
    } catch (err: any) {
      Alert.alert("로그인 실패", err.message);
    }
  };

  const handleSetNickname = async () => {
    if (!nickname.trim()) {
      Alert.alert("닉네임을 입력하세요");
      return;
    }
    try {
      const beepId = await initProfile(nickname.trim());
      Alert.alert("가입 완료", `삐삐 번호: ${beepId}`);
    } catch (err: any) {
      Alert.alert("오류", err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.brand}>BEEP-GET</Text>
      <Text style={styles.subtitle}>홈 화면에 삐삐 한 대를 놓다</Text>

      {step === "login" ? (
        <View style={styles.buttons}>
          <BeepButton title="Google로 시작" onPress={handleGoogleLogin} />
          <BeepButton
            title="Apple로 시작"
            onPress={() => {}}
            variant="secondary"
          />
        </View>
      ) : (
        <View style={styles.nicknameForm}>
          <Text style={styles.label}>닉네임</Text>
          <TextInput
            style={styles.input}
            value={nickname}
            onChangeText={setNickname}
            placeholder="2~20자"
            placeholderTextColor={theme.colors.textSecondary}
            maxLength={20}
          />
          <BeepButton title="시작하기" onPress={handleSetNickname} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.xl,
  },
  brand: {
    fontFamily: theme.fonts.pixel,
    fontSize: 28,
    color: theme.colors.primary,
    letterSpacing: 4,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontFamily: theme.fonts.lcd,
    fontSize: 18,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl * 2,
  },
  buttons: {
    width: "100%",
    gap: theme.spacing.md,
  },
  nicknameForm: {
    width: "100%",
    gap: theme.spacing.md,
  },
  label: {
    fontFamily: theme.fonts.pixel,
    fontSize: 11,
    color: theme.colors.textSecondary,
    letterSpacing: 1,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.md,
    fontFamily: theme.fonts.lcd,
    fontSize: 20,
    color: theme.colors.textPrimary,
    textAlign: "center",
  },
});
