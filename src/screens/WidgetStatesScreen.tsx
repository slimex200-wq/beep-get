import React, { useMemo, useState } from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
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
import { colors, radius, spacing } from "@/design/tokens";
import { type } from "@/design/typography";
import { useAppPalette } from "@/design/appTheme";
import {
  identityPacks,
  getIdentityPack,
  type IdentityPack,
} from "@/design/identityPacks";
import {
  WidgetSkinPackCard,
  getPackVisual,
} from "@/components/WidgetSkinPackCard";
import { freePackSlugs, loadOwnedIdentityPacks } from "@/lib/identityPackOwnership";
import { DEMO_BLINK_FRAME_DATA_URIS } from "@/lib/demoBlinkFrameData";
import type { RootStackParamList } from "@/navigation/RootNavigator";
import { useAuthStore } from "@/stores/authStore";
import { useDictionaryStore } from "@/stores/dictionaryStore";
import { useSkinStore } from "@/stores/skinStore";
import {
  DEFAULT_QUICK_REPLY_SLOTS,
  buildQuickReplySlots,
} from "@/lib/quickReplySlots";

type PreviewState = "empty" | "incoming-beep" | "incoming-blink";
type WidgetSize = "small" | "medium";

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
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "WidgetStates">>();
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
          <WidgetMockup size={size} state={previewState} slots={replySlots} pack={previewPack} />
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

function WidgetMockup({
  size,
  state,
  slots,
  pack,
}: {
  size: WidgetSize;
  state: PreviewState;
  slots: string[];
  pack: IdentityPack;
}) {
  const visual = getPackVisual(pack);
  if (size === "medium") {
    return <MediumWidgetMockup state={state} slots={slots} pack={pack} />;
  }

  const isEmpty = state === "empty";
  const code = isEmpty ? "----" : pack.code;
  const codeStyle = code.length > 4 ? styles.widgetCodeCompact : null;

  return (
    <View style={styles.smallWidgetStage}>
      <View
        style={[
          styles.widgetShell,
          styles.smallWidgetShell,
          { backgroundColor: visual.surface, borderColor: visual.border },
        ]}
      >
        <View style={styles.widgetHeader}>
          <Text style={[styles.widgetLabel, { color: visual.muted }]}>BEEP-GET</Text>
          <View style={[styles.widgetDot, { backgroundColor: visual.accent }]} />
        </View>
        {isEmpty ? (
          <View style={styles.emptyWidget}>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.72}
              style={[styles.widgetCode, codeStyle, { color: visual.muted }]}
            >
              {code}
            </Text>
            <Text style={[type.tinyMono, { color: visual.muted }]}>WAITING</Text>
          </View>
        ) : (
          <>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.72}
              style={[styles.widgetCode, codeStyle, { color: visual.text }]}
            >
              {code}
            </Text>
            <Text numberOfLines={1} style={[styles.widgetMeaning, { color: visual.text }]}>
              {pack.layout === "photo-booth" ? "Private Blink" : "Private Beep"}
            </Text>
          </>
        )}
      </View>
    </View>
  );
}

function MediumWidgetMockup({
  state,
  slots,
  pack,
}: {
  state: PreviewState;
  slots: string[];
  pack: IdentityPack;
}) {
  const visual = getPackVisual(pack);
  const isEmpty = state === "empty";
  const kind = isEmpty ? "Waiting" : "Blink";
  const status = isEmpty ? "IDLE" : "NEW";
  const code = isEmpty ? "----" : pack.code;

  return (
    <View style={[styles.mediumWidgetShell, { backgroundColor: visual.surface, borderColor: visual.border }]}>
      <View style={styles.mediumWidgetHead}>
        <View style={styles.mediumWidgetTitleRow}>
          <Text style={[styles.mediumWidgetIncoming, { color: visual.text }]}>Incoming</Text>
          <Text style={[styles.mediumWidgetKind, { color: visual.text }]}>{kind}</Text>
        </View>
        <Text style={[styles.mediumWidgetMeta, { color: visual.text }]}>
          NO.{pack.index} - 18:05
        </Text>
      </View>
      <View style={[styles.mediumWidgetRule, { backgroundColor: visual.text }]} />
      <View style={styles.mediumWidgetBody}>
        <View style={styles.mediumWidgetNumberBlock}>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.68}
            style={[
              styles.mediumWidgetCode,
              { color: isEmpty ? visual.muted : visual.text },
            ]}
          >
            {code}
          </Text>
          <View style={styles.mediumWidgetFromRow}>
            <Text style={[styles.mediumWidgetLabel, { color: visual.muted }]}>FROM</Text>
            <Text numberOfLines={1} style={[styles.mediumWidgetFrom, { color: visual.text }]}>
              {isEmpty ? "None" : pack.from}
            </Text>
          </View>
          <Text style={[styles.mediumWidgetLabel, { color: visual.muted }]}>
            {isEmpty ? "WAITING" : "2.0s - MUTE"}
          </Text>
        </View>
        <View style={[styles.mediumWidgetVerticalRule, { backgroundColor: visual.text }]} />
        <View style={styles.mediumWidgetSignalPane}>
          <View style={styles.mediumWidgetSignalHead}>
            <Text style={[styles.mediumWidgetLabel, { color: visual.muted }]}>SIGNAL SLOTS</Text>
            <Text
              style={[
                styles.mediumWidgetStatus,
                { color: isEmpty ? visual.muted : visual.accent },
              ]}
            >
              {status}
            </Text>
          </View>
          {!isEmpty ? (
            <MediumFrameStrip />
          ) : (
            <MediumQuickSlots slots={isEmpty ? ["--", "--", "--"] : slots} muted={isEmpty} />
          )}
        </View>
      </View>
    </View>
  );
}

function MediumFrameStrip({ frameUris = DEMO_BLINK_FRAME_DATA_URIS }: { frameUris?: readonly string[] }) {
  return (
    <View style={[styles.mediumFrameStrip, styles.mediumFrameStripExpanded]}>
      {frameUris.slice(0, 3).map((uri, index) => (
        <View key={`${uri}-${index}`} style={styles.mediumFrameThumb}>
          <Image source={{ uri }} style={styles.mediumFrameImage} resizeMode="cover" />
        </View>
      ))}
    </View>
  );
}

function MediumQuickSlots({
  slots,
  muted = false,
}: {
  slots: string[];
  muted?: boolean;
}) {
  return (
    <View style={styles.mediumQuickSlots}>
      {slots.slice(0, 3).map((slot, index) => (
        <View key={`${slot}-${index}`} style={[styles.mediumQuickSlot, muted && styles.mediumQuickSlotMuted]}>
          <Text style={[styles.mediumQuickSlotText, muted && styles.mediumQuickSlotTextMuted]}>{slot}</Text>
        </View>
      ))}
    </View>
  );
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
  smallWidgetStage: {
    alignItems: "center",
    paddingVertical: spacing[1],
  },
  widgetShell: {
    minHeight: 156,
    gap: spacing[3],
    padding: spacing[4],
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.ruleStrong,
  },
  smallWidgetShell: {
    width: 178,
    minHeight: 0,
    aspectRatio: 1,
    alignSelf: "center",
    padding: spacing[4],
  },
  widgetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  widgetLabel: {
    ...type.tinyMono,
  },
  widgetDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.red,
  },
  widgetCode: {
    ...type.codeMedium,
    fontSize: 44,
    lineHeight: 52,
    textAlign: "center",
  },
  widgetCodeCompact: {
    fontSize: 30,
    lineHeight: 36,
  },
  widgetMeaning: {
    ...type.metaValue,
    textAlign: "center",
  },
  mediumWidgetShell: {
    minHeight: 224,
    overflow: "hidden",
    borderWidth: 1,
    borderRadius: 16,
  },
  mediumWidgetHead: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing[3],
    paddingHorizontal: spacing[4],
  },
  mediumWidgetTitleRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing[2],
  },
  mediumWidgetIncoming: {
    ...type.slipTitleSmall,
    fontSize: 15,
    lineHeight: 18,
  },
  mediumWidgetKind: {
    ...type.slipTitleSmall,
    fontSize: 15,
    fontStyle: "italic",
    lineHeight: 18,
  },
  mediumWidgetMeta: {
    ...type.tinyMono,
    fontSize: 9,
  },
  mediumWidgetRule: {
    height: 1,
  },
  mediumWidgetBody: {
    flex: 1,
    minHeight: 172,
    flexDirection: "row",
  },
  mediumWidgetNumberBlock: {
    width: 116,
    justifyContent: "center",
    gap: spacing[2],
    paddingHorizontal: spacing[4],
  },
  mediumWidgetCode: {
    ...type.codeMedium,
    fontSize: 34,
    lineHeight: 40,
  },
  mediumWidgetFromRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing[2],
  },
  mediumWidgetLabel: {
    ...type.tinyMono,
    fontSize: 8,
  },
  mediumWidgetFrom: {
    ...type.tinyMono,
    flex: 1,
    fontSize: 10,
  },
  mediumWidgetVerticalRule: {
    width: 1,
  },
  mediumWidgetSignalPane: {
    flex: 1,
    gap: spacing[3],
    padding: spacing[4],
  },
  mediumWidgetSignalHead: {
    minHeight: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing[2],
  },
  mediumWidgetStatus: {
    ...type.tinyMono,
    fontSize: 9,
  },
  mediumFrameStrip: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: spacing[2],
  },
  mediumFrameStripExpanded: {
    flex: 1,
    minHeight: 110,
  },
  mediumFrameThumb: {
    flex: 1,
    minHeight: 110,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.ink,
    borderRadius: 6,
    backgroundColor: "#E7D9C8",
  },
  mediumFrameImage: {
    width: "100%",
    height: "100%",
    transform: [{ scale: 1.08 }],
  },
  mediumQuickSlots: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: spacing[2],
  },
  mediumQuickSlot: {
    flex: 1,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.ink,
    borderRadius: 6,
    backgroundColor: colors.paper,
  },
  mediumQuickSlotMuted: {
    borderColor: colors.ruleStrong,
    backgroundColor: colors.paperDeep,
  },
  mediumQuickSlotText: {
    ...type.tinyMono,
    color: colors.ink,
    fontSize: 9,
  },
  mediumQuickSlotTextMuted: {
    color: colors.muted,
  },
  emptyWidget: {
    flex: 1,
    justifyContent: "center",
    gap: spacing[2],
  },
  pressed: {
    opacity: 0.82,
    transform: [{ translateY: 1 }],
  },
});
