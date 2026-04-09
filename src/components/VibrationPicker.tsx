import React from "react";
import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { VIBRATION_PRESETS, playVibrationPattern } from "@/services/hapticService";

interface VibrationPickerProps {
  currentPattern: string | null;
  onSelect: (pattern: string) => void;
}

export function VibrationPicker({ currentPattern, onSelect }: VibrationPickerProps) {
  const theme = useTheme();

  const handlePress = async (pattern: string, name: string) => {
    try {
      await playVibrationPattern(pattern);
    } catch {
      // Haptics not available on this device
    }
    onSelect(pattern);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { fontFamily: theme.fonts.pixel, color: theme.colors.textSecondary }]}>
        VIBRATION
      </Text>
      <View style={styles.grid}>
        {VIBRATION_PRESETS.map((preset) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`진동 패턴: ${preset.name}`}
            key={preset.name}
            onPress={() => handlePress(preset.pattern, preset.name)}
            style={[
              styles.item,
              {
                backgroundColor: currentPattern === preset.pattern
                  ? theme.colors.primary
                  : theme.colors.surface,
                borderRadius: theme.borderRadius.sm,
              },
            ]}
          >
            <Text
              style={[
                styles.name,
                {
                  fontFamily: theme.fonts.lcd,
                  color: currentPattern === preset.pattern
                    ? "#FFFFFF"
                    : theme.colors.textPrimary,
                },
              ]}
            >
              {preset.name}
            </Text>
            <Text
              style={[
                styles.pattern,
                {
                  fontFamily: theme.fonts.mono,
                  color: currentPattern === preset.pattern
                    ? "rgba(255,255,255,0.7)"
                    : theme.colors.textSecondary,
                },
              ]}
            >
              {preset.pattern}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 8 },
  title: { fontSize: 10, letterSpacing: 1, marginBottom: 8 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  item: { padding: 10, minWidth: 80, alignItems: "center" },
  name: { fontSize: 13 },
  pattern: { fontSize: 9, marginTop: 2 },
});
