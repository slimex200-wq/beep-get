import React, { useMemo } from "react";
import { ScrollView, StyleSheet, ViewStyle } from "react-native";
import { spacing } from "@/design/tokens";
import { SignalSlotChip } from "@/components/SignalSlotChip";

export type SignalSlotRailProps = {
  slots: string[];
  selected?: string;
  onSelect: (slot: string) => void;
  disabled?: boolean;
  style?: ViewStyle;
};

export function SignalSlotRail({ slots, selected, onSelect, disabled = false, style }: SignalSlotRailProps) {
  const uniqueSlots = useMemo(
    () => Array.from(new Set(slots.map((slot) => slot.trim()).filter(Boolean))).slice(0, 8),
    [slots]
  );

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.rail, style]}
      keyboardShouldPersistTaps="handled"
    >
      {uniqueSlots.map((slot) => (
        <SignalSlotChip
          key={slot}
          label={slot}
          selected={selected === slot}
          disabled={disabled}
          onPress={() => onSelect(slot)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  rail: {
    flexDirection: "row",
    gap: spacing[3],
    paddingVertical: spacing[1],
  },
});
