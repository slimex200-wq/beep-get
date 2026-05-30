import React, { useMemo } from "react";
import { ScrollView, StyleSheet, ViewStyle } from "react-native";
import { spacing } from "@/design/tokens";
import { SignalSlotChip } from "@/components/SignalSlotChip";

export type SignalSlotRailProps = {
  slots: string[];
  selected?: string;
  onSelect: (slot: string) => void;
  disabled?: boolean;
  confirmedSlot?: string | null;
  compact?: boolean;
  style?: ViewStyle;
};

export function SignalSlotRail({ slots, selected, onSelect, disabled = false, confirmedSlot = null, compact = false, style }: SignalSlotRailProps) {
  const uniqueSlots = useMemo(
    () => Array.from(new Set(slots.map((slot) => slot.trim()).filter(Boolean))).slice(0, 8),
    [slots]
  );

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.rail, compact && styles.compactRail, style]}
      keyboardShouldPersistTaps="handled"
    >
      {uniqueSlots.map((slot) => (
        <SignalSlotChip
          key={slot}
          label={slot}
          selected={selected === slot}
          confirmed={confirmedSlot === slot}
          disabled={disabled}
          compact={compact}
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
  compactRail: {
    gap: spacing[5],
    paddingTop: spacing[1],
    paddingBottom: spacing[2],
  },
});
