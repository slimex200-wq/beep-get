import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ChevronRightLineIcon } from "@/components/MockupLineIcons";
import { colors, spacing } from "@/design/tokens";
import { type } from "@/design/typography";
import { useAppPalette } from "@/design/appTheme";

type SettingsActionTone = "default" | "danger";

type Props = {
  readonly label: string;
  readonly detail?: string;
  readonly onPress?: () => void;
  readonly disabled?: boolean;
  readonly isLast?: boolean;
  readonly tone?: SettingsActionTone;
  readonly accessibilityLabel?: string;
};

export function SettingsActionRow({
  label,
  detail,
  onPress,
  disabled = false,
  isLast = false,
  tone = "default",
  accessibilityLabel,
}: Props) {
  const palette = useAppPalette();
  const isDanger = tone === "danger";
  const foreground = isDanger ? colors.red : palette.text;

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        !isLast && styles.divider,
        { borderBottomColor: palette.rule },
        isDanger && { backgroundColor: palette.mode === "dark" ? "rgba(216,54,30,0.10)" : "#FFF1EE" },
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <View style={styles.copy}>
        <Text numberOfLines={1} style={[styles.label, { color: foreground }]}>
          {label}
        </Text>
        {detail ? (
          <Text numberOfLines={1} style={[type.bodyMuted, { color: palette.muted }]}>
            {detail}
          </Text>
        ) : null}
      </View>
      <ChevronRightLineIcon color={isDanger ? colors.red : palette.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 66,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  copy: {
    flex: 1,
    gap: spacing[1],
    minWidth: 0,
  },
  label: {
    ...type.metaValue,
    fontSize: 12,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ translateY: 1 }],
  },
  disabled: {
    opacity: 0.44,
  },
});
