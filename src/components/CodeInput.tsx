import React from "react";
import { TextInput, StyleSheet, View, Text } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
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
  const theme = useTheme();

  const handleChange = (text: string) => {
    const numericOnly = text.replace(/[^0-9]/g, "");
    onChangeText(numericOnly);
  };

  return (
    <View>
      {label && (
        <Text style={[styles.label, { fontFamily: theme.fonts.pixel, color: theme.colors.textSecondary }]}>
          {label}
        </Text>
      )}
      <View
        style={[
          styles.container,
          { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.sm, ...theme.shadows.inset },
        ]}
      >
        <TextInput
          style={[styles.input, { fontFamily: theme.fonts.lcd, color: theme.colors.lcdText }]}
          value={value}
          onChangeText={handleChange}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textSecondary}
          keyboardType="number-pad"
          maxLength={maxLength}
        />
      </View>
      <Text style={[styles.counter, { fontFamily: theme.fonts.mono, color: theme.colors.textSecondary }]}>
        {value.length}/{maxLength}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  label: { fontSize: 11, marginBottom: 4, letterSpacing: 1 },
  input: { fontSize: 28, textAlign: "center", padding: 16, letterSpacing: 4 },
  counter: { fontSize: 10, textAlign: "right", marginTop: 4 },
});
