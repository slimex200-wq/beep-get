import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "../design/tokens";
import { useAppPalette } from "../design/appTheme";

type Props = {
  label: string;
  hint: string;
};

export function SectionHeader({ label, hint }: Props) {
  const palette = useAppPalette();
  return (
    <View style={styles.row}>
      <Text style={[styles.label, { color: palette.text }]}>{label}</Text>
      <View style={[styles.line, { backgroundColor: palette.rule }]} />
      <Text style={[styles.hint, { color: palette.muted }]}>{hint}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
  },
  label: {
    fontFamily: "IBMPlexMono-Bold",
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    color: colors.ink,
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.rule,
  },
  hint: {
    fontFamily: "IBMPlexMono",
    fontSize: 10,
    letterSpacing: 0.7,
    textTransform: "uppercase",
    color: colors.muted,
  },
});
