import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
} from "react-native";
import { Avatar, MockupCard } from "@/components/KotlinMockupUI";
import { radius, spacing } from "@/design/tokens";
import { type } from "@/design/typography";
import { useAppPalette } from "@/design/appTheme";

type PhotoAvatarCardProps = {
  readonly avatarLabel: string;
  readonly avatarSource?: ImageSourcePropType;
  readonly displayName: string;
  readonly handle: string;
  readonly activePackName: string;
  readonly onPress: () => void;
};

export function PhotoAvatarCard({
  avatarLabel,
  avatarSource,
  displayName,
  handle,
  activePackName,
  onPress,
}: PhotoAvatarCardProps) {
  const palette = useAppPalette();

  return (
    <Pressable
      accessibilityLabel="Decorate Photo Avatar"
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}
    >
      <MockupCard style={styles.card}>
        <View style={[styles.avatarStage, { backgroundColor: palette.input, borderColor: palette.rule }]}>
          <Avatar label={avatarLabel} source={avatarSource} size={72} />
          <View style={[styles.photoDot, { backgroundColor: palette.primary }]} />
        </View>
        <View style={styles.copy}>
          <Text style={[styles.eyebrow, { color: palette.muted }]}>Photo Avatar</Text>
          <Text numberOfLines={1} style={[styles.title, { color: palette.text }]}>
            {displayName}
          </Text>
          <Text numberOfLines={2} style={[type.bodyMuted, { color: palette.muted }]}>
            {handle ? `@${handle}` : "Use uploaded photos as the face of your Beep room."}
          </Text>
          <View style={styles.metaRow}>
            <View style={[styles.metaPill, { backgroundColor: palette.chip }]}>
              <Text numberOfLines={1} style={[styles.metaText, { color: palette.text }]}>
                {activePackName}
              </Text>
            </View>
            <View style={[styles.actionPill, { backgroundColor: palette.primary }]}>
              <Text style={[styles.actionText, { color: palette.primaryText }]}>Decorate Photo</Text>
            </View>
          </View>
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
    minHeight: 128,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[4],
    padding: spacing[4],
    borderRadius: 14,
  },
  avatarStage: {
    width: 92,
    height: 104,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 14,
  },
  photoDot: {
    position: "absolute",
    right: 12,
    top: 12,
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  copy: {
    flex: 1,
    gap: spacing[2],
  },
  eyebrow: {
    ...type.tinyMono,
  },
  title: {
    ...type.metaValue,
    fontSize: 17,
    lineHeight: 21,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing[2],
    paddingTop: spacing[2],
  },
  metaPill: {
    maxWidth: 116,
    minHeight: 28,
    justifyContent: "center",
    paddingHorizontal: spacing[3],
    borderRadius: radius.pill,
  },
  metaText: {
    ...type.tinyMono,
    fontSize: 8,
  },
  actionPill: {
    minHeight: 28,
    justifyContent: "center",
    paddingHorizontal: spacing[3],
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
