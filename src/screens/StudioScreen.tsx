import React, { useEffect, useMemo } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { colors, spacing } from "@/design/tokens";
import { type } from "@/design/typography";
import { useAppPalette, type AppPalette } from "@/design/appTheme";
import { ActionButton } from "@/components/ActionButton";
import { AppSurface } from "@/components/AppSurface";
import { HeaderBar } from "@/components/HeaderBar";
import { StatusDot } from "@/components/StatusDot";
import { WidgetCard, type WidgetState } from "@/components/WidgetCard";
import type { RootStackParamList } from "@/navigation/RootNavigator";
import { isSupabaseConfigured } from "@/lib/supabase";
import { messageToSlipSignal } from "@/lib/slipUiModels";
import { useAuthStore } from "@/stores/authStore";
import { useDictionaryStore } from "@/stores/dictionaryStore";
import { useFriendStore } from "@/stores/friendStore";
import { useMessageStore } from "@/stores/messageStore";
import { syncWidgetData, triggerWidgetReload } from "@/services/widgetService";

export function StudioScreen() {
  const palette = useAppPalette();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { profile } = useAuthStore();
  const { entries, fetch: fetchDictionary } = useDictionaryStore();
  const { friends, fetch: fetchFriends } = useFriendStore();
  const { received, fetchReceived, quickReply } = useMessageStore();

  useEffect(() => {
    if (!profile) return;
    fetchFriends(profile.id).catch(reportError);
    fetchDictionary(profile.id).catch(reportError);
    fetchReceived(profile.id, friends).catch(reportError);
  }, [profile?.id, friends.length, fetchFriends, fetchDictionary, fetchReceived]);

  const latest = received[0];
  const latestSignal = useMemo(
    () => (latest ? messageToSlipSignal(latest, { index: 0 }) : null),
    [latest]
  );
  const widgetState: WidgetState = latest
    ? latest.kind === "blink" || latest.media
      ? "incoming-blink"
      : "incoming-beep"
    : "empty";
  const slots = useMemo(() => {
    const codes = entries.map((entry) => entry.code).filter(Boolean);
    return Array.from(new Set([...codes, "8282", "486", "1004", "000"])).slice(0, 4);
  }, [entries]);

  const syncNow = () => {
    syncWidgetData(received, friends);
    triggerWidgetReload();
    Alert.alert("Widget synced", "Latest slip data was pushed to the native widget.");
  };

  const closeToMy = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate("Main", { screen: "My" });
  };

  const sendSlotReply = async (code: string) => {
    if (!latest) {
      Alert.alert("No incoming slip", "Receive a Beep or Blink before testing reply slots.");
      return;
    }

    try {
      await quickReply(latest.id, code);
      Alert.alert("Reply sent", `${code} Beep sent from the Studio slot.`);
    } catch (err: any) {
      Alert.alert("Reply failed", err?.message ?? "Try again.");
    }
  };

  return (
    <AppSurface>
      <HeaderBar
        title="BEEP-GET STUDIO"
        left="CLOSE"
        right="SYNC"
        showDot
        onLeftPress={closeToMy}
        onRightPress={syncNow}
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.panel, { borderColor: palette.ruleStrong, backgroundColor: palette.cardSoft }]}>
          <Text style={[type.metaValue, { color: palette.text }]}>RUNTIME CHECKLIST</Text>
          <StatusRow
            label="Supabase env"
            ok={isSupabaseConfigured}
            palette={palette}
            onOpen={() =>
              Alert.alert(
                "Supabase env",
                "Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY before production QA."
              )
            }
          />
          <StatusRow
            label="Signed in"
            ok={Boolean(profile)}
            palette={palette}
            onOpen={() => Alert.alert("Signed in", "Sign in from the first screen, then reopen Studio.")}
          />
          <StatusRow
            label="Widget payload"
            ok={Boolean(latest)}
            palette={palette}
            onOpen={() => navigation.navigate("Main", { screen: "Today" })}
          />
          <StatusRow
            label="Direct reply slots"
            ok={slots.length > 0}
            palette={palette}
            onOpen={() => Alert.alert("Reply slots", "Add code presets or use the default 8282 / 486 slots.")}
          />
        </View>

        <Text style={[type.metaValue, { color: palette.text }]}>WIDGET PREVIEW</Text>
        <View style={styles.previewRow}>
          <View style={styles.previewCard}>
            <WidgetCard
              state={widgetState}
              signal={latestSignal}
              stripFrameUris={latest?.media?.stripFrameUris}
            />
          </View>
          <View style={styles.sizeColumn}>
            <ActionButton
              label="SMALL"
              mono
              onPress={() => navigation.navigate("WidgetStates", { size: "small" })}
            />
            <ActionButton
              label="MEDIUM"
              mono
              variant="dark"
              onPress={() => navigation.navigate("WidgetStates", { size: "medium" })}
            />
          </View>
        </View>

        <Text style={[type.metaValue, { color: palette.text }]}>DIRECT REPLY SLOTS</Text>
        <View style={styles.chips}>
          {slots.map((label) => (
            <ActionButton
              key={label}
              label={label}
              mono={/^[0-9A-Z]+$/.test(label)}
              flex
              disabled={!latest}
              onPress={() => sendSlotReply(label)}
            />
          ))}
        </View>
        <ActionButton label="SYNC WIDGET DATA" variant="dark" onPress={syncNow} />
      </ScrollView>
    </AppSurface>
  );
}

function StatusRow({
  label,
  ok,
  palette,
  onOpen,
}: {
  label: string;
  ok: boolean;
  palette: AppPalette;
  onOpen?: () => void;
}) {
  return (
    <View style={[styles.statusRow, { borderTopColor: palette.rule }]}>
      <Text style={[type.bodyMuted, { color: palette.muted }]}>{label}</Text>
      {ok ? (
        <StatusDot color={colors.greenDot} size={8} />
      ) : onOpen ? (
        <Pressable
          accessibilityRole="button"
          onPress={onOpen}
          style={({ pressed }) => [pressed && styles.pressed]}
        >
          <Text style={[type.monoValue, { color: palette.text }]}>OPEN</Text>
        </Pressable>
      ) : (
        <Text style={[type.monoValue, { color: palette.text }]}>OPEN</Text>
      )}
    </View>
  );
}

function reportError(err: unknown) {
  const message = err instanceof Error ? err.message : "Unexpected error";
  Alert.alert("BEEP-GET", message);
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[8],
    gap: spacing[4],
  },
  panel: {
    borderWidth: 1,
    borderColor: colors.ruleStrong,
    borderRadius: 12,
    padding: spacing[5],
    gap: spacing[3],
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  statusRow: {
    height: 32,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: colors.rule,
  },
  pressed: {
    opacity: 0.7,
  },
  previewRow: {
    flexDirection: "row",
    gap: spacing[4],
    alignItems: "stretch",
  },
  previewCard: {
    flex: 1,
  },
  sizeColumn: {
    width: 88,
    gap: spacing[3],
  },
  chips: {
    flexDirection: "row",
    gap: spacing[3],
  },
});
