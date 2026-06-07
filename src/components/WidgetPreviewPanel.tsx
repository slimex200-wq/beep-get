import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { radius, spacing } from "@/design/tokens";
import { type } from "@/design/typography";
import { useAppPalette } from "@/design/appTheme";
import { ActualWidgetPreview, type ActualWidgetKind } from "@/components/ActualWidgetPreview";
import {
  DEFAULT_IDENTITY_PACK_SLUG,
  getIdentityPack,
  type IdentityPack,
} from "@/design/identityPacks";

type WidgetTone = "lavender" | "pink" | "mint" | "metal";

type Props = {
  readonly title: string;
  readonly subtitle: string;
  readonly code: string;
  readonly from: string;
  readonly tone?: WidgetTone;
  readonly medium?: boolean;
  readonly paperMode?: boolean;
  readonly compact?: boolean;
  readonly kind?: ActualWidgetKind;
  readonly skin?: IdentityPack;
  readonly frameUris?: readonly string[];
};

export function WidgetPreviewPanel({
  title,
  subtitle,
  code,
  from,
  medium = false,
  paperMode = false,
  compact = false,
  kind,
  skin,
  frameUris,
}: Props) {
  const palette = useAppPalette();
  const widgetSkin = skin ?? getIdentityPack(DEFAULT_IDENTITY_PACK_SLUG);

  return (
    <View
      style={[
        styles.panel,
        paperMode && styles.paperPanel,
        { backgroundColor: palette.input, borderColor: palette.rule },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.titleBlock}>
          <Text style={[styles.title, { color: palette.text }]}>{title}</Text>
          <Text style={[styles.subtitle, { color: palette.muted }]}>{subtitle}</Text>
        </View>
        <View style={[styles.livePill, { backgroundColor: palette.cardSoft, borderColor: palette.rule }]}>
          <Text style={[styles.livePillText, { color: palette.muted }]}>WIDGET FIRST</Text>
        </View>
      </View>
      <ActualWidgetPreview
        size={medium ? "medium" : "small"}
        kind={kind ?? (medium ? "blink" : "beep")}
        code={code}
        from={from}
        skin={widgetSkin}
        frameUris={frameUris}
        compact={compact}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    gap: spacing[3],
    padding: spacing[3],
    borderWidth: 1,
    borderRadius: 14,
  },
  paperPanel: {
    borderRadius: radius.slipSmall,
  },
  header: {
    minHeight: 30,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing[3],
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    ...type.metaValue,
    fontSize: 13,
  },
  subtitle: {
    ...type.bodyMuted,
    marginTop: spacing[1],
  },
  livePill: {
    minHeight: 24,
    justifyContent: "center",
    paddingHorizontal: spacing[3],
    borderWidth: 1,
    borderRadius: radius.pill,
  },
  livePillText: {
    ...type.tinyMono,
    fontSize: 7,
  },
});
