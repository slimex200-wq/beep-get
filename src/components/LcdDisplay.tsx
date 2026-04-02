import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";

interface LcdDisplayProps {
  fromName: string;
  code: string;
  time: string;
  isNew?: boolean;
}

export function LcdDisplay({ fromName, code, time, isNew }: LcdDisplayProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          borderRadius: theme.borderRadius.md,
          backgroundColor: theme.colors.surface,
          ...theme.shadows.inset,
        },
      ]}
    >
      <View
        style={[
          styles.lcd,
          {
            backgroundColor: theme.colors.lcdBackground,
            borderRadius: theme.borderRadius.sm,
          },
        ]}
      >
        <View style={styles.header}>
          <Text style={[styles.from, { fontFamily: theme.fonts.lcd, color: theme.colors.lcdSubtext }]}>
            FROM: {fromName}
          </Text>
          {isNew && (
            <Text style={[styles.newBadge, { fontFamily: theme.fonts.lcd, color: theme.colors.accent }]}>
              NEW
            </Text>
          )}
        </View>
        <Text style={[styles.code, { fontFamily: theme.fonts.lcd, color: theme.colors.lcdText }]}>
          {code}
        </Text>
        <Text style={[styles.time, { fontFamily: theme.fonts.lcd, color: theme.colors.lcdSubtext }]}>
          {time}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 3 },
  lcd: { padding: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  from: { fontSize: 14, opacity: 0.8 },
  newBadge: { fontSize: 12 },
  code: { fontSize: 40, textAlign: "center", letterSpacing: 4, paddingVertical: 8 },
  time: { fontSize: 12, textAlign: "right", opacity: 0.6 },
});
