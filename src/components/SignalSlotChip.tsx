import React from "react";
import { Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import { radius, spacing } from "@/design/tokens";
import { type } from "@/design/typography";
import { useAppPalette } from "@/design/appTheme";

type Props = {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  onPress: () => void;
  style?: ViewStyle;
};

export function SignalSlotChip({ label, selected = false, disabled = false, onPress, style }: Props) {
  const palette = useAppPalette();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: selected ? palette.primary : palette.chip,
          borderColor: selected ? palette.primary : palette.rule,
        },
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text numberOfLines={1} style={[styles.label, { color: selected ? palette.primaryText : palette.text }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 32,
    minWidth: 58,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing[5],
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  pressed: {
    transform: [{ translateY: 1 }],
    opacity: 0.86,
  },
  disabled: {
    opacity: 0.42,
  },
  label: {
    ...type.buttonMono,
    fontSize: 10,
    lineHeight: 13,
  },
});
