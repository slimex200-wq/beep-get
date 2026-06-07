import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MockupCard } from "@/components/KotlinMockupUI";
import { radius, spacing } from "@/design/tokens";
import { type } from "@/design/typography";
import { useAppPalette } from "@/design/appTheme";

type MyRoomToolsCardProps = {
  readonly replySlots: readonly string[];
  readonly onEditReplies: () => void;
};

export function MyRoomToolsCard({ replySlots, onEditReplies }: MyRoomToolsCardProps) {
  const palette = useAppPalette();

  return (
    <MockupCard style={styles.card}>
      <View style={styles.header}>
        <View style={styles.copy}>
          <Text style={[styles.eyebrow, { color: palette.muted }]}>Room Tools</Text>
          <Text style={[styles.title, { color: palette.text }]}>Widget Quick Replies</Text>
        </View>
        <Pressable
          accessibilityLabel="Configure widget quick replies"
          accessibilityRole="button"
          onPress={onEditReplies}
          style={({ pressed }) => [
            styles.editPill,
            { backgroundColor: palette.primary },
            pressed && styles.pressed,
          ]}
        >
          <Text style={[styles.editText, { color: palette.primaryText }]}>Edit Replies</Text>
        </Pressable>
      </View>
      <View style={styles.replyGrid}>
        {replySlots.map((slot, index) => (
          <View
            key={`${slot}-${index}`}
            style={[styles.replySlot, { borderColor: palette.rule, backgroundColor: palette.input }]}
          >
            <Text numberOfLines={1} style={[styles.replyText, { color: palette.text }]}>
              {slot}
            </Text>
          </View>
        ))}
      </View>
    </MockupCard>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 116,
    gap: spacing[4],
    marginHorizontal: spacing[5],
    padding: spacing[4],
    borderRadius: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing[4],
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
  editPill: {
    minHeight: 30,
    justifyContent: "center",
    paddingHorizontal: spacing[3],
    borderRadius: radius.pill,
  },
  editText: {
    ...type.tinyMono,
    fontSize: 8,
  },
  replyGrid: {
    flexDirection: "row",
    gap: spacing[3],
  },
  replySlot: {
    flex: 1,
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing[2],
    borderWidth: 1,
    borderRadius: radius.control,
  },
  replyText: {
    ...type.button,
  },
  pressed: {
    opacity: 0.7,
  },
});
