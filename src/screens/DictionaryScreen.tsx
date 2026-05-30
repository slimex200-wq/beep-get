import React, { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppSurface } from "@/components/AppSurface";
import { ActionButton } from "@/components/ActionButton";
import { KotlinHeader, MockupCard, MockupSection } from "@/components/KotlinMockupUI";
import { colors, radius, spacing } from "@/design/tokens";
import { type } from "@/design/typography";
import { useAppPalette } from "@/design/appTheme";
import type { RootStackParamList } from "@/navigation/RootNavigator";
import { useAuthStore } from "@/stores/authStore";
import { useDictionaryStore } from "@/stores/dictionaryStore";
import { MAX_CODE_LENGTH } from "@/lib/constants";

export function DictionaryScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { profile } = useAuthStore();
  const { entries, loading, fetch, add, remove } = useDictionaryStore();
  const palette = useAppPalette();
  const [code, setCode] = useState("");
  const [meaning, setMeaning] = useState("");

  useEffect(() => {
    if (profile) fetch(profile.id).catch(reportError);
  }, [fetch, profile?.id]);

  const handleAdd = async () => {
    const trimmedCode = code.trim();
    const trimmedMeaning = meaning.trim();
    if (!profile || !trimmedCode || !trimmedMeaning) return;

    try {
      await add(profile.id, trimmedCode, trimmedMeaning);
      setCode("");
      setMeaning("");
    } catch (err: any) {
      Alert.alert("Code failed", err?.message ?? "Try again.");
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await remove(id);
    } catch (err: any) {
      Alert.alert("Delete failed", err?.message ?? "Try again.");
    }
  };

  const close = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate("Main", { screen: "My" });
  };

  return (
    <AppSurface backgroundColor="#F8F6F1">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <KotlinHeader
          title="Signal Tokens"
          centered
          showAvatar={false}
          actions={[{ label: "Close", onPress: close }]}
        />

        <MockupSection label="Add Signal Token" hint="Numbers, short words, and emoji work here" />
        <MockupCard style={styles.formCard}>
          <TextInput
            style={[styles.codeInput, { color: palette.text, borderColor: palette.rule, backgroundColor: palette.input }]}
            value={code}
            onChangeText={setCode}
            placeholder="집중중 🔕"
            placeholderTextColor={palette.muted2}
            autoCapitalize="none"
            maxLength={MAX_CODE_LENGTH}
          />
          <TextInput
            style={[styles.meaningInput, { color: palette.text, borderColor: palette.rule, backgroundColor: palette.input }]}
            value={meaning}
            onChangeText={setMeaning}
            placeholder="Meaning, e.g. Focus mode"
            placeholderTextColor={palette.muted2}
            maxLength={50}
          />
          <ActionButton
            label={loading ? "Saving" : "Register Signal"}
            variant="dark"
            onPress={handleAdd}
            disabled={!code.trim() || !meaning.trim() || loading}
          />
        </MockupCard>

        <MockupSection label="My Signal Dictionary" hint={`${entries.length} saved`} />
        <MockupCard style={styles.codeList}>
          {entries.length ? (
            entries.map((item) => (
              <View key={item.id} style={[styles.codeRow, { borderBottomColor: palette.rule }]}>
                <View style={[styles.codeBadge, { backgroundColor: palette.input }]}>
                  <Text numberOfLines={1} style={[styles.codeBadgeText, { color: palette.text }]}>{item.code}</Text>
                </View>
                <Text numberOfLines={1} style={[styles.codeMeaning, { color: palette.text }]}>{item.meaning}</Text>
                <Pressable
                  accessibilityLabel={`Delete ${item.code}`}
                  accessibilityRole="button"
                  onPress={() => handleRemove(item.id)}
                  style={({ pressed }) => [styles.deletePill, pressed && styles.pressed]}
                >
                  <Text style={styles.deletePillText}>Delete</Text>
                </Pressable>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={[type.bodyMuted, { color: palette.muted }]}>
                Save a few codes so Beep can stay fast.
              </Text>
            </View>
          )}
        </MockupCard>
      </ScrollView>
    </AppSurface>
  );
}

function reportError(err: unknown) {
  const message = err instanceof Error ? err.message : "Unexpected error";
  Alert.alert("BEEP-GET", message);
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 96,
    gap: spacing[4],
  },
  formCard: {
    gap: spacing[3],
    marginHorizontal: spacing[5],
    padding: spacing[4],
  },
  codeInput: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: radius.control,
    paddingHorizontal: spacing[4],
    textAlign: "center",
    ...type.codeSmall,
    fontSize: 24,
    lineHeight: 30,
  },
  meaningInput: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: radius.control,
    paddingHorizontal: spacing[4],
    ...type.body,
  },
  codeList: {
    marginHorizontal: spacing[5],
    paddingVertical: spacing[2],
  },
  codeRow: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
    paddingHorizontal: spacing[4],
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  codeBadge: {
    minWidth: 44,
    maxWidth: 116,
    minHeight: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.control,
    paddingHorizontal: spacing[3],
  },
  codeBadgeText: {
    ...type.buttonMono,
    fontSize: 10,
  },
  codeMeaning: {
    flex: 1,
    ...type.body,
  },
  deletePill: {
    minHeight: 30,
    justifyContent: "center",
    paddingHorizontal: spacing[3],
    borderRadius: 10,
    backgroundColor: colors.ink,
  },
  deletePillText: {
    ...type.tinyMono,
    color: "#FFFFFF",
  },
  emptyState: {
    minHeight: 92,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing[5],
  },
  pressed: {
    opacity: 0.82,
    transform: [{ translateY: 1 }],
  },
});
