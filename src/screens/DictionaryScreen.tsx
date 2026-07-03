import React, { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Card, ListRow, MonoValue, PillButton, PrimaryButton, Screen, SectionLabel } from "@/ui/primitives";

import { radius, spacing } from "@/design/tokens";
import { type } from "@/design/typography";
import { useAppPalette } from "@/design/appTheme";
import type { RootStackParamList } from "@/navigation/RootNavigator";
import { useAuthStore } from "@/stores/authStore";
import { useDictionaryStore } from "@/stores/dictionaryStore";
import { isQuickReplySlotEntry } from "@/lib/quickReplySlots";
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
    } catch (err: unknown) {
      if (err instanceof Error) {
        Alert.alert("Code failed", err.message);
        return;
      }
      throw err;
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await remove(id);
    } catch (err: unknown) {
      if (err instanceof Error) {
        Alert.alert("Delete failed", err.message);
        return;
      }
      throw err;
    }
  };

  const close = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate("Main", { screen: "My" });
  };
  const visibleEntries = useMemo(
    () => entries.filter((entry) => !isQuickReplySlotEntry(entry)),
    [entries],
  );
  const canRegister = Boolean(code.trim() && meaning.trim());
  const registerRequirementCopy = canRegister
    ? "Ready to register."
    : "Enter both a signal code and private meaning to register.";

  return (
    <Screen
      title="Signal Codes"
      onBack={close}
      backAccessibilityLabel="Back to My"
    >
      <SectionLabel>Signal Code Dictionary</SectionLabel>
      <Card style={styles.formCard}>
        <Text style={[styles.formHeading, { color: palette.muted }]}>Add Signal Code</Text>
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: palette.muted }]}>SIGNAL CODE</Text>
          <TextInput
            style={[styles.codeInput, { color: palette.text, borderColor: palette.rule, backgroundColor: palette.input }]}
            value={code}
            onChangeText={setCode}
            placeholder="8282 / OK"
            placeholderTextColor={palette.muted2}
            autoCapitalize="none"
            maxLength={MAX_CODE_LENGTH}
          />
        </View>
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: palette.muted }]}>PRIVATE MEANING</Text>
          <TextInput
            style={[styles.meaningInput, { color: palette.text, borderColor: palette.rule, backgroundColor: palette.input }]}
            value={meaning}
            onChangeText={setMeaning}
            placeholder="Meaning, e.g. Focus mode"
            placeholderTextColor={palette.muted2}
            maxLength={50}
          />
        </View>
        <Text style={[styles.requirementText, { color: canRegister ? palette.muted : palette.muted2 }]}>
          {registerRequirementCopy}
        </Text>
        <PrimaryButton
          label={loading ? "Saving" : "Register Signal Code"}
          onPress={() => void handleAdd()}
          busy={loading}
          disabled={!canRegister || loading}
        />
      </Card>

      <SectionLabel>My Signal Codes</SectionLabel>
      <Card>
        {visibleEntries.length ? (
          <>
            <View style={styles.listHead}>
              <Text style={[styles.listHeadText, { color: palette.muted }]}>
                {`${visibleEntries.length} saved`}
              </Text>
            </View>
            {visibleEntries.map((item, index) => (
              <ListRow
                key={item.id}
                left={<MonoValue style={styles.codeValue}>{item.code}</MonoValue>}
                title={item.meaning}
                right={
                  <PillButton
                    label="Delete"
                    accessibilityLabel={`Delete ${item.code}`}
                    onPress={() => void handleRemove(item.id)}
                  />
                }
                isLast={index === visibleEntries.length - 1}
              />
            ))}
          </>
        ) : (
          <View style={styles.emptyState}>
            <Text style={[type.bodyMuted, { color: palette.muted }]}>
              Save a few codes so Beep can stay fast.
            </Text>
          </View>
        )}
      </Card>
    </Screen>
  );
}

function reportError(err: unknown) {
  const message = err instanceof Error ? err.message : "Unexpected error";
  Alert.alert("BEEP-GET", message);
}

const styles = StyleSheet.create({
  formCard: {
    gap: spacing[3],
    padding: spacing[8],
  },
  formHeading: {
    ...type.tinyMono,
  },
  fieldGroup: {
    gap: spacing[2],
  },
  fieldLabel: {
    ...type.tinyMono,
  },
  requirementText: {
    ...type.bodyMuted,
    marginTop: -spacing[1],
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
  listHead: {
    paddingHorizontal: spacing[8],
    paddingTop: spacing[5],
  },
  listHeadText: {
    ...type.tinyMono,
  },
  codeValue: {
    maxWidth: 116,
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
