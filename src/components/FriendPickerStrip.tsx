import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "@/design/tokens";
import { type } from "@/design/typography";
import { NameDot } from "@/components/KotlinMockupUI";

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
      <Pressable style={styles.addCard}>
        <Text style={styles.addText}>+</Text>
        <Text style={styles.label}>New</Text>
      </Pressable>
      {friends.map((friend) => {
        const selected = friend.id === selectedId;
        return (
          <Pressable
            key={friend.id}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onSelect(friend)}
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
          >
            <View style={[styles.avatar, selected && styles.avatarSelected]}>
              <Text style={[styles.avatarText, selected && styles.selectedText]}>{friend.name.slice(0, 1)}</Text>
              <NameDot color={selected ? colors.greenDot : colors.muted2} />
            </View>
            <Text style={[styles.name, selected && styles.activeName]} numberOfLines={1}>
              {friend.name}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  strip: {
    gap: spacing[4],
    paddingVertical: spacing[1],
  },
  addCard: {
    width: 48,
    minHeight: 58,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing[1],
  },
  addText: {
    width: 34,
    height: 34,
    borderRadius: 17,
    textAlign: "center",
    textAlignVertical: "center",
    overflow: "hidden",
    backgroundColor: "#F0EEE9",
    ...type.codeSmall,
    fontSize: 20,
    lineHeight: 30,
  },
  card: {
    width: 48,
    minHeight: 58,
    alignItems: "center",
    gap: spacing[1],
  },
  pressed: {
    transform: [{ translateY: 1 }],
    opacity: 0.88,
  },
  avatar: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    backgroundColor: colors.paperDeep,
  },
  avatarSelected: {
    borderWidth: 2,
    borderColor: colors.ink,
  },
  avatarText: {
    ...type.metaValue,
    fontSize: 11,
  },
  name: {
    ...type.tinyMono,
    maxWidth: 48,
    textAlign: "center",
  },
  selectedText: {
    color: colors.ink,
  },
  activeName: {
    color: colors.ink,
  },
  label: {
    ...type.tinyMono,
    color: colors.ink,
  },
});
