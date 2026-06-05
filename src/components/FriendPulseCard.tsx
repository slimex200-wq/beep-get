import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { radius, spacing } from "@/design/tokens";
import { type } from "@/design/typography";
import { useAppPalette } from "@/design/appTheme";
import { getAvatarImageSource } from "@/lib/avatarSource";

export type FriendPulseItem = {
  readonly id: string;
  readonly name: string;
  readonly status: string;
  readonly code: string;
  readonly avatarUri?: string;
  readonly accent: string;
};

type Props = {
  readonly title: string;
  readonly items: readonly FriendPulseItem[];
};

export function FriendPulseCard({ title, items }: Props) {
  const palette = useAppPalette();

  return (
    <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.rule }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: palette.text }]}>{title}</Text>
        <Text style={[styles.hint, { color: palette.muted }]}>close only</Text>
      </View>
      {items.length === 0 ? (
        <Text style={[styles.emptyText, { color: palette.muted }]}>No close-friend pulses yet</Text>
      ) : items.slice(0, 3).map((item) => {
        const avatarSource = getAvatarImageSource(item.avatarUri);
        return (
          <View key={item.id} style={[styles.row, { borderTopColor: palette.rule }]}>
            <View style={[styles.avatar, { backgroundColor: palette.input }]}>
              {avatarSource ? (
                <Image source={avatarSource} style={styles.avatarImage} resizeMode="cover" />
              ) : (
                <Text style={[styles.avatarText, { color: palette.text }]}>{item.name.slice(0, 1)}</Text>
              )}
              <View style={[styles.dot, { backgroundColor: item.accent, borderColor: palette.card }]} />
            </View>
            <View style={styles.copy}>
              <Text style={[styles.name, { color: palette.text }]}>{item.name}</Text>
              <Text style={[styles.status, { color: palette.muted }]}>{item.status}</Text>
            </View>
            <Text style={[styles.code, { color: palette.text }]}>{item.code}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing[1],
    padding: spacing[4],
    borderWidth: 1,
    borderRadius: radius.slipSmall,
  },
  header: {
    minHeight: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing[3],
  },
  title: {
    ...type.metaValue,
    fontSize: 13,
  },
  hint: {
    ...type.tinyMono,
  },
  emptyText: {
    ...type.bodyMuted,
    paddingTop: spacing[2],
  },
  row: {
    minHeight: 43,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
    borderTopWidth: 1,
  },
  avatar: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 15,
  },
  avatarText: {
    ...type.metaValue,
    fontSize: 11,
  },
  dot: {
    position: "absolute",
    right: 0,
    top: 0,
    width: 7,
    height: 7,
    borderRadius: 4,
    borderWidth: 1,
  },
  copy: {
    flex: 1,
    gap: spacing[1],
  },
  name: {
    ...type.metaValue,
    fontSize: 12,
  },
  status: {
    ...type.bodyMuted,
  },
  code: {
    ...type.buttonMono,
    fontSize: 10,
  },
});
