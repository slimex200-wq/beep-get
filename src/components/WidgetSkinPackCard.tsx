import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { spacing } from "@/design/tokens";
import { type } from "@/design/typography";
import { useAppPalette } from "@/design/appTheme";
import type { IdentityPack } from "@/design/identityPacks";
import {
  getPackVisual,
  type IdentityPackVisual,
} from "@/design/widgetSkinVisuals";
import {
  ActualWidgetPreview,
  type ActualWidgetKind,
} from "@/components/ActualWidgetPreview";

export type WidgetPreviewSize = "small" | "medium";

export { getPackVisual };
export type { IdentityPackVisual };

function packWidgetKind(pack: IdentityPack): ActualWidgetKind {
  return pack.layout === "photo-booth" ? "blink" : "beep";
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
  const fromLabel = previewFrom?.trim() || skin.from;

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
      <ActualWidgetPreview
        size={size}
        kind={packWidgetKind(skin)}
        code={skin.code}
        from={fromLabel}
        skin={skin}
        time={skin.time}
        indexNo={skin.index}
        status={skin.badge}
        compact={size === "small"}
      />
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
  pressed: {
    opacity: 0.82,
    transform: [{ translateY: 1 }],
  },
});
