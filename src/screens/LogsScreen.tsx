import React, { useEffect, useMemo } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { colors, radius, spacing } from "@/design/tokens";
import { type } from "@/design/typography";
import { useAppPalette } from "@/design/appTheme";
import { AppSurface } from "@/components/AppSurface";
import { BlinkMemoriesCard } from "@/components/BlinkMemoriesCard";
import { KotlinHeader, MockupCard, MockupSection } from "@/components/KotlinMockupUI";
import { RefreshLineIcon, XLineIcon } from "@/components/MockupLineIcons";
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
    <AppSurface backgroundColor={palette.background}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <KotlinHeader
          title="Saved Slips"
          centered
          showAvatar={false}
          actions={[
            {
              label: "Refresh",
              icon: <RefreshLineIcon />,
              accessibilityLabel: "Refresh saved slips",
              onPress: refresh,
            },
            {
              label: "Close",
              icon: <XLineIcon />,
              accessibilityLabel: "Close saved slips",
              onPress: closeToMy,
            },
          ]}
        />

        <MockupSection
          label="PRIVATE SAVED SLIPS"
          hint={`${logs.length} saved`}
          style={styles.sectionInset}
        />
        <MockupCard style={styles.savedCard}>
          {logs.length > 0 ? (
            logs.map((item, index) => (
              <SavedSlipRow
                key={item.id}
                item={item}
                isLast={index === logs.length - 1}
              />
            ))
          ) : (
            <View style={styles.empty}>
              <Text style={[type.metaValue, { color: palette.text }]}>NO SAVED SLIPS</Text>
              <Text style={[type.bodyMuted, { color: palette.muted }]}>
                Use Save in Today or Reply Room.
              </Text>
            </View>
          )}
        </MockupCard>

        <MockupSection label="BLINK MEMORIES" hint="Saved 3-cut" style={styles.sectionInset} />
        <View style={styles.sectionInset}>
          <BlinkMemoriesCard messages={saved} />
        </View>

        <MockupSection label="Saved Notes" hint="Private list" style={styles.sectionInset} />
        <MockupCard soft style={styles.noteCard}>
          <Text style={[type.tinyMono, { color: palette.muted }]}>NOTE.</Text>
          <Text style={[type.bodyMuted, { color: palette.muted }]}>
            Saved slips remain in this private list.
          </Text>
        </MockupCard>
      </ScrollView>
    </AppSurface>
  );
}

function SavedSlipRow({ item, isLast }: { item: Signal; isLast: boolean }) {
  const palette = useAppPalette();
  const isExpired = item.status === "expired";

  return (
    <View
      style={[
        styles.savedRow,
        !isLast && styles.savedRowDivider,
        { borderBottomColor: palette.rule },
        isExpired && styles.savedRowExpired,
      ]}
    >
      <View style={[styles.codeBadge, { backgroundColor: palette.input }]}>
        <Text numberOfLines={1} style={[styles.codeBadgeText, { color: palette.text }]}>
          {item.code}
        </Text>
      </View>
      <View style={styles.savedCopy}>
        <View style={styles.savedTitleRow}>
          <Text numberOfLines={1} style={[styles.savedSender, { color: palette.text }]}>
            {item.sender}
          </Text>
          <View
            style={[
              styles.savedStatusDot,
              { backgroundColor: isExpired ? palette.muted2 : colors.red },
            ]}
          />
        </View>
        <Text numberOfLines={1} style={[type.bodyMuted, { color: palette.muted }]}>
          {item.note ?? "Saved signal"}
        </Text>
      </View>
      <Text numberOfLines={1} style={[styles.savedTime, { color: palette.muted }]}>
        {item.time}
      </Text>
    </View>
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
  savedCard: {
    marginHorizontal: spacing[5],
    paddingVertical: spacing[2],
  },
  savedRow: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  savedRowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  savedRowExpired: {
    opacity: 0.7,
  },
  codeBadge: {
    minWidth: 58,
    maxWidth: 98,
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.control,
    paddingHorizontal: spacing[3],
  },
  codeBadgeText: {
    ...type.buttonMono,
    fontSize: 11,
  },
  savedCopy: {
    flex: 1,
    gap: spacing[1],
    minWidth: 0,
  },
  savedTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
  },
  savedSender: {
    ...type.metaValue,
    flexShrink: 1,
  },
  savedStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  savedTime: {
    ...type.tinyMono,
    maxWidth: 64,
    textAlign: "right",
  },
  noteCard: {
    marginHorizontal: spacing[5],
    padding: spacing[5],
    gap: spacing[3],
  },
  empty: {
    minHeight: 128,
    justifyContent: "center",
    gap: spacing[2],
    padding: spacing[5],
  },
});
