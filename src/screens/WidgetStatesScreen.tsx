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
import { colors, radius, spacing } from "@/design/tokens";
import { type } from "@/design/typography";
import { useAppPalette } from "@/design/appTheme";
import { identityPacks, type IdentityPack } from "@/design/identityPacks";
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

const IDENTITY_TO_SKIN_SLUG: Record<string, string> = {
  "classic-paper": "swiss-paper",
  "school-desk": "neumorphism",
  "cherry-dot": "glassmorphism",
  "photo-booth-blink": "retro-future",
  "night-signal": "cyber-neon",
};

const SKIN_TO_IDENTITY_SLUG: Record<string, string> = {
  "swiss-paper": "classic-paper",
  "pixel-pager": "classic-paper",
  neumorphism: "school-desk",
  glassmorphism: "cherry-dot",
  "retro-future": "photo-booth-blink",
  "cyber-neon": "night-signal",
};

type IdentityPackVisual = {
  surface: string;
  chip: string;
  text: string;
  muted: string;
  border: string;
  accent: string;
};

const PACK_VISUALS: Record<IdentityPack["tone"], IdentityPackVisual> = {
  paper: {
    surface: "#F0EEE9",
    chip: "#FFFFFF",
    text: "#0A0A0A",
    muted: "#6B655C",
    border: "#9C958B",
    accent: "#D8361E",
  },
  school: {
    surface: "#FFF8E8",
    chip: "#FFFFFF",
    text: "#13110D",
    muted: "#70695D",
    border: "#B8AD9C",
    accent: "#35724D",
  },
  cherry: {
    surface: "#FFECEF",
    chip: "#FFFFFF",
    text: "#1B1114",
    muted: "#7A6268",
    border: "#E6BAC2",
    accent: "#D84B62",
  },
  photo: {
    surface: "#F8FCFD",
    chip: "#FFFFFF",
    text: "#0E171A",
    muted: "#65767B",
    border: "#AFC9D0",
    accent: "#166F83",
  },
  night: {
    surface: "#0A0A0A",
    chip: "#20231F",
    text: "#F8F2E8",
    muted: "#B9B0A3",
    border: "rgba(248,242,232,0.36)",
    accent: "#92D66D",
  },
};

function coercePreviewStateForSize(size: WidgetSize, state: PreviewState): PreviewState {
  if (state === "empty") return state;
  return size === "small" ? "incoming-beep" : "incoming-blink";
}

function previewStateLabel(state: PreviewState) {
  if (state === "empty") return "Empty";
  return state === "incoming-beep" ? "Beep" : "Blink";
}

function getIdentitySlugForSkin(skinSlug: string) {
  return SKIN_TO_IDENTITY_SLUG[skinSlug] ?? skinSlug;
}

function getSkinSlugForIdentity(identitySlug: string) {
  return IDENTITY_TO_SKIN_SLUG[identitySlug] ?? identitySlug;
}

function getIdentityPack(slug: string) {
  return identityPacks.find((pack) => pack.slug === slug) ?? identityPacks[0];
}

function getPackVisual(pack: IdentityPack) {
  return PACK_VISUALS[pack.tone];
}

function getPrimarySignalExpression(pack: IdentityPack) {
  return pack.expressions.find((expression) => expression.asset) ?? pack.expressions[0];
}

export function WidgetStatesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "WidgetStates">>();
  const { profile } = useAuthStore();
  const { entries } = useDictionaryStore();
  const {
    activeSkinSlug,
    allSkins,
    ownedSkins,
    fetchActiveSkin,
    fetchAll: fetchSkins,
    fetchOwned: fetchOwnedSkins,
    apply: applySkinPack,
    setLocalActiveSkin,
  } = useSkinStore();
  const palette = useAppPalette();
  const [size, setSize] = useState<WidgetSize>(route.params?.size ?? "medium");
  const [previewState, setPreviewState] = useState<PreviewState>(
    () => (route.params?.size === "small" ? "incoming-beep" : "incoming-blink"),
  );
  const [previewPackSlug, setPreviewPackSlug] = useState(() =>
    getIdentitySlugForSkin(activeSkinSlug),
  );

  React.useEffect(() => {
    fetchSkins().catch(reportError);
  }, [fetchSkins]);

  React.useEffect(() => {
    if (!profile) return;
    fetchOwnedSkins(profile.id).catch(reportError);
    fetchActiveSkin(profile.id).catch(reportError);
  }, [fetchActiveSkin, fetchOwnedSkins, profile?.id]);

  React.useEffect(() => {
    setPreviewState((current) => coercePreviewStateForSize(size, current));
  }, [size]);

  React.useEffect(() => {
    setPreviewPackSlug(getIdentitySlugForSkin(activeSkinSlug));
  }, [activeSkinSlug]);

  const replySlots = useMemo(() => {
    return buildQuickReplySlots(entries, DEFAULT_QUICK_REPLY_SLOTS);
  }, [entries]);
  const previewPack = useMemo(() => getIdentityPack(previewPackSlug), [previewPackSlug]);
  const ownedIdentitySlugs = useMemo(
    () =>
      new Set([
        ...identityPacks.filter((pack) => pack.isFree).map((pack) => pack.slug),
        ...ownedSkins.map((item) => getIdentitySlugForSkin(item.skin?.slug ?? "")),
      ]),
    [ownedSkins],
  );
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
    const skinSlug = getSkinSlugForIdentity(pack.slug);
    const mappedSkin = allSkins.find((skin) => skin.slug === skinSlug);
    const ownsMappedSkin = Boolean(
      mappedSkin?.is_free ||
        ownedSkins.some(
          (item) => item.skin_id === mappedSkin?.id || item.skin?.slug === mappedSkin?.slug,
        ),
    );
    const isOwned = Boolean(pack.isFree || ownedIdentitySlugs.has(pack.slug) || ownsMappedSkin);

    setPreviewPackSlug(pack.slug);

    try {
      if (!isOwned) {
        Alert.alert(
          "Skin Pack Preview",
          `${pack.name} can preview here. Unlocking applies its widget skin, avatar frame, and emotes together.`,
        );
        return;
      }

      if (!profile || !mappedSkin?.id) {
        setLocalActiveSkin(skinSlug);
        return;
      }
      await applySkinPack(profile.id, mappedSkin.id, mappedSkin.slug);
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
          actions={[{ label: "×", accessibilityLabel: "Close widget layouts", onPress: close }]}
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
              owned={ownedIdentitySlugs.has(skin.slug)}
              onPress={() => chooseSkinPack(skin)}
            />
          ))}
        </View>
      </ScrollView>
    </AppSurface>
  );
}

function WidgetSkinPackCard({
  skin,
  size,
  active,
  owned,
  onPress,
}: {
  skin: IdentityPack;
  size: "small" | "medium";
  active: boolean;
  owned: boolean;
  onPress: () => void;
}) {
  const palette = useAppPalette();

  return (
    <Pressable
      accessibilityLabel={`${active ? "Active" : owned ? "Apply" : "Preview"} ${skin.name} Skin Pack`}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.skinPackCard,
        {
          backgroundColor: palette.card,
          borderColor: active ? palette.primary : palette.rule,
        },
        active && styles.skinPackCardActive,
        pressed && styles.pressed,
      ]}
    >
      <SkinPackWidgetPreview size={size} skin={skin} />
      <View style={styles.skinPackCardCopy}>
        <View style={styles.skinPackTitleRow}>
          <Text style={[styles.skinPackName, { color: palette.text }]}>{skin.name}</Text>
          <Text style={[styles.skinPackState, { color: active ? palette.text : getPackVisual(skin).accent }]}>
            {active ? "ACTIVE" : owned ? "OWNED" : skin.priceLabel}
          </Text>
        </View>
        <Text numberOfLines={2} style={[type.bodyMuted, { color: palette.muted }]}>
          {skin.shortCopy}
        </Text>
      </View>
    </Pressable>
  );
}

function SkinPackWidgetPreview({
  size,
  skin,
}: {
  size: "small" | "medium";
  skin: IdentityPack;
}) {
  if (size === "medium") {
    return <MediumSkinPackWidgetPreview skin={skin} />;
  }
  const visual = getPackVisual(skin);

  return (
    <View
      style={[
        styles.skinPackWidgetSmall,
        { backgroundColor: visual.surface, borderColor: visual.border },
      ]}
    >
      <View style={styles.skinPackWidgetTop}>
        <Text style={[styles.skinPackWidgetLabel, { color: visual.muted }]}>BEEP-GET</Text>
        <View style={[styles.skinPackDot, { backgroundColor: visual.accent }]} />
      </View>
      <View style={styles.skinPackWidgetCenter}>
        <SignalPayloadPreview pack={skin} visual={visual} size="small" />
      </View>
      <Text numberOfLines={1} style={[styles.skinPackMeaning, { color: visual.muted }]}>
        {skin.from}
      </Text>
    </View>
  );
}

function MediumSkinPackWidgetPreview({ skin }: { skin: IdentityPack }) {
  const visual = getPackVisual(skin);

  return (
    <View
      style={[
        styles.skinPackWidgetMedium,
        { backgroundColor: visual.surface, borderColor: visual.border },
      ]}
    >
      <View style={styles.skinPackMediumHead}>
        <View style={styles.skinPackMediumTitleRow}>
          <Text style={[styles.skinPackMediumTitle, { color: visual.text }]}>Incoming</Text>
          <Text style={[styles.skinPackMediumKind, { color: visual.text }]}>
            {skin.layout === "photo-booth" ? "Blink" : "Beep"}
          </Text>
        </View>
        <Text style={[styles.skinPackMediumMeta, { color: visual.text }]}>
          NO.{skin.index} - {skin.time}
        </Text>
      </View>
      <View style={[styles.skinPackMediumRule, { backgroundColor: visual.text }]} />
      <View style={styles.skinPackMediumBody}>
        <View style={styles.skinPackMediumNumberBlock}>
          <SignalPayloadPreview pack={skin} visual={visual} size="medium" />
          <View style={styles.skinPackMediumFromRow}>
            <Text style={[styles.skinPackMediumLabel, { color: visual.muted }]}>FROM</Text>
            <Text numberOfLines={1} style={[styles.skinPackMediumFrom, { color: visual.text }]}>
              {skin.from}
            </Text>
          </View>
          <Text style={[styles.skinPackMediumLabel, { color: visual.muted }]}>2.0s - MUTE</Text>
        </View>
        <View style={[styles.skinPackMediumVerticalRule, { backgroundColor: visual.text }]} />
        <View style={styles.skinPackMediumSignalPane}>
          <View style={styles.skinPackMediumSignalHead}>
            <Text style={[styles.skinPackMediumLabel, { color: visual.muted }]}>SIGNAL SLOTS</Text>
            <Text style={[styles.skinPackMediumStatus, { color: visual.accent }]}>{skin.badge}</Text>
          </View>
          <VideoSlotPreviewStrip visual={visual} />
        </View>
      </View>
    </View>
  );
}

function SignalPayloadPreview({
  pack,
  visual,
  size,
}: {
  pack: IdentityPack;
  visual: IdentityPackVisual;
  size: "small" | "medium";
}) {
  const expression = getPrimarySignalExpression(pack);
  const label = expression?.label ?? pack.code;
  const codeStyle =
    size === "small"
      ? pack.code.length > 4
        ? styles.skinPackCodeCompact
        : styles.skinPackCodeSmall
      : styles.skinPackMediumCode;

  if (expression?.asset) {
    return (
      <View style={[styles.signalPayloadImageWrap, size === "medium" && styles.signalPayloadImageWrapMedium]}>
        <Image
          source={expression.asset}
          style={[styles.signalPayloadImage, size === "medium" && styles.signalPayloadImageMedium]}
          resizeMode="contain"
        />
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.72}
          style={[
            styles.signalPayloadLabel,
            size === "medium" && styles.signalPayloadLabelMedium,
            { color: visual.text },
          ]}
        >
          {label}
        </Text>
      </View>
    );
  }

  return (
    <Text
      numberOfLines={1}
      adjustsFontSizeToFit
      minimumFontScale={0.68}
      style={[styles.skinPackCode, codeStyle, { color: visual.text }]}
    >
      {pack.code}
    </Text>
  );
}

function VideoSlotPreviewStrip({ visual }: { visual: IdentityPackVisual }) {
  return (
    <View style={styles.skinPackMediumFrameStrip}>
      {DEMO_BLINK_FRAME_DATA_URIS.slice(0, 3).map((uri, index) => (
        <View
          key={`${uri}-skin-pack-video-${index}`}
          style={[
            styles.skinPackMediumFrameThumb,
            { borderColor: visual.border },
          ]}
        >
          <Image source={{ uri }} style={styles.skinPackMediumFrameImage} resizeMode="cover" />
          <View style={[styles.skinPackMediumFrameMark, { backgroundColor: visual.accent }]} />
          <View style={styles.skinPackVideoScrim} />
          <Text style={styles.skinPackVideoMeta}>{index + 1}.8s</Text>
        </View>
      ))}
    </View>
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
  skinPackCard: {
    minHeight: 190,
    gap: spacing[3],
    padding: spacing[3],
    borderWidth: 1,
    borderRadius: 16,
  },
  skinPackCardActive: {
    borderWidth: 2,
  },
  skinPackWidgetSmall: {
    width: 132,
    aspectRatio: 1,
    alignSelf: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 13,
    padding: spacing[3],
    overflow: "hidden",
  },
  skinPackWidgetMedium: {
    minHeight: 194,
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 13,
    padding: spacing[3],
    overflow: "hidden",
  },
  skinPackMediumHead: {
    minHeight: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing[2],
  },
  skinPackMediumTitleRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing[1],
  },
  skinPackMediumTitle: {
    ...type.metaValue,
    fontSize: 12,
    lineHeight: 15,
  },
  skinPackMediumKind: {
    ...type.metaValue,
    fontSize: 12,
    fontStyle: "italic",
    lineHeight: 15,
  },
  skinPackMediumMeta: {
    ...type.tinyMono,
    fontSize: 7,
  },
  skinPackMediumRule: {
    height: 1,
    opacity: 0.8,
  },
  skinPackMediumBody: {
    flex: 1,
    minHeight: 138,
    flexDirection: "row",
  },
  skinPackMediumNumberBlock: {
    width: 96,
    justifyContent: "center",
    gap: spacing[1],
    paddingRight: spacing[3],
  },
  skinPackMediumCode: {
    ...type.codeSmall,
    fontSize: 27,
    lineHeight: 31,
  },
  skinPackMediumFromRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing[1],
  },
  skinPackMediumLabel: {
    ...type.tinyMono,
    fontSize: 7,
  },
  skinPackMediumFrom: {
    ...type.tinyMono,
    flex: 1,
    fontSize: 8,
  },
  skinPackMediumVerticalRule: {
    width: 1,
    opacity: 0.8,
  },
  skinPackMediumSignalPane: {
    flex: 1,
    gap: spacing[2],
    paddingLeft: spacing[3],
    paddingVertical: spacing[2],
  },
  skinPackMediumSignalHead: {
    minHeight: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing[2],
  },
  skinPackMediumStatus: {
    ...type.tinyMono,
    fontSize: 7,
  },
  skinPackMediumFrameStrip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "stretch",
    gap: spacing[2],
    minHeight: 82,
  },
  skinPackMediumFrameThumb: {
    flex: 1,
    minHeight: 82,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 6,
    backgroundColor: colors.ink,
  },
  skinPackMediumFrameImage: {
    width: "100%",
    height: "100%",
    transform: [{ scale: 1.05 }],
  },
  skinPackMediumFrameMark: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  skinPackVideoScrim: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 22,
    backgroundColor: "rgba(0,0,0,0.36)",
  },
  skinPackVideoMeta: {
    ...type.tinyMono,
    position: "absolute",
    right: 4,
    bottom: 4,
    color: colors.paperWarm,
    fontSize: 7,
  },
  skinPackWidgetTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  skinPackWidgetCenter: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacing[1],
  },
  skinPackWidgetLabel: {
    ...type.tinyMono,
    fontSize: 8,
  },
  skinPackDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  skinPackCode: {
    ...type.codeMedium,
    fontSize: 30,
    lineHeight: 36,
    textAlign: "center",
  },
  skinPackCodeSmall: {
    fontSize: 34,
    lineHeight: 40,
  },
  skinPackCodeCompact: {
    fontSize: 24,
    lineHeight: 30,
  },
  skinPackMeaning: {
    ...type.metaValue,
    fontSize: 9,
    textAlign: "center",
  },
  skinPackCardCopy: {
    gap: spacing[2],
  },
  skinPackTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing[3],
  },
  skinPackName: {
    ...type.metaValue,
    flex: 1,
    fontSize: 12,
  },
  skinPackState: {
    ...type.tinyMono,
    fontSize: 8,
  },
  signalPayloadImageWrap: {
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  signalPayloadImageWrapMedium: {
    alignItems: "flex-start",
  },
  signalPayloadImage: {
    width: 58,
    height: 58,
  },
  signalPayloadImageMedium: {
    width: 52,
    height: 52,
  },
  signalPayloadLabel: {
    ...type.metaValue,
    maxWidth: 96,
    fontSize: 8,
    lineHeight: 11,
    textAlign: "center",
  },
  signalPayloadLabelMedium: {
    maxWidth: 88,
    textAlign: "left",
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
