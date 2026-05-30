import React from "react";
import { Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import { radius, spacing } from "@/design/tokens";
import { type } from "@/design/typography";
import { useAppPalette } from "@/design/appTheme";

type Props = {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  confirmed?: boolean;
  onPress: () => void;
  compact?: boolean;
  style?: ViewStyle;
};

export function SignalSlotChip({ label, selected = false, disabled = false, confirmed = false, onPress, compact = false, style }: Props) {
  const palette = useAppPalette();
  const active = selected || confirmed;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        compact && styles.compactBase,
        {
          backgroundColor: active ? palette.primary : palette.chip,
          borderColor: active ? palette.primary : palette.rule,
        },
        confirmed && styles.confirmed,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      {compact ? (
        <View style={styles.compactContent}>
          <View
            style={[
              styles.compactDot,
              { backgroundColor: active ? palette.primaryText : palette.text },
            ]}
          />
          <Text
            numberOfLines={1}
            style={[
              styles.label,
              styles.compactLabel,
              { color: active ? palette.primaryText : palette.text },
            ]}
          >
            {confirmed ? "Done" : label}
          </Text>
        </View>
      ) : (
        <Text
          numberOfLines={1}
          style={[styles.label, { color: active ? palette.primaryText : palette.text }]}
        >
          {confirmed ? "Done" : label}
        </Text>
      )}
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
    borderRadius: 10,
    borderWidth: 1,
  },
  compactBase: {
    height: 31,
    minWidth: 64,
    paddingHorizontal: spacing[6],
    borderRadius: 10,
  },
  compactContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing[3],
  },
  compactDot: {
    width: 3.5,
    height: 3.5,
    borderRadius: 2,
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
  compactLabel: {
    fontSize: 9,
    lineHeight: 11,
  },
  confirmed: {
    transform: [{ translateY: -1 }],
  },
});
