import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MockupCard } from "@/components/KotlinMockupUI";
import { getPackVisual } from "@/components/WidgetSkinPackCard";
import { radius, spacing } from "@/design/tokens";
import { type } from "@/design/typography";
import { useAppPalette } from "@/design/appTheme";
import type { IdentityPack } from "@/design/identityPacks";

type RoomStyleCardProps = {
  readonly activePack: IdentityPack;
  readonly onPress: () => void;
};

export function RoomStyleCard({ activePack, onPress }: RoomStyleCardProps) {
  const palette = useAppPalette();
  const visual = getPackVisual(activePack);

  return (
    <Pressable
      accessibilityLabel="Open Skin Pack picker"
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}
    >
      <MockupCard style={styles.card}>
        <View style={[styles.preview, { backgroundColor: visual.surface, borderColor: visual.border }]}>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.6}
            style={[styles.previewCode, { color: visual.text }]}
          >
            {activePack.code}
          </Text>
          <View style={[styles.previewAccent, { backgroundColor: visual.accent }]} />
        </View>
        <View style={styles.copy}>
          <Text style={[styles.eyebrow, { color: palette.muted }]}>Room Style</Text>
          <Text numberOfLines={1} style={[styles.title, { color: palette.text }]}>
            {activePack.name}
          </Text>
          <Text numberOfLines={2} style={[type.bodyMuted, { color: palette.muted }]}>
            Skin, frame, and widget mood for the whole room.
          </Text>
        </View>
        <View style={[styles.actionPill, { borderColor: palette.rule }]}>
          <Text style={[styles.actionText, { color: palette.text }]}>Change Skin Pack</Text>
        </View>
      </MockupCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    marginHorizontal: spacing[5],
  },
  card: {
    minHeight: 92,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[4],
    padding: spacing[4],
    borderRadius: 14,
  },
  preview: {
    width: 72,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 13,
    overflow: "hidden",
  },
  previewCode: {
    ...type.codeSmall,
    fontSize: 20,
    lineHeight: 24,
  },
  previewAccent: {
    position: "absolute",
    right: 8,
    top: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  copy: {
    flex: 1,
    gap: spacing[1],
  },
  eyebrow: {
    ...type.tinyMono,
  },
  title: {
    ...type.metaValue,
    fontSize: 14,
  },
  actionPill: {
    minHeight: 30,
    justifyContent: "center",
    paddingHorizontal: spacing[3],
    borderWidth: 1,
    borderRadius: radius.pill,
  },
  actionText: {
    ...type.tinyMono,
    fontSize: 8,
  },
  pressed: {
    opacity: 0.7,
  },
});
