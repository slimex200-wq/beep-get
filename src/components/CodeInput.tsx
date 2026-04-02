import React from "react";
import { TextInput, StyleSheet, View, Text } from "react-native";
import { neumorphism as theme } from "@/theme/neumorphism";
import { MAX_CODE_LENGTH } from "@/lib/constants";

interface CodeInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  maxLength?: number;
  label?: string;
}

export function CodeInput({
  value,
  onChangeText,
  placeholder = "숫자 코드 입력",
  maxLength = MAX_CODE_LENGTH,
  label,
}: CodeInputProps) {
  const handleChange = (text: string) => {
    const numericOnly = text.replace(/[^0-9]/g, "");
    onChangeText(numericOnly);
  };

  return (
    <View>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={handleChange}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textSecondary}
          keyboardType="number-pad"
          maxLength={maxLength}
        />
      </View>
      <Text style={styles.counter}>
        {value.length}/{maxLength}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.sm,
    ...theme.shadows.inset,
  },
  label: {
    fontFamily: theme.fonts.pixel,
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
    letterSpacing: 1,
  },
  input: {
    fontFamily: theme.fonts.lcd,
    fontSize: 28,
    color: theme.colors.lcdText,
    textAlign: "center",
    padding: theme.spacing.md,
    letterSpacing: 4,
  },
  counter: {
    fontFamily: theme.fonts.mono,
    fontSize: 10,
    color: theme.colors.textSecondary,
    textAlign: "right",
    marginTop: theme.spacing.xs,
  },
});
