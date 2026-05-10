import React from "react";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { colors, radius, spacing } from "@/design/tokens";
import { type } from "@/design/typography";

export type PickableFriend = {
  id: string;
  name: string;
  no: string;
  relation?: string;
};

type Props = {
  friends: PickableFriend[];
  selectedId?: string | null;
  onSelect: (friend: PickableFriend) => void;
};

export function FriendPickerStrip({ friends, selectedId, onSelect }: Props) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.strip}>
      {friends.map((friend) => {
        const selected = friend.id === selectedId;
        return (
          <Pressable
            key={friend.id}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onSelect(friend)}
            style={({ pressed }) => [styles.card, selected && styles.cardSelected, pressed && styles.pressed]}
          >
            <Text style={[styles.no, selected && styles.selectedText]}>NO {friend.no}</Text>
            <Text style={[styles.name, selected && styles.selectedText]} numberOfLines={1}>
              {friend.name}
            </Text>
            {friend.relation ? (
              <Text style={[styles.relation, selected && styles.selectedMuted]} numberOfLines={1}>
                {friend.relation}
              </Text>
            ) : null}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  strip: {
    gap: spacing[3],
    paddingVertical: spacing[1],
  },
  card: {
    width: 112,
    minHeight: 64,
    justifyContent: "center",
    gap: spacing[1],
    padding: spacing[4],
    borderRadius: radius.control,
    borderWidth: 1,
    borderColor: colors.ruleStrong,
    backgroundColor: colors.paperWarm,
  },
  cardSelected: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  pressed: {
    transform: [{ translateY: 1 }],
    opacity: 0.88,
  },
  no: {
    ...type.tinyMono,
  },
  name: {
    ...type.metaValue,
  },
  relation: {
    ...type.tinyMono,
    color: colors.redDeep,
  },
  selectedText: {
    color: colors.paperWarm,
  },
  selectedMuted: {
    color: colors.faint,
  },
});
