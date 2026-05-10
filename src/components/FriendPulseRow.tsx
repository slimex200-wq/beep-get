import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "@/design/tokens";
import { type } from "@/design/typography";
import { StatusDot } from "@/components/StatusDot";

type Props = {
  name: string;
  summary: string;
  quiet?: boolean;
};

export function FriendPulseRow({ name, summary, quiet = false }: Props) {
  return (
    <View style={styles.row}>
      <StatusDot size={7} color={quiet ? colors.faint : colors.red} />
      <View style={styles.textBlock}>
        <Text style={type.metaValue}>{name}</Text>
        <Text style={type.bodyMuted}>{summary}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: 9,
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  textBlock: {
    flex: 1,
    gap: spacing[1],
  },
});
