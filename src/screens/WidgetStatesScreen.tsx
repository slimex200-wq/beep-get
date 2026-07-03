import React, { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation, useRoute, type NavigatorScreenParams, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppSurface } from "@/components/AppSurface";
import { ActionButton } from "@/components/ActionButton";
import {
  KotlinHeader,
  MockupCard,
  MockupSection,
  StatusPill,
} from "@/components/KotlinMockupUI";
import { XLineIcon } from "@/components/MockupLineIcons";
import { radius, spacing } from "@/design/tokens";
import { type } from "@/design/typography";
import { useAppPalette } from "@/design/appTheme";
import {
  identityPacks,
  getIdentityPack,
  type IdentityPack,
} from "@/design/identityPacks";
import { WidgetSkinPackCard } from "@/components/WidgetSkinPackCard";
import { ActualWidgetPreview } from "@/components/ActualWidgetPreview";
import { freePackSlugs, loadOwnedIdentityPacks } from "@/lib/identityPackOwnership";
import type { MainTabParamList } from "@/navigation/RootNavigator";
import { useAuthStore } from "@/stores/authStore";
import { useDictionaryStore } from "@/stores/dictionaryStore";
import { useSkinStore } from "@/stores/skinStore";
import {
  DEFAULT_QUICK_REPLY_SLOTS,
  buildQuickReplySlots,
} from "@/lib/quickReplySlots";
import { isIdentityPackStoreEnabled } from "@/lib/releaseFlags";

type PreviewState = "empty" | "incoming-beep" | "incoming-blink";
type WidgetSize = "small" | "medium";
type WidgetStatesRouteParamList = {
  WidgetStates: { size?: WidgetSize } | undefined;
};
type WidgetStatesNavigationParamList = {
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
};

const PREVIEW_STATES_BY_SIZE: Record<WidgetSize, readonly PreviewState[]> = {
  small: ["empty", "incoming-beep"],
  medium: ["empty", "incoming-blink"],
};

function coercePreviewStateForSize(size: WidgetSize, state: PreviewState): PreviewState {
  if (state === "empty") return state;
  return size === "small" ? "incoming-beep" : "incoming-blink";
}

function previewStateLabel(state: PreviewState) {
  if (state === "empty") return "Empty";
  return state === "incoming-beep" ? "Beep" : "Blink";
}

export function WidgetStatesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<WidgetStatesNavigationParamList>>();
  const route = useRoute<RouteProp<WidgetStatesRouteParamList, "WidgetStates">>();
  const { profile } = useAuthStore();
  const { entries } = useDictionaryStore();
  const {
    activeIdentityPackSlug,
    fetchActiveIdentityPack,
    fetchAll: fetchSkins,
    applyIdentityPack,
    setLocalActiveIdentityPack,
  } = useSkinStore();
  const palette = useAppPalette();
  const [size, setSize] = useState<WidgetSize>(route.params?.size ?? "medium");
  const [previewState, setPreviewState] = useState<PreviewState>(
    () => (route.params?.size === "small" ? "incoming-beep" : "incoming-blink"),
  );
  const [previewPackSlug, setPreviewPackSlug] = useState(() => activeIdentityPackSlug);
  const [ownedPackSlugs, setOwnedPackSlugs] = useState<ReadonlySet<string>>(
    () => new Set(freePackSlugs()),
  );

  React.useEffect(() => {
    fetchSkins().catch(reportError);
  }, [fetchSkins]);

  React.useEffect(() => {
    if (!profile) return;
    fetchActiveIdentityPack(profile.id).catch(reportError);
    loadOwnedIdentityPacks(profile.id).then(setOwnedPackSlugs).catch(reportError);
  }, [fetchActiveIdentityPack, profile?.id]);

  React.useEffect(() => {
    setPreviewState((current) => coercePreviewStateForSize(size, current));
  }, [size]);

  React.useEffect(() => {
    setPreviewPackSlug(activeIdentityPackSlug);
  }, [activeIdentityPackSlug]);

  const replySlots = useMemo(() => {
    return buildQuickReplySlots(entries, DEFAULT_QUICK_REPLY_SLOTS);
  }, [entries]);
  const previewPack = useMemo(() => getIdentityPack(previewPackSlug), [previewPackSlug]);
  const previewStates = PREVIEW_STATES_BY_SIZE[size];
  const lockedSkinLabel = isIdentityPackStoreEnabled ? undefined : "PREVIEW";
  const widgetPreviewFrom = profile?.nickname?.trim() || profile?.beep_id?.trim() || "You";

  const handleSizeChange = (nextSize: WidgetSize) => {
    setSize(nextSize);
    setPreviewState((current) => coercePreviewStateForSize(nextSize, current));
  };

  const close = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate("Main", { screen: "My" });
  };

  const chooseSkinPack = async (pack: IdentityPack) => {
    const isOwned = ownedPackSlugs.has(pack.slug);

    setPreviewPackSlug(pack.slug);

    try {
      if (!isOwned) {
        Alert.alert(
          "Skin Pack Preview",
          `${pack.name} can preview here. Unlocking applies its widget skin, avatar frame, and emotes together.`,
        );
        return;
      }

      if (!profile) {
        setLocalActiveIdentityPack(pack.slug);
        return;
      }
      await applyIdentityPack(profile.id, pack.slug);
    } catch (err: any) {
      Alert.alert("Skin pack failed", err?.message ?? "Try again.");
    }
  };

  return (
    <AppSurface backgroundColor="#F8F6F1">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <KotlinHeader
          title="Widget Layouts"
          centered
          showAvatar={false}
          actions={[{ label: "Close", icon: <XLineIcon />, accessibilityLabel: "Close widget layouts", onPress: close }]}
        />

        <MockupSection label="Preview Size" hint={profile?.beep_id ?? "NO ID"} />
        <View style={styles.segmentRow}>
          <ActionButton
            label="SM Widget"
            mono
            flex
            variant={size === "small" ? "dark" : "light"}
            onPress={() => handleSizeChange("small")}
          />
          <ActionButton
            label="MD List Widget"
            mono
            flex
            variant={size === "medium" ? "dark" : "light"}
            onPress={() => handleSizeChange("medium")}
          />
        </View>

        <MockupCard style={styles.previewCard}>
          <View style={styles.previewTop}>
            <Text style={[type.tinyMono, { color: palette.muted }]}>LIVE PREVIEW</Text>
            <StatusPill label={size === "medium" ? "3 queued slots" : "active preview"} tone="green" />
          </View>
          <View style={styles.previewStage}>
            <ActualWidgetPreview
              size={size}
              kind={size === "small" ? "beep" : "blink"}
              variant={previewState === "empty" ? "empty" : "filled"}
              code={previewPack.code}
              from={widgetPreviewFrom}
              skin={previewPack}
              time={previewPack.time}
              indexNo={previewPack.index}
              compact={size === "small"}
            />
          </View>
        </MockupCard>

        <MockupSection label="Widget State" />
        <View style={styles.segmentRow}>
          {previewStates.map((state) => (
            <Pressable
              key={state}
              accessibilityRole="button"
              onPress={() => setPreviewState(state)}
              style={({ pressed }) => [
                styles.stateChip,
                {
                  backgroundColor: previewState === state ? palette.primary : palette.chip,
                  borderColor: previewState === state ? palette.primary : palette.rule,
                },
                pressed && styles.pressed,
              ]}
            >
              <Text
                style={[
                  styles.stateChipText,
                  { color: previewState === state ? palette.primaryText : palette.text },
                ]}
              >
                {previewStateLabel(state)}
              </Text>
            </Pressable>
          ))}
        </View>

        <MockupSection label="Quick Replies" />
        <MockupCard style={styles.replyCard}>
          {replySlots.map((slot) => (
            <View key={slot} style={[styles.replySlot, { borderColor: palette.rule, backgroundColor: palette.card }]}>
              <Text style={[styles.replyText, { color: palette.text }]}>{slot}</Text>
            </View>
          ))}
        </MockupCard>

        <MockupSection label="Skin Packs" hint={`${size === "small" ? "SM" : "MD"} widget preview`} />
        <View style={styles.skinPackGrid}>
          {identityPacks.map((skin) => (
            <WidgetSkinPackCard
              key={skin.slug}
              skin={skin}
              size={size}
              active={skin.slug === previewPack.slug}
              owned={ownedPackSlugs.has(skin.slug)}
              lockedLabel={lockedSkinLabel}
              previewFrom={widgetPreviewFrom}
              onPress={() => chooseSkinPack(skin)}
            />
          ))}
        </View>
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
  segmentRow: {
    flexDirection: "row",
    gap: spacing[3],
    paddingHorizontal: spacing[5],
  },
  previewCard: {
    gap: spacing[4],
    marginHorizontal: spacing[5],
    padding: spacing[4],
  },
  previewTop: {
    minHeight: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing[3],
  },
  stateChip: {
    flex: 1,
    minHeight: 38,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: radius.pill,
  },
  stateChipText: {
    ...type.button,
    fontSize: 11,
  },
  replyCard: {
    minHeight: 64,
    flexDirection: "row",
    gap: spacing[3],
    marginHorizontal: spacing[5],
    padding: spacing[4],
  },
  replySlot: {
    flex: 1,
    minHeight: 38,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: radius.control,
  },
  replyText: {
    ...type.button,
  },
  skinPackGrid: {
    gap: spacing[3],
    paddingHorizontal: spacing[5],
  },
  previewStage: {
    alignItems: "center",
    paddingVertical: spacing[1],
  },
  pressed: {
    opacity: 0.82,
    transform: [{ translateY: 1 }],
  },
});
