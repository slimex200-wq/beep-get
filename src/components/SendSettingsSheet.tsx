import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { CameraLineIcon, SendPlaneIcon } from "@/components/MockupLineIcons";
import { useAppPalette } from "@/design/appTheme";
import { colors, spacing } from "@/design/tokens";
import { type } from "@/design/typography";

type Props = {
  readonly visible: boolean;
  readonly blinkFrameCount: number;
  readonly onClose: () => void;
  readonly onClearDraft: () => void;
};

export function SendSettingsSheet({
  visible,
  blinkFrameCount,
  onClose,
  onClearDraft,
}: Props) {
  const palette = useAppPalette();
  if (!visible) return null;

  return (
    <View style={styles.sheetOverlay}>
      <Pressable
        accessibilityLabel="Close Send settings"
        onPress={onClose}
        style={styles.sheetBackdrop}
      />
      <View style={[styles.sheet, { backgroundColor: palette.background }]}>
        <View style={styles.sheetHeader}>
          <Text style={[styles.sheetTitle, { color: palette.text }]}>Send Settings</Text>
          <Pressable
            accessibilityRole="button"
            onPress={onClose}
            style={[styles.sheetClose, { backgroundColor: palette.chip }]}
          >
            <Text style={[styles.sheetCloseText, { color: palette.text }]}>Close</Text>
          </Pressable>
        </View>

        <View style={[styles.sheetRow, { backgroundColor: palette.card, borderColor: palette.rule }]}>
          <View style={[styles.sheetIconCircle, { backgroundColor: palette.chip }]}>
            <SendPlaneIcon color={palette.text} />
          </View>
          <View style={styles.sheetCopy}>
            <Text style={[styles.sheetRowTitle, { color: palette.text }]}>Default Send</Text>
            <Text style={[styles.sheetRowSub, { color: palette.muted }]}>
              Beep sends code. Blink sends the code with a 2s video.
            </Text>
          </View>
        </View>

        <View style={[styles.sheetRow, { backgroundColor: palette.card, borderColor: palette.rule }]}>
          <View style={[styles.sheetIconCircle, { backgroundColor: palette.chip }]}>
            <CameraLineIcon color={palette.text} />
          </View>
          <View style={styles.sheetCopy}>
            <Text style={[styles.sheetRowTitle, { color: palette.text }]}>Blink Draft Frames</Text>
            <Text style={[styles.sheetRowSub, { color: palette.muted }]}>
              {blinkFrameCount} extracted from this 2s Blink
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={onClearDraft}
            style={[styles.smallPill, { backgroundColor: palette.primary }]}
          >
            <Text style={[styles.smallPillText, { color: palette.primaryText }]}>Clear</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sheetOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.48)",
    zIndex: 10000,
    elevation: 10000,
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    gap: spacing[3],
    padding: spacing[5],
    paddingBottom: 88,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    zIndex: 10001,
    elevation: 10001,
  },
  sheetHeader: {
    minHeight: 36,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing[4],
  },
  sheetTitle: {
    ...type.slipTitle,
    fontSize: 18,
  },
  sheetClose: {
    minHeight: 30,
    justifyContent: "center",
    paddingHorizontal: spacing[4],
    borderRadius: 10,
  },
  sheetCloseText: {
    ...type.tinyMono,
  },
  sheetRow: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[4],
    padding: spacing[4],
    borderWidth: 1,
    borderRadius: 12,
  },
  sheetIconCircle: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 21,
  },
  sheetCopy: {
    flex: 1,
    gap: spacing[1],
  },
  sheetRowTitle: {
    ...type.metaValue,
    fontSize: 12,
  },
  sheetRowSub: {
    ...type.bodyMuted,
  },
  smallPill: {
    minHeight: 30,
    justifyContent: "center",
    paddingHorizontal: spacing[4],
    borderRadius: 10,
  },
  smallPillText: {
    ...type.tinyMono,
    color: colors.white,
  },
});
