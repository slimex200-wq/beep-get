import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { colors, radius, spacing } from "@/design/tokens";
import { type } from "@/design/typography";
import { useAppPalette } from "@/design/appTheme";

interface Props {
  visible: boolean;
  onReload: () => void;
  onDismiss?: () => void;
  busy?: boolean;
}

const PERFORATION_DOT_COUNT = 18;

export function UpdateBannerSlip({ visible, onReload, onDismiss, busy }: Props) {
  const palette = useAppPalette();
  const translateY = useRef(new Animated.Value(-160)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: visible ? 0 : -160,
        duration: 340,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: visible ? 1 : 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible, translateY, opacity]);

  if (!visible) {
    // After exit animation we keep the node mounted briefly; transform handles the hide.
  }

  return (
    <Animated.View
      pointerEvents={visible ? "auto" : "none"}
      style={[styles.wrap, { transform: [{ translateY }], opacity }]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="새 버전 적용"
        onPress={onReload}
        style={({ pressed }) => [
          styles.slip,
          { backgroundColor: palette.card, borderColor: palette.ruleStrong },
          pressed && [styles.slipPressed, { backgroundColor: palette.cardSoft }],
        ]}
      >
        <View style={styles.kickerRow}>
          <View style={styles.dot} />
          <Text style={[styles.kicker, { color: palette.text }]}>SYSTEM PAGE</Text>
          <View style={[styles.kickerRule, { backgroundColor: palette.rule }]} />
          <Text style={[styles.kicker, { color: palette.text }]}>OTA</Text>
        </View>

        <View style={styles.titleRow}>
          <View style={styles.titleBlock}>
            <Text style={[styles.titleTop, { color: palette.text }]}>NEW VERSION</Text>
            <Text style={[styles.titleBottom, { color: palette.muted }]}>READY TO APPLY</Text>
          </View>
          <View style={styles.glyphCol}>
            <Text style={styles.glyph}>{busy ? "···" : "↻"}</Text>
          </View>
        </View>

        <View style={[styles.rule, { borderBottomColor: palette.ruleStrong }]} />

        <View style={styles.footerRow}>
          <Text style={[styles.footerMono, { color: palette.text }]}>{busy ? "RELOADING" : "TAP TO REFRESH"}</Text>
          {onDismiss && !busy ? <View style={styles.dismissPlaceholder} /> : null}
        </View>

        <View style={styles.perforation}>
          {Array.from({ length: PERFORATION_DOT_COUNT }).map((_, index) => (
            <View key={index} style={styles.perforationDot} />
          ))}
        </View>
      </Pressable>
      {onDismiss && !busy ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="나중에 적용"
          onPress={onDismiss}
          hitSlop={8}
          style={styles.dismissOverlay}
        >
          <Text style={[styles.dismissMono, { color: palette.muted }]}>LATER</Text>
        </Pressable>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    top: spacing[12],
    left: spacing[5],
    right: spacing[5],
    zIndex: 999,
  },
  slip: {
    backgroundColor: colors.paper,
    borderRadius: radius.slip,
    borderWidth: 1,
    borderColor: colors.ruleStrong,
    paddingHorizontal: spacing[6],
    paddingTop: spacing[5],
    paddingBottom: spacing[8],
    overflow: "hidden",
    shadowColor: colors.ink,
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  slipPressed: {
    backgroundColor: colors.paperDeep,
    transform: [{ scale: 0.997 }],
  },
  kickerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
    marginBottom: spacing[3],
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.red,
  },
  kicker: {
    ...type.tinyMono,
    color: colors.ink,
    letterSpacing: 1.1,
  },
  kickerRule: {
    flex: 1,
    height: 1,
    backgroundColor: colors.rule,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing[4],
  },
  titleBlock: {
    flex: 1,
    gap: spacing[1],
  },
  titleTop: {
    fontFamily: type.codeHero.fontFamily,
    color: colors.ink,
    fontSize: 22,
    lineHeight: 26,
    letterSpacing: 0.4,
    fontWeight: "900",
  },
  titleBottom: {
    fontFamily: type.codeHero.fontFamily,
    color: colors.muted,
    fontSize: 18,
    lineHeight: 22,
    letterSpacing: 0.4,
    fontWeight: "800",
  },
  glyphCol: {
    minWidth: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  glyph: {
    ...type.codeHero,
    fontSize: 30,
    lineHeight: 32,
    color: colors.red,
  },
  rule: {
    marginTop: spacing[5],
    height: 1,
    borderBottomWidth: 1,
    borderStyle: "dashed",
    borderBottomColor: colors.ruleStrong,
  },
  footerRow: {
    marginTop: spacing[4],
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  footerMono: {
    ...type.tinyMono,
    color: colors.ink,
    letterSpacing: 1.3,
  },
  dismissMono: {
    ...type.tinyMono,
    color: colors.muted,
    letterSpacing: 1.3,
  },
  dismissPlaceholder: {
    width: 36,
    height: 14,
  },
  dismissOverlay: {
    position: "absolute",
    right: spacing[6],
    bottom: spacing[7],
    zIndex: 1,
  },
  perforation: {
    position: "absolute",
    left: spacing[3],
    right: spacing[3],
    bottom: -5,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  perforationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.stage,
  },
});
