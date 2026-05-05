import React, { useEffect, useMemo } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "@/design/tokens";
import { type } from "@/design/typography";
import { ActionButton } from "@/components/ActionButton";
import { AppSurface } from "@/components/AppSurface";
import { HeaderBar } from "@/components/HeaderBar";
import { StatusDot } from "@/components/StatusDot";
import { TicketLogRow } from "@/components/TicketLogRow";
import { useAuthStore } from "@/stores/authStore";
import { useMessageStore } from "@/stores/messageStore";
import { messageToSlipSignal } from "@/lib/slipUiModels";

export function LogsScreen() {
  const { profile } = useAuthStore();
  const { saved, fetchSaved } = useMessageStore();

  useEffect(() => {
    if (!profile) return;
    fetchSaved(profile.id).catch(reportError);
  }, [profile?.id, fetchSaved]);

  const logs = useMemo(
    () => saved.map((message, index) => messageToSlipSignal(message, { index })),
    [saved]
  );

  const refresh = () => {
    if (!profile) return;
    fetchSaved(profile.id).catch(reportError);
  };

  return (
    <AppSurface>
      <HeaderBar title="BEEP-GET LOG" right="SAVED" onRightPress={refresh} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.titleRow}>
          <Text style={type.metaValue}>SLIP LEDGER</Text>
          <StatusDot size={7} />
        </View>
        <View style={styles.list}>
          {logs.length > 0 ? (
            logs.map((item) => <TicketLogRow key={item.id} item={item} />)
          ) : (
            <View style={styles.empty}>
              <Text style={type.metaValue}>NO SAVED SLIPS</Text>
              <Text style={type.bodyMuted}>Use SAVE LOG in Today or Reply Room.</Text>
            </View>
          )}
        </View>
        <View style={styles.note}>
          <Text style={type.tinyMono}>NOTE.</Text>
          <Text style={type.bodyMuted}>
            Expired unsaved Blinks keep only metadata. Saved slips remain in this private ledger.
          </Text>
        </View>
        <ActionButton label="REFRESH LOG" variant="ghost" mono onPress={refresh} />
      </ScrollView>
    </AppSurface>
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
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  list: {
    gap: spacing[3],
  },
  note: {
    borderWidth: 1,
    borderColor: colors.ruleStrong,
    borderRadius: radius.control,
    padding: spacing[5],
    gap: spacing[2],
  },
  empty: {
    minHeight: 112,
    justifyContent: "center",
    gap: spacing[2],
    borderWidth: 1,
    borderColor: colors.ruleStrong,
    borderRadius: radius.control,
    padding: spacing[5],
    backgroundColor: colors.paperWarm,
  },
});
