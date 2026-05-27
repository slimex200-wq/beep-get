import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppSurface } from "@/components/AppSurface";
import { ActionButton } from "@/components/ActionButton";
import {
  KotlinHeader,
  MiniFrameStrip,
  MockupCard,
  MockupSection,
  StatusPill,
} from "@/components/KotlinMockupUI";
import { colors, radius, spacing } from "@/design/tokens";
import { type } from "@/design/typography";
import { useAppPalette } from "@/design/appTheme";
import type { RootStackParamList } from "@/navigation/RootNavigator";
import { useAuthStore } from "@/stores/authStore";
import { useDictionaryStore } from "@/stores/dictionaryStore";

const DEFAULT_REPLY_SLOTS = ["Done", "8282", "View"];

type PreviewState = "empty" | "incoming-beep" | "incoming-blink";

export function WidgetStatesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "WidgetStates">>();
  const { profile } = useAuthStore();
  const { entries } = useDictionaryStore();
  const palette = useAppPalette();
  const [size, setSize] = useState<"small" | "medium">(route.params?.size ?? "medium");
  const [previewState, setPreviewState] = useState<PreviewState>("incoming-blink");

  const replySlots = useMemo(() => {
    const saved = entries.map((entry) => entry.code).filter(Boolean);
    return Array.from(new Set([...saved, ...DEFAULT_REPLY_SLOTS])).slice(0, 3);
  }, [entries]);

  const close = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate("Main", { screen: "My" });
  };

  return (
    <AppSurface backgroundColor="#F8F6F1">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <KotlinHeader title="Widget Layouts" centered actions={[{ label: "×", onPress: close }]} />

        <MockupSection label="Preview Size" hint={profile?.beep_id ?? "NO ID"} />
        <View style={styles.segmentRow}>
          <ActionButton
            label="SM Widget"
            mono
            flex
            variant={size === "small" ? "dark" : "light"}
            onPress={() => setSize("small")}
          />
          <ActionButton
            label="MD List Widget"
            mono
            flex
            variant={size === "medium" ? "dark" : "light"}
            onPress={() => setSize("medium")}
          />
        </View>

        <MockupCard style={styles.previewCard}>
          <View style={styles.previewTop}>
            <Text style={[type.tinyMono, { color: palette.muted }]}>LIVE PREVIEW</Text>
            <StatusPill label={size === "medium" ? "3 queued slots" : "active preview"} tone="green" />
          </View>
          <WidgetMockup size={size} state={previewState} slots={replySlots} />
        </MockupCard>

        <MockupSection label="Widget State" />
        <View style={styles.segmentRow}>
          {(["empty", "incoming-beep", "incoming-blink"] as const).map((state) => (
            <Pressable
              key={state}
              accessibilityRole="button"
              onPress={() => setPreviewState(state)}
              style={({ pressed }) => [
                styles.stateChip,
                {
                  backgroundColor: previewState === state ? palette.primary : palette.chip,
                  borderColor: previewState === state ? palette.primary : palette.rule,
                },
                pressed && styles.pressed,
              ]}
            >
              <Text
                style={[
                  styles.stateChipText,
                  { color: previewState === state ? palette.primaryText : palette.text },
                ]}
              >
                {state === "empty" ? "Empty" : state === "incoming-beep" ? "Beep" : "Blink"}
              </Text>
            </Pressable>
          ))}
        </View>

        <MockupSection label="Quick Replies" />
        <MockupCard style={styles.replyCard}>
          {replySlots.map((slot) => (
            <View key={slot} style={[styles.replySlot, { borderColor: palette.rule, backgroundColor: palette.card }]}>
              <Text style={[styles.replyText, { color: palette.text }]}>{slot}</Text>
            </View>
          ))}
        </MockupCard>
      </ScrollView>
    </AppSurface>
  );
}

function WidgetMockup({
  size,
  state,
  slots,
}: {
  size: "small" | "medium";
  state: PreviewState;
  slots: string[];
}) {
  const palette = useAppPalette();
  const isEmpty = state === "empty";
  const isBlink = state === "incoming-blink";

  return (
    <View style={[styles.widgetShell, size === "medium" && styles.widgetShellMedium, { backgroundColor: palette.input }]}>
      <View style={styles.widgetHeader}>
        <Text style={[styles.widgetLabel, { color: palette.muted }]}>BEEP-GET</Text>
        <View style={styles.widgetDot} />
      </View>
      {isEmpty ? (
        <View style={styles.emptyWidget}>
          <Text style={[styles.widgetCode, { color: palette.muted }]}>----</Text>
          <Text style={[type.tinyMono, { color: palette.muted }]}>WAITING</Text>
        </View>
      ) : (
        <>
          <Text style={[styles.widgetCode, { color: palette.text }]}>8282</Text>
          <Text style={[styles.widgetMeaning, { color: palette.text }]}>빨리 와줘</Text>
          {isBlink ? <MiniFrameStrip compact /> : null}
          {size === "medium" ? (
            <View style={styles.widgetReplyRow}>
              {slots.map((slot) => (
                <View key={slot} style={[styles.widgetReplyChip, { backgroundColor: palette.primary }]}>
                  <Text style={[styles.widgetReplyText, { color: palette.primaryText }]}>{slot}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 96,
    gap: spacing[4],
  },
  segmentRow: {
    flexDirection: "row",
    gap: spacing[3],
    paddingHorizontal: spacing[5],
  },
  previewCard: {
    gap: spacing[4],
    marginHorizontal: spacing[5],
    padding: spacing[4],
  },
  previewTop: {
    minHeight: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing[3],
  },
  stateChip: {
    flex: 1,
    minHeight: 38,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: radius.pill,
  },
  stateChipText: {
    ...type.button,
    fontSize: 11,
  },
  replyCard: {
    minHeight: 64,
    flexDirection: "row",
    gap: spacing[3],
    marginHorizontal: spacing[5],
    padding: spacing[4],
  },
  replySlot: {
    flex: 1,
    minHeight: 38,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: radius.control,
  },
  replyText: {
    ...type.button,
  },
  widgetShell: {
    minHeight: 156,
    gap: spacing[3],
    padding: spacing[4],
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.ruleStrong,
  },
  widgetShellMedium: {
    minHeight: 220,
  },
  widgetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  widgetLabel: {
    ...type.tinyMono,
  },
  widgetDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.red,
  },
  widgetCode: {
    ...type.codeMedium,
    fontSize: 44,
    lineHeight: 52,
    textAlign: "center",
  },
  widgetMeaning: {
    ...type.metaValue,
    textAlign: "center",
  },
  emptyWidget: {
    flex: 1,
    justifyContent: "center",
    gap: spacing[2],
  },
  widgetReplyRow: {
    flexDirection: "row",
    gap: spacing[2],
  },
  widgetReplyChip: {
    flex: 1,
    minHeight: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.button,
  },
  widgetReplyText: {
    ...type.tinyMono,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ translateY: 1 }],
  },
});
