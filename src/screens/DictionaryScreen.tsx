import React, { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppSurface } from "@/components/AppSurface";
import { ActionButton } from "@/components/ActionButton";
import { KotlinHeader, MockupCard, MockupSection } from "@/components/KotlinMockupUI";
import { XLineIcon } from "@/components/MockupLineIcons";
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
    <AppSurface backgroundColor="#F8F6F1">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <KotlinHeader
          title="Signal Codes"
          centered
          showAvatar={false}
          actions={[{ label: "Close", icon: <XLineIcon />, accessibilityLabel: "Close dictionary", onPress: close }]}
        />

        <MockupSection label="Signal Code Dictionary" hint="Private meanings" style={styles.sectionInset} />
        <MockupCard style={styles.formCard}>
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
          <ActionButton
            label={loading ? "Saving" : "Register Signal Code"}
            variant="dark"
            onPress={handleAdd}
            accessibilityHint={registerRequirementCopy}
            disabled={!canRegister || loading}
          />
        </MockupCard>

        <MockupSection label="My Signal Codes" hint={`${visibleEntries.length} saved`} style={styles.sectionInset} />
        <MockupCard style={styles.codeList}>
          {visibleEntries.length ? (
            visibleEntries.map((item) => (
              <View key={item.id} style={[styles.codeRow, { borderBottomColor: palette.rule }]}>
                <View style={[styles.codeBadge, { backgroundColor: palette.input }]}>
                  <Text numberOfLines={1} style={[styles.codeBadgeText, { color: palette.text }]}>{item.code}</Text>
                </View>
                <Text numberOfLines={1} style={[styles.codeMeaning, { color: palette.text }]}>{item.meaning}</Text>
                <Pressable
                  accessibilityLabel={`Delete ${item.code}`}
                  accessibilityRole="button"
                  onPress={() => handleRemove(item.id)}
                  style={({ pressed }) => [
                    styles.deletePill,
                    { backgroundColor: palette.chip, borderColor: palette.rule },
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={[styles.deletePillText, { color: palette.muted }]}>Delete</Text>
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
  sectionInset: {
    marginHorizontal: spacing[5],
  },
  formCard: {
    gap: spacing[3],
    marginHorizontal: spacing[5],
    padding: spacing[4],
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
    borderWidth: 1,
    borderRadius: 10,
  },
  deletePillText: {
    ...type.tinyMono,
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
