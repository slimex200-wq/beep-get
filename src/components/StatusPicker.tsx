import React from "react";
import { View, Text, Pressable, StyleSheet, FlatList } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { STATUS_PRESETS } from "@/services/statusService";

interface StatusPickerProps {
  currentIcon: string;
  onSelect: (icon: string, label: string) => void;
}

export function StatusPicker({ currentIcon, onSelect }: StatusPickerProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { fontFamily: theme.fonts.pixel, color: theme.colors.textSecondary }]}>
        STATUS
      </Text>
      <FlatList
        data={STATUS_PRESETS}
        horizontal
        keyExtractor={(item) => item.icon}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => onSelect(item.icon, item.label)}
            style={[
              styles.chip,
              {
                backgroundColor: currentIcon === item.icon
                  ? theme.colors.primary
                  : theme.colors.surface,
                borderRadius: theme.borderRadius.round,
              },
            ]}
          >
            <Text
              style={[
                styles.chipText,
                {
                  fontFamily: theme.fonts.lcd,
                  color: currentIcon === item.icon
                    ? "#FFFFFF"
                    : theme.colors.textPrimary,
                },
              ]}
            >
              {item.label}
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 8 },
  title: { fontSize: 10, letterSpacing: 1, marginBottom: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, marginRight: 8 },
  chipText: { fontSize: 13 },
});
