import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { colors, radius } from "@/design/tokens";
import { font } from "@/design/typography";
import { useAppPalette } from "@/design/appTheme";

type Props = {
  readonly label: string;
  readonly icon?: React.ReactNode;
  readonly accessibilityLabel?: string;
  readonly onPress?: () => void;
  readonly dark?: boolean;
  readonly size?: number;
};

export function IconButton({
  label,
  icon,
  accessibilityLabel,
  onPress,
  dark = false,
  size = 34,
}: Props) {
  const palette = useAppPalette();
  const foregroundColor = dark ? palette.primaryText : palette.text;

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole={onPress ? "button" : undefined}
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.button,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: dark ? palette.primary : palette.chip,
          borderColor: dark ? palette.ruleStrong : palette.rule,
        },
        pressed && styles.pressed,
      ]}
    >
      {renderIconContent(icon, label, foregroundColor)}
    </Pressable>
  );
}

function renderIconContent(
  icon: React.ReactNode,
  label: string,
  color: string,
): React.ReactNode {
  if (React.isValidElement<{ color?: string }>(icon)) {
    return React.cloneElement(icon, { color });
  }

  return <Text style={[styles.iconText, { color }]}>{label}</Text>;
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  iconText: {
    fontFamily: font.sansBold,
    fontSize: 17,
    lineHeight: 20,
    color: colors.ink,
  },
  pressed: {
    opacity: 0.72,
    transform: [{ translateY: 1 }],
  },
});
