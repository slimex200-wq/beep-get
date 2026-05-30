import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "@/design/tokens";
import { type } from "@/design/typography";
import { useAppPalette } from "@/design/appTheme";

export type RecentSignalCombo = {
  id: string;
  friendId: string;
  friendName: string;
  friendNo: string;
  slot: string;
  label: string;
};

type Props = {
  combos: RecentSignalCombo[];
  onSelect: (combo: RecentSignalCombo) => void;
};

export function RecentSignalCombos({ combos, onSelect }: Props) {
  const palette = useAppPalette();
  if (combos.length === 0) {
    return (
      <View style={[styles.empty, { backgroundColor: palette.cardSoft, borderColor: palette.rule }]}>
        <Text style={[type.bodyMuted, { color: palette.muted }]}>Send a few signals and your fastest combos appear here.</Text>
      </View>
    );
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {combos.map((combo) => (
        <Pressable
          key={combo.id}
          accessibilityRole="button"
          onPress={() => onSelect(combo)}
          style={({ pressed }) => [styles.combo, { backgroundColor: palette.input, borderColor: palette.ruleStrong }, pressed && styles.pressed]}
        >
          <Text style={[styles.comboText, { color: palette.text }]}>{combo.label}</Text>
          <Text style={[type.tinyMono, { color: palette.muted }]}>NO {combo.friendNo}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: spacing[3],
    paddingVertical: spacing[1],
  },
  combo: {
    minWidth: 124,
    minHeight: 48,
    justifyContent: "center",
    gap: spacing[1],
    paddingHorizontal: spacing[4],
    borderRadius: radius.control,
    borderWidth: 1,
    borderColor: colors.ruleStrong,
    backgroundColor: "rgba(255,255,255,0.22)",
  },
  comboText: {
    ...type.buttonMono,
    fontSize: 10,
    lineHeight: 13,
  },
  pressed: {
    transform: [{ translateY: 1 }],
    opacity: 0.86,
  },
  empty: {
    minHeight: 42,
    justifyContent: "center",
    paddingHorizontal: spacing[4],
    borderRadius: radius.control,
    borderWidth: 1,
    borderColor: colors.rule,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
});
