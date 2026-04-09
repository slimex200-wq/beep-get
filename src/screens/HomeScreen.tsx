import React, { useEffect, useMemo } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { LcdDisplay } from "@/components/LcdDisplay";
import { BeepButton } from "@/components/BeepButton";
import { useAuthStore } from "@/stores/authStore";
import { useMessageStore } from "@/stores/messageStore";

export function HomeScreen() {
  const theme = useTheme();
  const { profile } = useAuthStore();
  const { received, loading, fetchReceived, read, save, subscribeRealtime, unsubscribeRealtime } =
    useMessageStore();

  useEffect(() => {
    if (!profile) return;
    fetchReceived(profile.id);
    subscribeRealtime(profile.id);
    return () => unsubscribeRealtime();
  }, [profile?.id]);

  const latestMessage = received[0];

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const h = d.getHours();
    const m = d.getMinutes().toString().padStart(2, "0");
    return `${h >= 12 ? "PM" : "AM"} ${h % 12 || 12}:${m}`;
  };

  const styles = useMemo(() => StyleSheet.create({
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
      marginBottom: theme.spacing.md,
      marginTop: theme.spacing.xl,
    },
    lcdArea: {
      gap: theme.spacing.md,
    },
    actions: {
      flexDirection: "row",
      gap: theme.spacing.sm,
    },
    empty: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.xl * 2,
      alignItems: "center",
      ...theme.shadows.inset,
    },
    emptyText: {
      fontFamily: theme.fonts.lcd,
      fontSize: 18,
      color: theme.colors.textSecondary,
    },
    list: {
      marginTop: theme.spacing.lg,
    },
    listItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    listName: {
      fontFamily: theme.fonts.lcd,
      fontSize: 16,
      color: theme.colors.textPrimary,
      flex: 1,
    },
    listCode: {
      fontFamily: theme.fonts.lcd,
      fontSize: 16,
      color: theme.colors.lcdText,
      marginRight: theme.spacing.md,
    },
    listTime: {
      fontFamily: theme.fonts.lcd,
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
  }), [theme]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>BEEP-GET</Text>

      {latestMessage ? (
        <View style={styles.lcdArea}>
          <LcdDisplay
            fromName={latestMessage.from_user_profile?.nickname ?? "???"}
            code={latestMessage.number_code}
            time={formatTime(latestMessage.created_at)}
            isNew={!latestMessage.is_read}
          />
          <View style={styles.actions}>
            <BeepButton
              title="확인"
              onPress={() => read(latestMessage.id)}
              style={{ flex: 1 }}
            />
            <BeepButton
              title="저장"
              onPress={() => save(latestMessage.id)}
              variant="secondary"
              style={{ flex: 1 }}
            />
          </View>
        </View>
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>수신된 신호 없음</Text>
        </View>
      )}

      {received.length > 1 && (
        <FlatList
          data={received.slice(1)}
          keyExtractor={(item) => item.id}
          style={styles.list}
          renderItem={({ item }) => (
            <View style={styles.listItem}>
              <Text style={styles.listName}>
                {item.from_user_profile?.nickname ?? "???"}
              </Text>
              <Text style={styles.listCode}>{item.number_code}</Text>
              <Text style={styles.listTime}>{formatTime(item.created_at)}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}
