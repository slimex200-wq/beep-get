import React from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "@/design/tokens";
import { font, type } from "@/design/typography";
import { getAvatarImageSource } from "@/lib/avatarSource";
import type { PickableFriend } from "@/components/FriendPickerStrip";

export type SendMockupMode = "beep" | "blink";

export function SendRecipientStrip({
  friends,
  selectedId,
  onSelect,
  onAddFriend,
}: {
  readonly friends: readonly PickableFriend[];
  readonly selectedId: string | null;
  readonly onSelect: (friend: PickableFriend) => void;
  readonly onAddFriend: () => void;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.peopleRow}>
      {friends.map((friend) => {
        const selected = friend.id === selectedId;
        const avatarSource = getAvatarImageSource(friend.avatarUri);
        return (
          <Pressable
            key={friend.id}
            accessibilityLabel={`Select ${friend.name}`}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onSelect(friend)}
            style={({ pressed }) => [styles.person, pressed && styles.pressed]}
          >
            <View style={[styles.avatar, selected && styles.avatarSelected]}>
              {avatarSource ? (
                <Image source={avatarSource} resizeMode="cover" style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>{friend.name.slice(0, 1)}</Text>
              )}
            </View>
            <Text numberOfLines={1} style={[styles.personName, selected && styles.personNameActive]}>
              {friend.name}
            </Text>
          </Pressable>
        );
      })}
      <Pressable accessibilityLabel="Add friend" accessibilityRole="button" onPress={onAddFriend} style={styles.addPerson}>
        <Text style={styles.addGlyph}>+</Text>
      </Pressable>
    </ScrollView>
  );
}

export function SendModeToggle({
  mode,
  onSelectMode,
}: {
  readonly mode: SendMockupMode;
  readonly onSelectMode: (mode: SendMockupMode) => void;
}) {
  return (
    <View style={styles.modeToggle}>
      <Pressable accessibilityLabel="Choose Beep" onPress={() => onSelectMode("beep")} style={[styles.modeOption, mode === "beep" && styles.modeOptionActive]}>
        <Text style={[styles.modeText, mode === "beep" && styles.modeTextActive]}>BEEP</Text>
      </Pressable>
      <Pressable accessibilityLabel="Choose Blink" onPress={() => onSelectMode("blink")} style={[styles.modeOption, mode === "blink" && styles.modeOptionActive]}>
        <Text style={[styles.modeText, mode === "blink" && styles.modeTextActive]}>BLINK</Text>
      </Pressable>
    </View>
  );
}

export function SendMockupSlotGrid({
  slots,
  selected,
  onSelectSlot,
}: {
  readonly slots: readonly string[];
  readonly selected: string;
  readonly onSelectSlot: (slot: string) => void;
}) {
  return (
    <View style={styles.slotGrid}>
      {slots.slice(0, 8).map((slot) => {
        const active = selected === slot;
        return (
          <Pressable key={slot} accessibilityRole="button" onPress={() => onSelectSlot(slot)} style={[styles.slotButton, active && styles.slotButtonActive]}>
            <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.slotText, active && styles.slotTextActive]}>
              {slot}
            </Text>
          </Pressable>
        );
      })}
      <View style={[styles.slotButton, styles.slotButtonEmpty]}>
        <Text style={styles.slotPlus}>+</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  peopleRow: { alignItems: "flex-start", gap: spacing[5], minHeight: 64, paddingVertical: spacing[1] },
  person: { width: 46, alignItems: "center", gap: spacing[2] },
  avatar: { width: 38, height: 38, alignItems: "center", justifyContent: "center", overflow: "hidden", borderRadius: radius.pill, backgroundColor: colors.paperDeep },
  avatarSelected: { borderWidth: 2, borderColor: colors.lavender },
  avatarImage: { width: "100%", height: "100%" },
  avatarText: { ...type.metaValue, color: colors.ink },
  personName: { fontFamily: font.sansSemiBold, fontSize: 10, lineHeight: 13, color: colors.ink, maxWidth: 48, textAlign: "center" },
  personNameActive: { color: colors.lavender },
  addPerson: { width: 38, height: 38, alignItems: "center", justifyContent: "center", borderRadius: radius.pill, borderWidth: 1, borderColor: "rgba(10,10,10,0.16)", backgroundColor: colors.ivory },
  addGlyph: { fontFamily: font.sans, fontSize: 25, lineHeight: 27, color: colors.ink },
  modeToggle: { flexDirection: "row", gap: spacing[2], padding: spacing[2], borderWidth: 1, borderColor: "rgba(10,10,10,0.14)", borderRadius: 9, backgroundColor: "#F5EFE8" },
  modeOption: { flex: 1, minHeight: 33, alignItems: "center", justifyContent: "center", borderRadius: 7 },
  modeOptionActive: { backgroundColor: colors.lavender },
  modeText: { ...type.buttonMono, fontSize: 10, color: colors.ink },
  modeTextActive: { color: colors.white },
  slotGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing[3] },
  slotButton: { width: "30.8%", minHeight: 39, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(10,10,10,0.14)", borderRadius: radius.button, backgroundColor: "#FFFDF9", paddingHorizontal: spacing[2] },
  slotButtonActive: { borderColor: colors.lavender, backgroundColor: colors.lavender },
  slotButtonEmpty: { backgroundColor: "#F8F2EC" },
  slotText: { ...type.buttonMono, fontSize: 10, lineHeight: 13, color: colors.ink, maxWidth: "100%" },
  slotTextActive: { color: colors.white },
  slotPlus: { fontFamily: font.sans, fontSize: 22, lineHeight: 23, color: colors.faint },
  pressed: { opacity: 0.82, transform: [{ translateY: 1 }] },
});
