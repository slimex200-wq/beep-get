import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "@/design/tokens";
import { type } from "@/design/typography";
import { useAppPalette } from "@/design/appTheme";
import { getAvatarImageSource } from "@/lib/avatarSource";

export type CircuitFriend = {
  readonly id: string;
  readonly name: string;
  readonly avatarUri?: string;
  readonly status: "BEEP" | "BLINK" | "quiet";
};

type Props = {
  readonly friends: readonly CircuitFriend[];
  readonly capacity: number;
  readonly onInvite: () => void;
};

const statusColors: Record<CircuitFriend["status"], string> = {
  BEEP: "#A56AD8",
  BLINK: "#FF7FA3",
  quiet: "#93CFA0",
};

export function CloseCircuitMap({ friends, capacity, onInvite }: Props) {
  const palette = useAppPalette();

  return (
    <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.rule }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: palette.text }]}>Close Circuit</Text>
        <Text style={[styles.count, { color: palette.muted }]}>{friends.length}/{capacity}</Text>
      </View>
      <View style={styles.nodes}>
        {friends.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: palette.muted }]}>No close friends yet</Text>
          </View>
        ) : friends.slice(0, capacity).map((friend) => (
          <View key={friend.id} style={styles.node}>
            <View style={[styles.signalPin, { backgroundColor: statusColors[friend.status] }]} />
            <AvatarDot name={friend.name} avatarUri={friend.avatarUri} />
            <Text numberOfLines={1} style={[styles.nodeLabel, { color: palette.muted }]}>
              {friend.status}
            </Text>
          </View>
        ))}
        <Pressable
          accessibilityLabel="Invite Friend"
          accessibilityRole="button"
          onPress={onInvite}
          style={({ pressed }) => [
            styles.inviteNode,
            { backgroundColor: palette.chip, borderColor: palette.rule },
            pressed && styles.pressed,
          ]}
        >
          <Text style={[styles.invitePlus, { color: palette.text }]}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

function AvatarDot({ name, avatarUri }: { readonly name: string; readonly avatarUri?: string }) {
  const palette = useAppPalette();
  const avatarSource = getAvatarImageSource(avatarUri);

  return (
    <View style={[styles.avatar, { backgroundColor: palette.input, borderColor: palette.rule }]}>
      {avatarSource ? (
        <Image source={avatarSource} style={styles.avatarImage} resizeMode="cover" />
      ) : (
        <Text style={[styles.avatarText, { color: palette.text }]}>{name.slice(0, 1)}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing[4],
    padding: spacing[4],
    borderWidth: 1,
    borderRadius: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    ...type.metaValue,
    fontSize: 13,
  },
  count: {
    ...type.tinyMono,
  },
  nodes: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
  },
  node: {
    width: 48,
    alignItems: "center",
    gap: spacing[1],
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
  },
  emptyText: {
    ...type.bodyMuted,
  },
  signalPin: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  avatar: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderRadius: 19,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarText: {
    ...type.metaValue,
    fontSize: 11,
  },
  nodeLabel: {
    ...type.tinyMono,
    maxWidth: 48,
    fontSize: 7,
  },
  inviteNode: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: radius.pill,
  },
  invitePlus: {
    ...type.buttonMono,
    fontSize: 18,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ translateY: 1 }],
  },
});
