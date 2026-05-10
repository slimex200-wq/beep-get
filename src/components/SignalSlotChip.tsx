import React from "react";
import { Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import { colors, radius, spacing } from "@/design/tokens";
import { type } from "@/design/typography";

type Props = {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  onPress: () => void;
  style?: ViewStyle;
};

export function SignalSlotChip({ label, selected = false, disabled = false, onPress, style }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        selected && styles.selected,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text numberOfLines={1} style={[styles.label, selected && styles.selectedLabel]}>
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
    borderColor: colors.ruleStrong,
    backgroundColor: "rgba(255,255,255,0.24)",
  },
  selected: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
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
  selectedLabel: {
    color: colors.paperWarm,
  },
});
