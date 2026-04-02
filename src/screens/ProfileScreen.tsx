import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { neumorphism as theme } from "@/theme/neumorphism";
import { BeepButton } from "@/components/BeepButton";
import { useAuthStore } from "@/stores/authStore";
import { signOut } from "@/services/authService";

export function ProfileScreen() {
  const { profile, setSession } = useAuthStore();

  const handleLogout = async () => {
    await signOut();
    setSession(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>MY</Text>
      <View style={styles.card}>
        <Text style={styles.label}>삐삐 번호</Text>
        <Text style={styles.beepId}>{profile?.beep_id}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>닉네임</Text>
        <Text style={styles.nickname}>{profile?.nickname}</Text>
      </View>
      <BeepButton title="로그아웃" onPress={handleLogout} variant="danger" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  header: {
    fontFamily: theme.fonts.pixel,
    fontSize: 14,
    color: theme.colors.textSecondary,
    letterSpacing: 2,
    textAlign: "center",
    marginBottom: theme.spacing.lg,
    marginTop: theme.spacing.xl,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.raised,
  },
  label: {
    fontFamily: theme.fonts.pixel,
    fontSize: 10,
    color: theme.colors.textSecondary,
    letterSpacing: 1,
    marginBottom: theme.spacing.xs,
  },
  beepId: {
    fontFamily: theme.fonts.lcd,
    fontSize: 32,
    color: theme.colors.lcdText,
    letterSpacing: 4,
  },
  nickname: {
    fontFamily: theme.fonts.lcd,
    fontSize: 24,
    color: theme.colors.textPrimary,
  },
});
