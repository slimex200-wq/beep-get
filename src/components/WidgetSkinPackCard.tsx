import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "@/design/tokens";
import { type } from "@/design/typography";
import { useAppPalette } from "@/design/appTheme";
import type { IdentityPack } from "@/design/identityPacks";
import {
  getPackVisual,
  type IdentityPackVisual,
} from "@/design/widgetSkinVisuals";
import { DEMO_BLINK_FRAME_DATA_URIS } from "@/lib/demoBlinkFrameData";

export type WidgetPreviewSize = "small" | "medium";

export { getPackVisual };
export type { IdentityPackVisual };

function getPrimarySignalExpression(pack: IdentityPack) {
  return pack.expressions.find((expression) => expression.asset) ?? pack.expressions[0];
}

export function WidgetSkinPackCard({
  skin,
  size = "small",
  active,
  owned,
  lockedLabel,
  previewFrom,
  onPress,
}: {
  skin: IdentityPack;
  size?: WidgetPreviewSize;
  active: boolean;
  owned: boolean;
  lockedLabel?: string;
  previewFrom?: string;
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
      <SkinPackWidgetPreview size={size} skin={skin} previewFrom={previewFrom} />
      <View style={styles.skinPackCardCopy}>
        <View style={styles.skinPackTitleRow}>
          <Text style={[styles.skinPackName, { color: palette.text }]}>{skin.name}</Text>
          <Text style={[styles.skinPackState, { color: active ? palette.text : getPackVisual(skin).accent }]}>
            {active ? "ACTIVE" : owned ? "OWNED" : lockedLabel ?? skin.priceLabel}
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
  previewFrom,
}: {
  size: WidgetPreviewSize;
  skin: IdentityPack;
  previewFrom?: string;
}) {
  const fromLabel = previewFrom?.trim() || skin.from;

  if (size === "medium") {
    return <MediumSkinPackWidgetPreview skin={skin} fromLabel={fromLabel} />;
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
        {fromLabel}
      </Text>
    </View>
  );
}

function MediumSkinPackWidgetPreview({ skin, fromLabel }: { skin: IdentityPack; fromLabel: string }) {
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
              {fromLabel}
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
  size: WidgetPreviewSize;
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

const styles = StyleSheet.create({
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
  pressed: {
    opacity: 0.82,
    transform: [{ translateY: 1 }],
  },
});
