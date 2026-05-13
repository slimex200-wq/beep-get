import React, { useMemo, useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppSurface } from "@/components/AppSurface";
import { ActionButton } from "@/components/ActionButton";
import { HeaderBar } from "@/components/HeaderBar";
import { WidgetCard, type WidgetState } from "@/components/WidgetCard";
import { colors, spacing } from "@/design/tokens";
import { type } from "@/design/typography";
import type { RootStackParamList } from "@/navigation/RootNavigator";
import { useAuthStore } from "@/stores/authStore";
import { useDictionaryStore } from "@/stores/dictionaryStore";

const DEFAULT_REPLY_SLOTS = ["OK", "8282", "OPEN"];

export function WidgetStatesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "WidgetStates">>();
  const { profile } = useAuthStore();
  const { entries } = useDictionaryStore();
  const [size, setSize] = useState<"small" | "medium">(route.params?.size ?? "medium");
  const [previewState, setPreviewState] = useState<WidgetState>("incoming-blink");

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
    <AppSurface backgroundColor={colors.paper} statusBarStyle="dark">
      <HeaderBar title="WIDGET SETUP" left="CLOSE" onLeftPress={close} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Friend-home widget</Text>
          <Text style={type.bodyMuted}>
            Add BEEP-GET to your iPhone Home Screen, then use these reply slots from the widget.
          </Text>
        </View>

        <View style={styles.setupCard}>
          <Text style={type.tinyMono}>INSTALL ON IOS</Text>
          <View style={styles.stepList}>
            <Step number="01" text="Long-press the Home Screen." />
            <Step number="02" text="Tap + and search BEEP-GET." />
            <Step number="03" text="Choose Medium for reply buttons, then Add Widget." />
          </View>
          <Text style={styles.platformNote}>
            {Platform.OS === "ios"
              ? "Widget setup is controlled by iOS. The app can preview and sync the widget data, but placement happens on the Home Screen."
              : "On Android, add the BEEP-GET widget from your launcher widget picker."}
          </Text>
        </View>

        <View style={styles.controlPanel}>
          <View style={styles.panelHeader}>
            <Text style={type.tinyMono}>CURRENT REPLY SLOTS</Text>
            <Text style={type.tinyMono}>{profile?.beep_id ?? "NO ID"}</Text>
          </View>
          <View style={styles.slotRow}>
            {replySlots.map((slot) => (
              <View key={slot} style={styles.slotChip}>
                <Text style={styles.slotText}>{slot}</Text>
              </View>
            ))}
          </View>
          <Text style={type.bodyMuted}>
            Edit slots from the signal presets. The medium widget shows the first three.
          </Text>
        </View>

        <View style={styles.sizeRow}>
          <ActionButton
            label="SMALL"
            mono
            flex
            variant={size === "small" ? "dark" : "light"}
            onPress={() => setSize("small")}
          />
          <ActionButton
            label="MEDIUM"
            mono
            flex
            variant={size === "medium" ? "dark" : "light"}
            onPress={() => setSize("medium")}
          />
        </View>

        <View style={styles.previewPanel}>
          <View style={styles.panelHeader}>
            <Text style={type.tinyMono}>LIVE PREVIEW</Text>
            <Text style={type.tinyMono}>{size.toUpperCase()}</Text>
          </View>
          <WidgetCard state={previewState} size={size} />
          <View style={styles.sizeRow}>
            <ActionButton
              label="EMPTY"
              mono
              flex
              variant={previewState === "empty" ? "dark" : "light"}
              onPress={() => setPreviewState("empty")}
            />
            <ActionButton
              label="BEEP"
              mono
              flex
              variant={previewState === "incoming-beep" ? "dark" : "light"}
              onPress={() => setPreviewState("incoming-beep")}
            />
            <ActionButton
              label="BLINK"
              mono
              flex
              variant={previewState === "incoming-blink" ? "dark" : "light"}
              onPress={() => setPreviewState("incoming-blink")}
            />
          </View>
        </View>
      </ScrollView>
    </AppSurface>
  );
}

function Step({ number, text }: { number: string; text: string }) {
  return (
    <View style={styles.step}>
      <Text style={styles.stepNumber}>{number}</Text>
      <Text style={styles.stepText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[8],
    gap: spacing[5],
  },
  hero: {
    gap: spacing[2],
    paddingTop: spacing[2],
  },
  heroTitle: {
    ...type.screenTitle,
    fontSize: 28,
    lineHeight: 32,
  },
  setupCard: {
    gap: spacing[4],
    padding: spacing[5],
    borderWidth: 1,
    borderColor: colors.ruleStrong,
    borderRadius: 12,
    backgroundColor: colors.paperWarm,
  },
  stepList: {
    gap: spacing[3],
  },
  step: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
  },
  stepNumber: {
    ...type.tinyMono,
    width: 24,
    color: colors.ink,
  },
  stepText: {
    ...type.body,
    flex: 1,
  },
  platformNote: {
    ...type.bodyMuted,
    paddingTop: spacing[2],
    borderTopWidth: 1,
    borderTopColor: colors.rule,
  },
  controlPanel: {
    gap: spacing[4],
    padding: spacing[5],
    borderWidth: 1,
    borderColor: colors.ruleStrong,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  previewPanel: {
    gap: spacing[4],
  },
  panelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing[4],
  },
  slotRow: {
    flexDirection: "row",
    gap: spacing[3],
  },
  slotChip: {
    flex: 1,
    minHeight: 38,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.ink,
    borderRadius: 7,
    backgroundColor: colors.ink,
  },
  slotText: {
    ...type.buttonMono,
    color: colors.paperWarm,
  },
  sizeRow: {
    flexDirection: "row",
    gap: spacing[3],
  },
});
