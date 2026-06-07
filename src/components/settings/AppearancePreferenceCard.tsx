import React from "react";
import { Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { MockupCard } from "@/components/KotlinMockupUI";
import { colors, radius, spacing } from "@/design/tokens";
import { font } from "@/design/typography";
import { useAppPalette } from "@/design/appTheme";
import type { ThemePreference } from "@/stores/themeStore";

const APPEARANCE_OPTIONS: ReadonlyArray<{ readonly value: ThemePreference; readonly label: string }> = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
] as const;

type Props = {
  readonly value: ThemePreference;
  readonly onChange: (preference: ThemePreference) => void;
  readonly style?: ViewStyle;
};

export function AppearancePreferenceCard({ value, onChange, style }: Props) {
  const palette = useAppPalette();

  return (
    <MockupCard style={StyleSheet.flatten([styles.card, style])}>
      <View
        accessibilityRole="radiogroup"
        style={[styles.segmented, { backgroundColor: palette.input, borderColor: palette.rule }]}
      >
        {APPEARANCE_OPTIONS.map((option) => {
          const selected = value === option.value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={`${option.label} theme`}
              onPress={() => onChange(option.value)}
              style={[
                styles.option,
                selected && { backgroundColor: palette.card, borderColor: palette.ruleStrong },
              ]}
            >
              <Text style={[styles.optionText, { color: selected ? palette.text : palette.muted }]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </MockupCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing[3],
  },
  segmented: {
    minHeight: 48,
    flexDirection: "row",
    gap: spacing[2],
    padding: spacing[2],
    borderWidth: 1,
    borderRadius: radius.control,
  },
  option: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: colors.transparent,
  },
  optionText: {
    fontFamily: font.sansSemiBold,
    fontSize: 12,
    letterSpacing: 0,
  },
});
