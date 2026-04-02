import React from "react";
import { Pressable, Text, StyleSheet, ViewStyle } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";

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
  const theme = useTheme();

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
        { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.sm },
        pressed ? theme.shadows.inset : theme.shadows.raised,
        { opacity: disabled ? 0.5 : 1 },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          { fontFamily: theme.fonts.pixel, color: variantColors[variant] },
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  text: { fontSize: 12, fontWeight: "600" },
});
