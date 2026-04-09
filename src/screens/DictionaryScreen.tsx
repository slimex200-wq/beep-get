import React, { useEffect, useState, useMemo } from "react";
import { View, Text, FlatList, StyleSheet, TextInput, Alert } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { BeepButton } from "@/components/BeepButton";
import { useAuthStore } from "@/stores/authStore";
import { useDictionaryStore } from "@/stores/dictionaryStore";

export function DictionaryScreen() {
  const theme = useTheme();
  const { profile } = useAuthStore();
  const { entries, loading, fetch, add, remove } = useDictionaryStore();
  const [code, setCode] = useState("");
  const [meaning, setMeaning] = useState("");

  useEffect(() => {
    if (profile) fetch(profile.id);
  }, [profile?.id]);

  const handleAdd = async () => {
    if (!profile || !code || !meaning) return;
    try {
      await add(profile.id, code, meaning);
      setCode("");
      setMeaning("");
    } catch (err: any) {
      Alert.alert("오류", err.message);
    }
  };

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: theme.spacing.md,
    },
    header: {
      fontFamily: theme.fonts.pixel,
      fontSize: 14,
      color: theme.colors.textSecondary,
      letterSpacing: 2,
      textAlign: "center",
      marginBottom: theme.spacing.md,
      marginTop: theme.spacing.xl,
    },
    form: {
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.lg,
    },
    codeInput: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.sm,
      padding: theme.spacing.sm,
      fontFamily: theme.fonts.lcd,
      fontSize: 20,
      color: theme.colors.lcdText,
      textAlign: "center",
      letterSpacing: 3,
    },
    meaningInput: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.sm,
      padding: theme.spacing.sm,
      fontFamily: theme.fonts.lcd,
      fontSize: 16,
      color: theme.colors.textPrimary,
      textAlign: "center",
    },
    entry: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      gap: theme.spacing.md,
    },
    entryCode: {
      fontFamily: theme.fonts.lcd,
      fontSize: 20,
      color: theme.colors.lcdText,
      minWidth: 80,
    },
    entryMeaning: {
      fontFamily: theme.fonts.lcd,
      fontSize: 16,
      color: theme.colors.textPrimary,
      flex: 1,
    },
  }), [theme]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>CODES</Text>
      <View style={styles.form}>
        <TextInput
          style={styles.codeInput}
          value={code}
          onChangeText={(t) => setCode(t.replace(/[^0-9]/g, ""))}
          placeholder="숫자 코드"
          placeholderTextColor={theme.colors.textSecondary}
          keyboardType="number-pad"
          maxLength={20}
        />
        <TextInput
          style={styles.meaningInput}
          value={meaning}
          onChangeText={setMeaning}
          placeholder="의미"
          placeholderTextColor={theme.colors.textSecondary}
          maxLength={50}
        />
        <BeepButton title="등록" onPress={handleAdd} />
      </View>
      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.entry}>
            <Text style={styles.entryCode}>{item.code}</Text>
            <Text style={styles.entryMeaning}>{item.meaning}</Text>
          </View>
        )}
      />
    </View>
  );
}
