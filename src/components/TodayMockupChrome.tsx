import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "@/design/tokens";
import { font } from "@/design/typography";

type HeaderAction = {
  readonly label: string;
  readonly icon: React.ReactNode;
  readonly accessibilityLabel: string;
  readonly onPress: () => void;
};

type TodayMockupHeaderProps = {
  readonly title: string;
  readonly actions: readonly HeaderAction[];
};

type TodaySectionHeaderProps = {
  readonly label: string;
  readonly hint: string;
};

export function TodayMockupHeader({ title, actions }: TodayMockupHeaderProps) {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.headerActions}>
        {actions.map((action) => (
          <Pressable
            key={action.accessibilityLabel}
            accessibilityLabel={action.accessibilityLabel}
            accessibilityRole="button"
            onPress={action.onPress}
            style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
          >
            {action.icon}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export function TodaySectionHeader({ label, hint }: TodaySectionHeaderProps) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <Text numberOfLines={1} style={styles.sectionHint}>
        {hint}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing[4],
    paddingHorizontal: spacing[2],
    paddingTop: spacing[2],
  },
  title: {
    flex: 1,
    fontFamily: font.sansBold,
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: 0,
    color: colors.ink,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
  },
  iconButton: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
  },
  pressed: {
    opacity: 0.72,
    transform: [{ translateY: 1 }],
  },
  sectionHeader: {
    minHeight: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing[4],
  },
  sectionLabel: {
    fontFamily: font.monoBold,
    fontSize: 8,
    lineHeight: 11,
    letterSpacing: 0,
    color: colors.muted,
    textTransform: "uppercase",
    flexShrink: 0,
  },
  sectionHint: {
    fontFamily: font.sansMedium,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0,
    color: colors.muted,
    maxWidth: "58%",
    textAlign: "right",
  },
});
