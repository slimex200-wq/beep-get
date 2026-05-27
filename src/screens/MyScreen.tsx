import React, { useEffect, useMemo, useState } from "react";
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppSurface } from "@/components/AppSurface";
import {
  IconButton,
  KotlinHeader,
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
import { useSkinStore } from "@/stores/skinStore";

const DEFAULT_WIDGET_SLOTS = ["Done", "8282", "View"];
const DEFAULT_CODES = [
  { code: "8282", meaning: "빨리 와줘" },
  { code: "486", meaning: "보고 싶어" },
  { code: "1004", meaning: "집 도착" },
  { code: "7942", meaning: "친구사이" },
  { code: "0404", meaning: "영원히 사랑해" },
];

export function MyScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { profile } = useAuthStore();
  const { entries, fetch: fetchDictionary, add } = useDictionaryStore();
  const palette = useAppPalette();
  const activeSkinSlug = useSkinStore((state) => state.activeSkinSlug);
  const setLocalActiveSkin = useSkinStore((state) => state.setLocalActiveSkin);
  const [quickReplyDialogVisible, setQuickReplyDialogVisible] = useState(false);
  const [addCodeDialogVisible, setAddCodeDialogVisible] = useState(false);
  const [draftCode, setDraftCode] = useState("");
  const [draftMeaning, setDraftMeaning] = useState("");
  const isDarkMode = activeSkinSlug === "cyber-neon";

  useEffect(() => {
    if (!profile) return;
    fetchDictionary(profile.id).catch(reportError);
  }, [profile?.id, fetchDictionary]);

  const replySlots = useMemo(() => {
    const saved = entries.map((entry) => entry.code).filter(Boolean);
    return Array.from(new Set([...saved, ...DEFAULT_WIDGET_SLOTS])).slice(0, 3);
  }, [entries]);

  const signalCodes = useMemo(() => {
    const saved = entries.map((entry) => ({ code: entry.code, meaning: entry.meaning }));
    const byCode = new Map([...DEFAULT_CODES, ...saved].map((entry) => [entry.code, entry]));
    return Array.from(byCode.values()).slice(0, 6);
  }, [entries]);

  const registerCode = async () => {
    if (!profile || !draftCode.trim() || !draftMeaning.trim()) return;
    try {
      await add(profile.id, draftCode.trim(), draftMeaning.trim());
      setDraftCode("");
      setDraftMeaning("");
      setAddCodeDialogVisible(false);
    } catch (err: any) {
      Alert.alert("Code failed", err?.message ?? "Try again.");
    }
  };

  return (
    <AppSurface backgroundColor="#F8F6F1">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <KotlinHeader
          title="My Settings"
          centered
          actions={[{ label: "⚙", onPress: () => navigation.navigate("Account") }]}
        />

        <MockupSection label="Appearance" />
        <Pressable
          accessibilityRole="button"
          onPress={() => setLocalActiveSkin(isDarkMode ? "swiss-paper" : "cyber-neon")}
        >
          <MockupCard style={styles.appearanceCard}>
            <IconButton label={isDarkMode ? "☾" : "✎"} dark size={38} />
            <View style={styles.flexCopy}>
              <Text style={[styles.rowTitle, { color: palette.text }]}>
                {isDarkMode ? "Dark Pager Mode" : "Classic Paper Light Theme"}
              </Text>
              <Text style={[type.bodyMuted, { color: palette.muted }]}>
                Tap to switch {isDarkMode ? "back to light" : "to dark"}
              </Text>
            </View>
            <Text style={styles.checkText}>{isDarkMode ? "ON" : "✓"}</Text>
          </MockupCard>
        </Pressable>

        <MockupSection label="Widget Layouts" />
        <View style={styles.widgetGrid}>
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate("WidgetStates", { size: "small" })}
            style={styles.widgetPressable}
          >
            <MockupCard style={styles.widgetCard}>
              <Text style={[type.tinyMono, { color: palette.muted }]}>SM Widget</Text>
              <View style={[styles.smallWidgetPreview, { backgroundColor: palette.input }]}>
                <Text style={[styles.previewCode, { color: palette.text }]}>8282</Text>
              </View>
              <StatusPill label="active preview" tone="green" />
            </MockupCard>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate("WidgetStates", { size: "medium" })}
            style={styles.widgetPressable}
          >
            <MockupCard style={styles.widgetCard}>
              <Text style={[type.tinyMono, { color: palette.muted }]}>MD List Widget</Text>
              <View style={styles.listPreview}>
                <View style={[styles.previewLineLong, { backgroundColor: palette.input }]} />
                <View style={[styles.previewLineShort, { backgroundColor: palette.input }]} />
              </View>
              <Text style={[styles.queuedText, { color: palette.muted }]}>3 queued slots</Text>
            </MockupCard>
          </Pressable>
        </View>

        <View style={styles.sectionActionRow}>
          <MockupSection label="Quick Replies" />
          <Pressable onPress={() => setQuickReplyDialogVisible(true)} style={styles.blackPill}>
            <Text style={styles.blackPillText}>✎ Configure Slots</Text>
          </Pressable>
        </View>
        <MockupCard style={styles.replyCard}>
          {replySlots.map((slot) => (
            <View key={slot} style={[styles.replySlot, { borderColor: palette.rule, backgroundColor: palette.card }]}>
              <Text style={[styles.replyText, { color: palette.text }]}>{slot}</Text>
            </View>
          ))}
        </MockupCard>

        <View style={styles.sectionActionRow}>
          <MockupSection label="Signal Directory Codes (On-Demand)" />
          <Pressable onPress={() => setAddCodeDialogVisible(true)} style={styles.blackPill}>
            <Text style={styles.blackPillText}>+ Add New</Text>
          </Pressable>
        </View>
        <MockupCard style={styles.codeList}>
          {signalCodes.map((entry) => (
            <Pressable
              key={entry.code}
              accessibilityRole="button"
              onPress={() => navigation.navigate("Dictionary")}
              style={({ pressed }) => [styles.codeRow, pressed && styles.pressed]}
            >
              <View style={[styles.codeBadge, { backgroundColor: palette.input }]}>
                <Text style={[styles.codeBadgeText, { color: palette.text }]}>{entry.code}</Text>
              </View>
              <Text style={[styles.codeMeaning, { color: palette.text }]}>{entry.meaning}</Text>
              <Text style={[styles.chevron, { color: palette.muted }]}>›</Text>
            </Pressable>
          ))}
        </MockupCard>
      </ScrollView>

      <Modal transparent visible={quickReplyDialogVisible} animationType="fade" onRequestClose={() => setQuickReplyDialogVisible(false)}>
        <View style={styles.dialogOverlay}>
          <View style={[styles.dialog, { backgroundColor: palette.card }]}>
            <Text style={[styles.dialogTitle, { color: palette.text }]}>Configure Quick Replies</Text>
            {replySlots.map((slot, index) => (
              <View key={`${slot}-${index}`} style={styles.slotEditBlock}>
                <Text style={[type.tinyMono, { color: palette.muted }]}>Reply Slot {index + 1}</Text>
                <TextInput value={slot} editable={false} style={[styles.dialogInput, { color: palette.text, borderColor: palette.rule, backgroundColor: palette.input }]} />
              </View>
            ))}
            <View style={styles.dialogActions}>
              <ActionPill label="Cancel" onPress={() => setQuickReplyDialogVisible(false)} />
              <ActionPill label="Save" dark onPress={() => setQuickReplyDialogVisible(false)} />
            </View>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={addCodeDialogVisible} animationType="fade" onRequestClose={() => setAddCodeDialogVisible(false)}>
        <View style={styles.dialogOverlay}>
          <View style={[styles.dialog, { backgroundColor: palette.card }]}>
            <Text style={[styles.dialogTitle, { color: palette.text }]}>Define New Signal Code</Text>
            <TextInput
              value={draftCode}
              onChangeText={(value) => setDraftCode(value.replace(/[^0-9]/g, ""))}
              keyboardType="number-pad"
              maxLength={8}
              placeholder="Numeric Beep Code (e.g. 7942)"
              placeholderTextColor={palette.muted2}
              style={[styles.dialogInput, { color: palette.text, borderColor: palette.rule, backgroundColor: palette.input }]}
            />
            <TextInput
              value={draftMeaning}
              onChangeText={setDraftMeaning}
              placeholder="Interpretation / Message Meaning"
              placeholderTextColor={palette.muted2}
              maxLength={50}
              style={[styles.dialogInput, styles.meaningInput, { color: palette.text, borderColor: palette.rule, backgroundColor: palette.input }]}
            />
            <View style={styles.dialogActions}>
              <ActionPill label="Cancel" onPress={() => setAddCodeDialogVisible(false)} />
              <ActionPill label="Register" dark onPress={registerCode} disabled={!draftCode || !draftMeaning} />
            </View>
          </View>
        </View>
      </Modal>
    </AppSurface>
  );
}

function ActionPill({
  label,
  dark = false,
  disabled = false,
  onPress,
}: {
  label: string;
  dark?: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  const palette = useAppPalette();
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionPill,
        dark && { backgroundColor: palette.primary },
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.actionPillText, { color: dark ? palette.primaryText : palette.text }]}>{label}</Text>
    </Pressable>
  );
}

function reportError(err: unknown) {
  const message = err instanceof Error ? err.message : "Unexpected error";
  Alert.alert("BEEP-GET", message);
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 96,
    gap: spacing[4],
  },
  appearanceCard: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[4],
    marginHorizontal: spacing[5],
    padding: spacing[4],
  },
  flexCopy: {
    flex: 1,
    gap: spacing[1],
  },
  rowTitle: {
    ...type.metaValue,
    fontSize: 12,
  },
  checkText: {
    ...type.metaValue,
    color: colors.greenDot,
    fontSize: 16,
  },
  widgetGrid: {
    flexDirection: "row",
    gap: spacing[3],
    paddingHorizontal: spacing[5],
  },
  widgetPressable: {
    flex: 1,
  },
  widgetCard: {
    minHeight: 116,
    padding: spacing[4],
    gap: spacing[3],
  },
  smallWidgetPreview: {
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.control,
  },
  previewCode: {
    ...type.codeSmall,
    fontSize: 20,
    lineHeight: 25,
  },
  listPreview: {
    minHeight: 46,
    justifyContent: "center",
    gap: spacing[2],
  },
  previewLineLong: {
    width: "72%",
    height: 8,
    borderRadius: 4,
  },
  previewLineShort: {
    width: "56%",
    height: 8,
    borderRadius: 4,
  },
  queuedText: {
    ...type.tinyMono,
  },
  sectionActionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing[3],
    paddingHorizontal: spacing[5],
  },
  blackPill: {
    minHeight: 24,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing[4],
    borderRadius: radius.pill,
    backgroundColor: colors.ink,
  },
  blackPillText: {
    ...type.tinyMono,
    color: "#FFFFFF",
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
  codeList: {
    marginHorizontal: spacing[5],
    paddingVertical: spacing[2],
  },
  codeRow: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[4],
    paddingHorizontal: spacing[4],
  },
  codeBadge: {
    minWidth: 38,
    minHeight: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.control,
  },
  codeBadgeText: {
    ...type.buttonMono,
    fontSize: 10,
  },
  codeMeaning: {
    flex: 1,
    ...type.body,
  },
  chevron: {
    ...type.codeSmall,
    fontSize: 20,
    lineHeight: 22,
  },
  dialogOverlay: {
    flex: 1,
    justifyContent: "center",
    padding: spacing[8],
    backgroundColor: "rgba(0,0,0,0.58)",
  },
  dialog: {
    gap: spacing[5],
    padding: spacing[6],
    borderRadius: 18,
  },
  dialogTitle: {
    ...type.screenTitle,
    fontSize: 20,
    lineHeight: 26,
  },
  slotEditBlock: {
    gap: spacing[2],
  },
  dialogInput: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: radius.control,
    paddingHorizontal: spacing[4],
    ...type.body,
  },
  meaningInput: {
    minHeight: 70,
    textAlignVertical: "top",
    paddingTop: spacing[4],
  },
  dialogActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing[3],
  },
  actionPill: {
    minHeight: 36,
    justifyContent: "center",
    paddingHorizontal: spacing[5],
    borderRadius: radius.pill,
  },
  actionPillText: {
    ...type.button,
  },
  disabled: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ translateY: 1 }],
  },
});
