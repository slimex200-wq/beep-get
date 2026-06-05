import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "@/design/tokens";
import { type } from "@/design/typography";
import { lightPalette, useAppPalette } from "@/design/appTheme";

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
};

const toneVisuals: Record<WidgetTone, { readonly surface: string; readonly edge: string; readonly accent: string }> = {
  lavender: {
    surface: "#DCC7F3",
    edge: "#8F64B8",
    accent: "#FF7FA3",
  },
  pink: {
    surface: "#FFD8DF",
    edge: "#E98CA1",
    accent: "#E94473",
  },
  mint: {
    surface: "#DDF1D8",
    edge: "#94C88B",
    accent: "#A05FD8",
  },
  metal: {
    surface: "#E7E3DD",
    edge: "#9D9891",
    accent: "#8B58C8",
  },
};

export function WidgetPreviewPanel({
  title,
  subtitle,
  code,
  from,
  tone = "lavender",
  medium = false,
  paperMode = false,
  compact = false,
}: Props) {
  const themedPalette = useAppPalette();
  const palette = paperMode ? lightPalette : themedPalette;
  const visual = toneVisuals[tone];

  return (
    <View style={[styles.panel, { backgroundColor: palette.card, borderColor: palette.rule }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: palette.text }]}>{title}</Text>
          <Text style={[styles.subtitle, { color: palette.muted }]}>{subtitle}</Text>
        </View>
        <View style={[styles.livePill, { backgroundColor: palette.chip, borderColor: palette.rule }]}>
          <Text style={[styles.livePillText, { color: palette.muted }]}>WIDGET FIRST</Text>
        </View>
      </View>
      <View
        style={[
          styles.widget,
          medium && styles.widgetMedium,
          compact && styles.widgetCompact,
          {
            backgroundColor: visual.surface,
            borderColor: visual.edge,
          },
        ]}
      >
        <View style={styles.widgetTop}>
          <Text style={styles.widgetKicker}>{medium ? "Incoming Blink" : "Incoming Beep"}</Text>
          <View style={[styles.signalDot, { backgroundColor: visual.accent }]} />
        </View>
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.64}
          style={[styles.code, medium && styles.codeMedium, compact && styles.codeCompact]}
        >
          {code || "----"}
        </Text>
        <View style={styles.widgetFooter}>
          <Text numberOfLines={1} style={styles.fromText}>
            FROM. {from || "No signal yet"}
          </Text>
          {medium ? (
            <View style={styles.actionRow}>
              {["OK", "8282", "OPEN"].map((label) => (
                <View key={label} style={styles.actionChip}>
                  <Text style={styles.actionText}>{label}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      </View>
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
  header: {
    minHeight: 30,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing[3],
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
  widget: {
    minHeight: 96,
    justifyContent: "space-between",
    overflow: "hidden",
    padding: spacing[4],
    borderWidth: 1.5,
    borderRadius: 13,
  },
  widgetMedium: {
    minHeight: 138,
  },
  widgetCompact: {
    width: "76%",
    minHeight: 82,
    alignSelf: "center",
    padding: spacing[3],
  },
  widgetTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  widgetKicker: {
    ...type.tinyMono,
    color: "rgba(10,10,10,0.62)",
  },
  signalDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  code: {
    ...type.codeMedium,
    color: colors.ink,
    fontSize: 36,
    lineHeight: 42,
  },
  codeMedium: {
    fontSize: 42,
    lineHeight: 48,
  },
  codeCompact: {
    fontSize: 28,
    lineHeight: 34,
  },
  widgetFooter: {
    gap: spacing[2],
  },
  fromText: {
    ...type.tinyMono,
    color: "rgba(10,10,10,0.72)",
  },
  actionRow: {
    flexDirection: "row",
    gap: spacing[2],
  },
  actionChip: {
    flex: 1,
    minHeight: 24,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.button,
    backgroundColor: "rgba(255,255,255,0.48)",
  },
  actionText: {
    ...type.tinyMono,
    color: colors.ink,
    fontSize: 7,
  },
});
