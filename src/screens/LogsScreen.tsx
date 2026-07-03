import React, { useEffect, useMemo } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { radius, spacing } from "@/design/tokens";
import { type } from "@/design/typography";
import { useAppPalette } from "@/design/appTheme";
import { Beacon, Card, ListRow, MonoValue, Screen, SectionLabel } from "@/ui/primitives";
import { BlinkMemoriesCard } from "@/components/BlinkMemoriesCard";
import { RefreshLineIcon } from "@/components/MockupLineIcons";
import type { Signal } from "@/data/mockSignals";
import type { RootStackParamList } from "@/navigation/RootNavigator";
import { useAuthStore } from "@/stores/authStore";
import { useMessageStore } from "@/stores/messageStore";
import { messageToSlipSignal } from "@/lib/slipUiModels";

export function LogsScreen() {
  const palette = useAppPalette();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { profile } = useAuthStore();
  const { saved, fetchSaved } = useMessageStore();

  useEffect(() => {
    if (!profile) return;
    fetchSaved(profile.id).catch(reportError);
  }, [profile?.id, fetchSaved]);

  const logs = useMemo(
    () => saved.map((message, index) => messageToSlipSignal(message, { index })),
    [saved]
  );

  const refresh = () => {
    if (!profile) return;
    fetchSaved(profile.id).catch(reportError);
  };

  const closeToMy = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate("Main", { screen: "My" });
  };

  return (
    <Screen
      title="Saved Slips"
      onBack={closeToMy}
      backAccessibilityLabel="Back to My"
      headerRight={
        <HeaderIconButton accessibilityLabel="Refresh saved slips" onPress={refresh}>
          <RefreshLineIcon color={palette.text} />
        </HeaderIconButton>
      }
    >
      <SectionLabel>PRIVATE SAVED SLIPS</SectionLabel>
      <Card>
        {logs.length > 0 ? (
          <>
            <View style={styles.listHead}>
              <Text style={[styles.listHeadText, { color: palette.muted }]}>
                {`${logs.length} saved`}
              </Text>
            </View>
            {logs.map((item, index) => (
              <SavedSlipRow
                key={item.id}
                item={item}
                isLast={index === logs.length - 1}
              />
            ))}
          </>
        ) : (
          <View style={styles.empty}>
            <Text style={[type.metaValue, { color: palette.text }]}>NO SAVED SLIPS</Text>
            <Text style={[type.bodyMuted, { color: palette.muted }]}>
              Use Save in Today or Reply Room.
            </Text>
          </View>
        )}
      </Card>

      <SectionLabel>BLINK MEMORIES</SectionLabel>
      <BlinkMemoriesCard messages={saved} />

      <SectionLabel>Saved Notes</SectionLabel>
      <Card style={styles.noteCard}>
        <Text style={[type.tinyMono, { color: palette.muted }]}>NOTE.</Text>
        <Text style={[type.bodyMuted, { color: palette.muted }]}>
          Saved slips remain in this private list.
        </Text>
      </Card>
    </Screen>
  );
}

function HeaderIconButton({
  accessibilityLabel,
  onPress,
  children,
}: {
  readonly accessibilityLabel: string;
  readonly onPress: () => void;
  readonly children: React.ReactNode;
}) {
  const palette = useAppPalette();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [
        styles.headerButton,
        { backgroundColor: palette.card, borderColor: palette.rule },
        pressed && styles.pressed,
      ]}
    >
      {children}
    </Pressable>
  );
}

function SavedSlipRow({ item, isLast }: { item: Signal; isLast: boolean }) {
  const isExpired = item.status === "expired";

  return (
    <View style={isExpired ? styles.expiredRow : null}>
      <ListRow
        left={<MonoValue dim={isExpired} style={styles.codeValue}>{item.code}</MonoValue>}
        title={item.sender}
        meta={item.note ?? "Saved signal"}
        right={
          <View style={styles.rowRight}>
            {isExpired ? null : <Beacon size={6} />}
            <MonoValue dim style={styles.timeValue}>{item.time}</MonoValue>
          </View>
        }
        isLast={isLast}
      />
    </View>
  );
}

function reportError(err: unknown) {
  const message = err instanceof Error ? err.message : "Unexpected error";
  Alert.alert("BEEP-GET", message);
}

const styles = StyleSheet.create({
  headerButton: {
    width: 42,
    height: 42,
    borderWidth: 1,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  listHead: {
    paddingHorizontal: spacing[8],
    paddingTop: spacing[5],
  },
  listHeadText: {
    ...type.tinyMono,
  },
  codeValue: {
    maxWidth: 98,
  },
  expiredRow: {
    opacity: 0.7,
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
  },
  timeValue: {
    fontSize: 11,
    maxWidth: 64,
    textAlign: "right",
  },
  noteCard: {
    padding: spacing[8],
    gap: spacing[3],
  },
  empty: {
    minHeight: 128,
    justifyContent: "center",
    gap: spacing[2],
    padding: spacing[5],
  },
  pressed: {
    opacity: 0.82,
    transform: [{ translateY: 1 }],
  },
});
