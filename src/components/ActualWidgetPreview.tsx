import React from "react";
import { Image, Text, View } from "react-native";
import type { IdentityPack } from "@/design/identityPacks";
import { getPackVisual, type IdentityPackVisual } from "@/design/widgetSkinVisuals";
import { DEMO_BLINK_FRAME_DATA_URIS } from "@/lib/demoBlinkFrameData";
import { styles } from "@/components/ActualWidgetPreview.styles";

export type ActualWidgetKind = "beep" | "blink";
export type ActualWidgetSize = "small" | "medium";
export type ActualWidgetVariant = "filled" | "empty";

type Props = {
  readonly size?: ActualWidgetSize;
  readonly kind?: ActualWidgetKind;
  readonly variant?: ActualWidgetVariant;
  readonly code: string;
  readonly from: string;
  readonly skin: IdentityPack;
  readonly time?: string;
  readonly indexNo?: string;
  readonly status?: string;
  readonly frameUris?: readonly string[];
  readonly compact?: boolean;
};

export function ActualWidgetPreview({
  size = "small",
  kind = "beep",
  variant = "filled",
  code,
  from,
  skin,
  time = "18:05",
  indexNo,
  status = "NEW",
  frameUris,
  compact = false,
}: Props) {
  const visual = getPackVisual(skin);
  const isEmpty = variant === "empty";
  // Empty/waiting state mirrors the live widget's idle slip: dashed code, no
  // sender, muted "WAITING" copy, and blank signal slots.
  const safeCode = isEmpty ? "----" : code.trim() || "8282";
  const safeFrom = isEmpty ? "None" : from.trim() || "BEEP-GET";
  const safeIndex = indexNo?.trim() || skin.index;
  const codeColor = isEmpty ? visual.muted : visual.text;
  const safeStatus = isEmpty ? "IDLE" : status;
  const stripUris =
    !isEmpty && kind === "blink"
      ? (frameUris && frameUris.length > 0 ? frameUris : DEMO_BLINK_FRAME_DATA_URIS).slice(0, 3)
      : [];

  if (size === "medium") {
    return (
      <View style={[styles.medium, { backgroundColor: visual.surface, borderColor: visual.border }]}>
        <View style={styles.mediumHead}>
          <View style={styles.mediumTitleRow}>
            <Text style={[styles.mediumTitle, { color: visual.text }]}>Incoming</Text>
            <Text style={[styles.mediumKind, { color: visual.text }]}>
              {isEmpty ? "Waiting" : kind === "blink" ? "Blink" : "Beep"}
            </Text>
          </View>
          <Text style={[styles.mediumMeta, { color: visual.text }]}>NO.{safeIndex} - {time}</Text>
        </View>
        <Rule color={visual.text} />
        <View style={styles.mediumBody}>
          <View style={styles.mediumNumberBlock}>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.55}
              style={[styles.mediumCode, { color: codeColor }]}
            >
              {safeCode}
            </Text>
            <LabelValue label="FROM" value={safeFrom} visual={visual} />
            <Text style={[styles.label, { color: visual.muted }]}>
              {isEmpty ? "WAITING" : kind === "blink" ? "2.0s - MUTE" : "PRIVATE SIGNAL"}
            </Text>
          </View>
          <View style={[styles.verticalRule, { backgroundColor: visual.text }]} />
          <View style={styles.mediumSignalPane}>
            <View style={styles.signalHead}>
              <Text style={[styles.label, { color: visual.muted }]}>SIGNAL SLOTS</Text>
            </View>
            <SignalSlotStrip uris={stripUris} visual={visual} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.small,
        compact && styles.smallCompact,
        { backgroundColor: visual.surface, borderColor: visual.border },
      ]}
    >
      <View style={styles.smallHead}>
        <Text style={[styles.smallKind, { color: visual.text }]}>
          {isEmpty ? "Waiting" : kind === "blink" ? "Blink" : "Beep"}
        </Text>
        <Text style={[styles.smallTime, { color: visual.muted }]}>{time}</Text>
      </View>
      <Rule color={visual.text} />
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.55}
        style={[styles.smallCode, { color: codeColor }]}
      >
        {safeCode}
      </Text>
      <LabelValue label="FROM" value={safeFrom} visual={visual} />
      <SignalSlotStrip compact uris={stripUris} visual={visual} />
      <View style={styles.smallFoot}>
        <Text style={[styles.label, { color: visual.muted }]}>NO.{safeIndex}</Text>
        <Text style={[styles.status, { color: isEmpty ? visual.muted : visual.accent }]}>{safeStatus}</Text>
      </View>
    </View>
  );
}

function Rule({ color }: { readonly color: string }) {
  return <View style={[styles.rule, { backgroundColor: color }]} />;
}

function LabelValue({
  label,
  value,
  visual,
}: {
  readonly label: string;
  readonly value: string;
  readonly visual: IdentityPackVisual;
}) {
  return (
    <View style={styles.labelValue}>
      <Text style={[styles.label, { color: visual.muted }]}>{label}</Text>
      <Text numberOfLines={1} style={[styles.labelValueText, { color: visual.text }]}>
        {value}
      </Text>
    </View>
  );
}

function SignalSlotStrip({
  uris,
  visual,
  compact = false,
}: {
  readonly uris: readonly string[];
  readonly visual: IdentityPackVisual;
  readonly compact?: boolean;
}) {
  return (
    <View style={[styles.slotStrip, compact && styles.slotStripCompact]}>
      {[0, 1, 2].map((index) => {
        const uri = uris[index];
        return (
          <View key={`slot-${index}-${uri ?? "empty"}`} style={[styles.slot, { borderColor: visual.text }]}>
            {uri ? (
              <Image source={{ uri }} style={styles.slotImage} resizeMode="cover" />
            ) : (
              <View style={[styles.emptySlot, { backgroundColor: visual.chip }]}>
                <View style={[styles.emptySlotLine, { backgroundColor: visual.muted }]} />
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}
