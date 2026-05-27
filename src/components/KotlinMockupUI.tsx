import React from "react";
import {
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";
import { colors, radius, spacing } from "@/design/tokens";
import { font, type } from "@/design/typography";
import { DEMO_BLINK_FRAME_DATA_URIS } from "@/lib/demoBlinkFrameData";

const beepyAvatar = require("../../assets/brand/beepy-handdrawn.png");

type HeaderAction = {
  label: string;
  onPress?: () => void;
};

type HeaderProps = {
  title: string;
  avatarLabel?: string;
  avatarSource?: ImageSourcePropType;
  actions?: HeaderAction[];
  centered?: boolean;
  showAvatar?: boolean;
};

export function KotlinHeader({
  title,
  avatarLabel = "B",
  avatarSource = beepyAvatar,
  actions = [{ label: "◐" }, { label: "◎" }, { label: "⚙" }],
  centered = false,
  showAvatar = true,
}: HeaderProps) {
  return (
    <View style={[styles.header, centered && styles.headerCentered]}>
      {showAvatar ? (
        <View style={[styles.headerLeft, centered && styles.headerSide]}>
          <Avatar label={avatarLabel} source={avatarSource} size={34} />
        </View>
      ) : null}
      <Text style={[styles.headerTitle, centered && styles.headerTitleCentered]}>{title}</Text>
      <View style={[styles.headerActions, centered && styles.headerSide]}>
        {actions.map((action) => (
          <IconButton key={action.label} label={action.label} onPress={action.onPress} />
        ))}
      </View>
    </View>
  );
}

export function Avatar({
  label,
  source,
  size = 42,
  style,
}: {
  label: string;
  source?: ImageSourcePropType;
  size?: number;
  style?: ViewStyle;
}) {
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }, style]}>
      {source ? (
        <Image source={source} style={styles.avatarImage} resizeMode="cover" />
      ) : (
        <Text style={styles.avatarLabel}>{label.slice(0, 2)}</Text>
      )}
    </View>
  );
}

export function IconButton({
  label,
  onPress,
  dark = false,
  size = 34,
}: {
  label: string;
  onPress?: () => void;
  dark?: boolean;
  size?: number;
}) {
  return (
    <Pressable
      accessibilityRole={onPress ? "button" : undefined}
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.iconButton,
        { width: size, height: size, borderRadius: size / 2 },
        dark && styles.iconButtonDark,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.iconText, dark && styles.iconTextDark]}>{label}</Text>
    </Pressable>
  );
}

export function MockupCard({
  children,
  style,
  soft = false,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  soft?: boolean;
}) {
  return <View style={[styles.card, soft && styles.cardSoft, style]}>{children}</View>;
}

export function MockupSection({
  label,
  hint,
}: {
  label: string;
  hint?: string;
}) {
  return (
    <View style={styles.sectionRow}>
      <Text style={styles.sectionLabel}>{label}</Text>
      {hint ? <Text style={styles.sectionHint}>{hint}</Text> : null}
    </View>
  );
}

export function StatusPill({ label, tone = "muted" }: { label: string; tone?: "muted" | "red" | "green" }) {
  return (
    <View style={[styles.statusPill, tone === "red" && styles.statusPillRed, tone === "green" && styles.statusPillGreen]}>
      <View style={[styles.statusDot, tone === "red" && styles.statusDotRed, tone === "green" && styles.statusDotGreen]} />
      <Text style={styles.statusPillText}>{label}</Text>
    </View>
  );
}

export function MiniFrameStrip({
  compact = false,
  frameUris,
}: {
  compact?: boolean;
  frameUris?: readonly string[] | null;
}) {
  const frames = (frameUris?.length ? frameUris : DEMO_BLINK_FRAME_DATA_URIS).slice(0, 3);

  return (
    <View style={[styles.frameStrip, compact && styles.frameStripCompact]}>
      {frames.map((uri, index) => (
        <View key={`${uri}-${index}`} style={[styles.frameThumb, compact && styles.frameThumbCompact]}>
          <Image source={{ uri }} style={styles.frameImage} resizeMode="cover" />
          <Text style={styles.frameIndex}>{index + 1}</Text>
        </View>
      ))}
      <View style={[styles.cameraChip, compact && styles.cameraChipCompact]}>
        <Text style={styles.cameraGlyph}>2s</Text>
      </View>
    </View>
  );
}

export function NameDot({ color = colors.red }: { color?: string }) {
  return <View style={[styles.nameDot, { backgroundColor: color }]} />;
}

const styles = StyleSheet.create({
  header: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
    paddingHorizontal: spacing[5],
    paddingTop: spacing[2],
  },
  headerCentered: {
    justifyContent: "space-between",
  },
  headerTitle: {
    flex: 1,
    fontFamily: font.sansBold,
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: 0,
    color: colors.ink,
  },
  headerTitleCentered: {
    textAlign: "center",
  },
  headerLeft: {
    alignItems: "flex-start",
    justifyContent: "center",
  },
  headerSide: {
    width: 104,
  },
  headerActions: {
    minWidth: 104,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: spacing[2],
  },
  avatar: {
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.ruleStrong,
    backgroundColor: colors.paperDeep,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarLabel: {
    ...type.metaValue,
    fontSize: 11,
  },
  iconButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.transparent,
  },
  iconButtonDark: {
    backgroundColor: colors.ink,
  },
  iconText: {
    fontFamily: font.sansBold,
    fontSize: 17,
    lineHeight: 20,
    color: colors.ink,
  },
  iconTextDark: {
    color: colors.paperWarm,
  },
  pressed: {
    opacity: 0.72,
    transform: [{ translateY: 1 }],
  },
  card: {
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radius.slipSmall,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  cardSoft: {
    backgroundColor: "#F7F4EF",
  },
  sectionRow: {
    minHeight: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing[4],
  },
  sectionLabel: {
    fontFamily: font.monoBold,
    fontSize: 8,
    lineHeight: 11,
    letterSpacing: 0,
    color: colors.muted,
    textTransform: "uppercase",
  },
  sectionHint: {
    fontFamily: font.monoBold,
    fontSize: 8,
    lineHeight: 11,
    letterSpacing: 0,
    color: colors.muted,
  },
  statusPill: {
    minHeight: 22,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
    paddingHorizontal: spacing[3],
    borderRadius: radius.pill,
    backgroundColor: "#F1EEE8",
  },
  statusPillRed: {
    backgroundColor: "#FFF1EE",
  },
  statusPillGreen: {
    backgroundColor: "#F1F8ED",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.muted2,
  },
  statusDotRed: {
    backgroundColor: colors.red,
  },
  statusDotGreen: {
    backgroundColor: colors.greenDot,
  },
  statusPillText: {
    fontFamily: font.sansBold,
    fontSize: 8,
    lineHeight: 10,
    color: colors.muted,
  },
  frameStrip: {
    flexDirection: "row",
    gap: spacing[2],
    alignItems: "center",
  },
  frameStripCompact: {
    gap: spacing[1],
  },
  frameThumb: {
    width: 58,
    height: 50,
    borderRadius: 7,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.rule,
    backgroundColor: colors.ink,
  },
  frameThumbCompact: {
    width: 48,
    height: 38,
  },
  frameImage: {
    width: "100%",
    height: "100%",
  },
  frameIndex: {
    position: "absolute",
    left: 4,
    bottom: 3,
    fontFamily: font.monoBold,
    fontSize: 7,
    color: colors.paperWarm,
  },
  cameraChip: {
    width: 52,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 7,
    backgroundColor: "#F0EEE9",
  },
  cameraChipCompact: {
    width: 42,
    height: 38,
  },
  cameraGlyph: {
    fontFamily: font.sansBold,
    fontSize: 14,
    color: colors.ink,
  },
  nameDot: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 9,
    height: 9,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
});
