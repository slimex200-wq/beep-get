import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "@/design/tokens";
import { type } from "@/design/typography";
import { useAppPalette } from "@/design/appTheme";
import { MiniFrameStrip } from "@/components/KotlinMockupUI";
import { getAvatarImageSource } from "@/lib/avatarSource";

type Props = {
  readonly sender: string;
  readonly time: string;
  readonly code: string;
  readonly meaning: string | null;
  readonly avatarUri?: string;
  readonly hasBlink?: boolean;
  readonly frameUris?: string[] | null;
  readonly doneFeedback: boolean;
  readonly onView: () => void;
  readonly onDone: () => void;
};

export function TodayIncomingCard({
  sender,
  time,
  code,
  meaning,
  avatarUri,
  hasBlink = false,
  frameUris,
  doneFeedback,
  onView,
  onDone,
}: Props) {
  const palette = useAppPalette();
  const avatarSource = getAvatarImageSource(avatarUri);
  const shouldShowFrames = hasBlink && Boolean(frameUris?.length);

  return (
    <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.rule }]}>
      <View style={[styles.incomingRow, { borderBottomColor: palette.rule }]}>
        <View style={styles.senderCell}>
          <View style={[styles.senderAvatar, { backgroundColor: palette.input }]}>
            {avatarSource ? <Image source={avatarSource} style={styles.senderAvatarImage} resizeMode="cover" /> : null}
            {!avatarSource ? <Text style={[styles.senderInitial, { color: palette.text }]}>{sender.slice(0, 1)}</Text> : null}
          </View>
          <Text numberOfLines={1} style={[styles.senderName, { color: palette.text }]}>
            {sender}
          </Text>
        </View>
        <Text numberOfLines={1} style={[styles.primaryCode, { color: palette.text }]}>
          {code}
        </Text>
        <Text style={[styles.senderTime, { color: palette.muted }]}>{time}</Text>
        <View style={[styles.newPill, { backgroundColor: palette.primary }]}>
          <Text style={[styles.newText, { color: palette.primaryText }]}>NEW</Text>
        </View>
      </View>
      {shouldShowFrames ? (
        <View style={[styles.frameStripWrap, { borderBottomColor: palette.rule }]}>
          <MiniFrameStrip compact frameUris={frameUris} />
        </View>
      ) : null}
      <View style={styles.replyRow}>
        <Pressable
          accessibilityLabel="Mark signal done"
          accessibilityRole="button"
          onPress={onDone}
          style={({ pressed }) => [
            styles.quickReply,
            { backgroundColor: palette.cardSoft, borderColor: palette.rule },
            doneFeedback && styles.quickReplyDone,
            pressed && styles.pressed,
          ]}
        >
          <Text style={[styles.quickReplyText, { color: palette.text }]}>{doneFeedback ? "DONE" : "OK"}</Text>
        </Pressable>
        <Text numberOfLines={1} style={[styles.secondaryCode, { color: palette.text }]}>
          {code}
        </Text>
        {meaning ? (
          <Text numberOfLines={1} style={[styles.meaningText, { color: palette.muted }]}>
            {meaning}
          </Text>
        ) : null}
        <Pressable
          accessibilityLabel="Open signal"
          accessibilityRole="button"
          onPress={onView}
          style={({ pressed }) => [styles.openButton, pressed && styles.pressed]}
        >
          <Text style={[styles.openText, { color: palette.primary }]}>열기</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 92,
    overflow: "hidden",
    borderWidth: 1,
    borderRadius: radius.slipSmall,
  },
  incomingRow: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
    paddingHorizontal: spacing[5],
    borderBottomWidth: 1,
  },
  senderCell: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
    minWidth: 0,
  },
  senderAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  senderAvatarImage: {
    width: "100%",
    height: "100%",
  },
  senderInitial: {
    ...type.metaValue,
    fontSize: 9,
  },
  senderName: {
    ...type.metaValue,
    flexShrink: 1,
    fontSize: 12,
  },
  senderTime: {
    ...type.tinyMono,
  },
  primaryCode: {
    ...type.codeSmall,
    width: 58,
    textAlign: "center",
    letterSpacing: 0,
  },
  newPill: {
    minHeight: 18,
    justifyContent: "center",
    paddingHorizontal: spacing[2],
    borderRadius: radius.pill,
  },
  newText: {
    ...type.tinyMono,
    fontSize: 7,
  },
  frameStripWrap: {
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
  },
  replyRow: {
    minHeight: 45,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
    paddingHorizontal: spacing[5],
  },
  quickReply: {
    minWidth: 44,
    minHeight: 26,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: radius.button,
  },
  quickReplyDone: {
    backgroundColor: colors.paper,
    borderColor: colors.paperLine,
  },
  quickReplyText: {
    ...type.buttonMono,
    fontSize: 10,
  },
  secondaryCode: {
    ...type.buttonMono,
    width: 52,
    textAlign: "center",
  },
  meaningText: {
    ...type.bodyMuted,
    flex: 1,
  },
  openButton: {
    minWidth: 42,
    minHeight: 26,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.button,
  },
  openText: {
    ...type.button,
    fontSize: 11,
  },
  pressed: {
    opacity: 0.72,
    transform: [{ translateY: 1 }],
  },
});
