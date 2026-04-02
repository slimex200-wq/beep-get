import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { neumorphism as theme } from "@/theme/neumorphism";

interface LcdDisplayProps {
  fromName: string;
  code: string;
  time: string;
  isNew?: boolean;
}

export function LcdDisplay({ fromName, code, time, isNew }: LcdDisplayProps) {
  return (
    <View style={styles.container}>
      <View style={styles.lcd}>
        <View style={styles.header}>
          <Text style={styles.from}>FROM: {fromName}</Text>
          {isNew && <Text style={styles.newBadge}>NEW</Text>}
        </View>
        <Text style={styles.code}>{code}</Text>
        <Text style={styles.time}>{time}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.md,
    padding: 3,
    backgroundColor: theme.colors.surface,
    ...theme.shadows.inset,
  },
  lcd: {
    backgroundColor: theme.colors.lcdBackground,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.xs,
  },
  from: {
    fontFamily: theme.fonts.lcd,
    fontSize: 14,
    color: theme.colors.lcdSubtext,
    opacity: 0.8,
  },
  newBadge: {
    fontFamily: theme.fonts.lcd,
    fontSize: 12,
    color: theme.colors.accent,
  },
  code: {
    fontFamily: theme.fonts.lcd,
    fontSize: 40,
    color: theme.colors.lcdText,
    textAlign: "center",
    letterSpacing: 4,
    paddingVertical: theme.spacing.sm,
  },
  time: {
    fontFamily: theme.fonts.lcd,
    fontSize: 12,
    color: theme.colors.lcdSubtext,
    textAlign: "right",
    opacity: 0.6,
  },
});
