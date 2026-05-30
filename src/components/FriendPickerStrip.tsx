import React from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "@/design/tokens";
import { type } from "@/design/typography";
import { useAppPalette } from "@/design/appTheme";

export type PickableFriend = {
  id: string;
  name: string;
  no: string;
  relation?: string;
  avatarUri?: string;
};

type Props = {
  friends: PickableFriend[];
  selectedId?: string | null;
  onSelect: (friend: PickableFriend) => void;
  onAddPress?: () => void;
};

export function FriendPickerStrip({ friends, selectedId, onSelect, onAddPress }: Props) {
  const palette = useAppPalette();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.strip}>
      <Pressable
        accessibilityLabel="Add friend"
        accessibilityRole="button"
        disabled={!onAddPress}
        onPress={onAddPress}
        style={({ pressed }) => [styles.item, pressed && styles.pressed]}
      >
        <View style={[styles.addCircle, { backgroundColor: palette.chip }]}>
          <Text style={[styles.addGlyph, { color: palette.text }]}>+</Text>
        </View>
        <Text style={[styles.name, { color: palette.text }]} numberOfLines={1}>
          New
        </Text>
      </Pressable>
      {friends.map((friend) => {
        const selected = friend.id === selectedId;
        return (
          <Pressable
            key={friend.id}
            accessibilityLabel={`Select ${friend.name}`}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onSelect(friend)}
            style={({ pressed }) => [styles.item, pressed && styles.pressed]}
          >
            <View style={[styles.avatar, { backgroundColor: palette.input }, selected && styles.avatarSelected]}>
              {friend.avatarUri ? (
                <Image source={{ uri: friend.avatarUri }} style={styles.avatarImage} resizeMode="cover" />
              ) : (
                <Text style={[styles.avatarText, { color: palette.text }, selected && styles.selectedText]}>{friend.name.slice(0, 1)}</Text>
              )}
            </View>
            <Text style={[styles.name, { color: palette.text }, selected && styles.activeName]} numberOfLines={1}>
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
    alignItems: "flex-start",
    gap: spacing[4],
    minHeight: 58,
    paddingTop: spacing[1],
    paddingBottom: spacing[2],
  },
  item: {
    width: 48,
    height: 54,
    alignItems: "center",
    justifyContent: "flex-start",
    gap: spacing[2],
  },
  addCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0EEE9",
  },
  addGlyph: {
    ...type.buttonMono,
    fontSize: 20,
    lineHeight: 22,
    color: colors.ink,
  },
  pressed: {
    transform: [{ translateY: 1 }],
    opacity: 0.88,
  },
  avatar: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    backgroundColor: colors.paperDeep,
    overflow: "hidden",
  },
  avatarSelected: {
    borderWidth: 2,
    borderColor: colors.red,
    backgroundColor: colors.redSoft,
  },
  avatarText: {
    ...type.metaValue,
    fontSize: 11,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  name: {
    ...type.tinyMono,
    maxWidth: 48,
    textAlign: "center",
    color: colors.ink,
  },
  selectedText: {
    color: colors.ink,
  },
  activeName: {
    color: colors.redDeep,
  },
  label: {
    ...type.tinyMono,
    color: colors.ink,
  },
});
