import React, { useEffect } from "react";
import { View, Text, StyleSheet, Share, Alert } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { BeepButton } from "@/components/BeepButton";
import { StatusPicker } from "@/components/StatusPicker";
import { useAuthStore } from "@/stores/authStore";
import { useStatusStore } from "@/stores/statusStore";
import { useSkinStore } from "@/stores/skinStore";
import { signOut } from "@/services/authService";
import { generateShareText } from "@/services/contactService";

export function ProfileScreen() {
  const theme = useTheme();
  const { profile, setSession } = useAuthStore();
  const { myStatus, setStatus, fetchMyStatus } = useStatusStore();
  const { activeSkinSlug } = useSkinStore();

  useEffect(() => {
    if (profile) fetchMyStatus(profile.id);
  }, [profile?.id]);

  const handleLogout = async () => {
    await signOut();
    setSession(null);
  };

  const handleStatusChange = async (icon: string, label: string) => {
    if (!profile) return;
    try {
      await setStatus(profile.id, icon, label);
    } catch (err: any) {
      Alert.alert("오류", err.message);
    }
  };

  const handleShare = async () => {
    if (!profile) return;
    const text = generateShareText(profile.beep_id, profile.nickname);
    await Share.share({ message: text });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.header, { fontFamily: theme.fonts.pixel, color: theme.colors.textSecondary }]}>
        MY
      </Text>

      <View style={[styles.card, { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, ...theme.shadows.raised }]}>
        <Text style={[styles.label, { fontFamily: theme.fonts.pixel, color: theme.colors.textSecondary }]}>
          삐삐 번호
        </Text>
        <Text style={[styles.beepId, { fontFamily: theme.fonts.lcd, color: theme.colors.lcdText }]}>
          {profile?.beep_id}
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, ...theme.shadows.raised }]}>
        <Text style={[styles.label, { fontFamily: theme.fonts.pixel, color: theme.colors.textSecondary }]}>
          닉네임
        </Text>
        <Text style={[styles.nickname, { fontFamily: theme.fonts.lcd, color: theme.colors.textPrimary }]}>
          {profile?.nickname}
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, ...theme.shadows.raised }]}>
        <Text style={[styles.label, { fontFamily: theme.fonts.pixel, color: theme.colors.textSecondary }]}>
          적용 스킨
        </Text>
        <Text style={[styles.skinName, { fontFamily: theme.fonts.lcd, color: theme.colors.primary }]}>
          {activeSkinSlug}
        </Text>
      </View>

      <StatusPicker
        currentIcon={myStatus?.status_icon ?? "online"}
        onSelect={handleStatusChange}
      />

      <View style={styles.actions}>
        <BeepButton title="초대 링크 공유" onPress={handleShare} variant="secondary" />
        <BeepButton title="로그아웃" onPress={handleLogout} variant="danger" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 14, letterSpacing: 2, textAlign: "center", marginBottom: 24, marginTop: 32 },
  card: { padding: 24, marginBottom: 12 },
  label: { fontSize: 10, letterSpacing: 1, marginBottom: 4 },
  beepId: { fontSize: 32, letterSpacing: 4 },
  nickname: { fontSize: 24 },
  skinName: { fontSize: 18 },
  actions: { gap: 12, marginTop: 16 },
});
