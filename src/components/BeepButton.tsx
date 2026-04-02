import React from "react";
import { Pressable, Text, StyleSheet, ViewStyle } from "react-native";
import { neumorphism as theme } from "@/theme/neumorphism";

interface BeepButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger";
  style?: ViewStyle;
  disabled?: boolean;
}

export function BeepButton({
  title,
  onPress,
  variant = "primary",
  style,
  disabled,
}: BeepButtonProps) {
  const variantColors = {
    primary: theme.colors.primary,
    secondary: theme.colors.secondary,
    danger: theme.colors.accent,
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        pressed ? styles.pressed : styles.raised,
        { opacity: disabled ? 0.5 : 1 },
        style,
      ]}
    >
      <Text style={[styles.text, { color: variantColors[variant] }]}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.sm,
    paddingVertical: theme.spacing.sm + 2,
    paddingHorizontal: theme.spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  raised: {
    ...theme.shadows.raised,
  },
  pressed: {
    ...theme.shadows.inset,
  },
  text: {
    fontFamily: theme.fonts.pixel,
    fontSize: 12,
    fontWeight: "600",
  },
});
