import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "@/design/tokens";
import { type } from "@/design/typography";
import type { SlipFriend } from "@/lib/slipUiModels";
import { ActionButton } from "@/components/ActionButton";
import { StatusDot } from "@/components/StatusDot";

type Props = {
  friend: SlipFriend;
  lastSignal?: string;
  onPress?: () => void;
  onSendBeep?: () => void;
  onSendBlink?: () => void;
  onPin?: () => void;
};

export function FriendCard({ friend, lastSignal, onPress, onSendBeep, onSendBlink, onPin }: Props) {
  return (
    <Pressable style={styles.card} onPress={onPress} disabled={!onPress}>
      {friend.isClose ? <StatusDot size={7} style={styles.dot} /> : null}
      <Text style={type.tinyMono}>NO.</Text>
      <Text style={type.codeSmall}>{friend.no}</Text>
      <Text style={type.metaValue}>{friend.name}</Text>
      <Text style={styles.relation}>{friend.relation}</Text>
      <View style={styles.signalBox}>
        <Text style={type.tinyMono}>LAST SIGNAL</Text>
        <Text style={type.bodyMuted}>{lastSignal ?? "quiet"}</Text>
      </View>
      <View style={styles.actions}>
        <ActionButton label="SEND BEEP" mono flex onPress={onSendBeep} />
        <ActionButton label="SEND BLINK" mono flex onPress={onSendBlink} />
      </View>
      <ActionButton label="PIN" mono variant="ghost" onPress={onPin} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    minHeight: 188,
    padding: spacing[5],
    borderRadius: radius.slipSmall,
    borderWidth: 1,
    borderColor: colors.ruleStrong,
    backgroundColor: colors.paperWarm,
    position: "relative",
    gap: spacing[2],
  },
  dot: {
    position: "absolute",
    top: spacing[4],
    right: spacing[4],
  },
  relation: {
    ...type.tinyMono,
    color: colors.redDeep,
    marginTop: spacing[1],
  },
  signalBox: {
    marginTop: spacing[3],
    gap: spacing[1],
    padding: spacing[3],
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radius.control,
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  actions: {
    flexDirection: "row",
    gap: spacing[3],
    marginTop: spacing[2],
  },
});
