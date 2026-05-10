import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "@/design/tokens";
import { type } from "@/design/typography";
import { ActionButton } from "@/components/ActionButton";
import { StatusDot } from "@/components/StatusDot";

type Props = {
  beepId: string;
  nickname?: string;
  onShare?: () => void;
};

export function MyBeepIdSlip({ beepId, nickname = "ME", onShare }: Props) {
  return (
    <View style={styles.slip}>
      <View style={styles.topLine}>
        <Text style={type.tinyMono}>MY BEEP ID</Text>
        <StatusDot size={7} color={colors.red} />
      </View>
      <Text style={styles.beepId}>{beepId}</Text>
      <Text style={type.bodyMuted}>Share this slip with close friends. Invites stay private, not public-feed based.</Text>
      <View style={styles.metaRow}>
        <Text style={type.tinyMono}>OWNER</Text>
        <Text style={type.metaValue}>{nickname}</Text>
      </View>
      <ActionButton label="SHARE ID" variant="dark" mono onPress={onShare} disabled={!onShare} />
    </View>
  );
}

const styles = StyleSheet.create({
  slip: {
    gap: spacing[3],
    padding: spacing[5],
    borderWidth: 1,
    borderColor: colors.ruleStrong,
    borderRadius: radius.slipSmall,
    backgroundColor: colors.paperWarm,
  },
  topLine: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  beepId: {
    ...type.codeMedium,
    textAlign: "left",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing[2],
    borderTopWidth: 1,
    borderTopColor: colors.rule,
  },
});
