import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { ActionButton } from "@/components/ActionButton";
import { RefreshLineIcon, XLineIcon } from "@/components/MockupLineIcons";
import { colors, radius, shadow, spacing } from "@/design/tokens";
import { type } from "@/design/typography";
import { useAppPalette } from "@/design/appTheme";

interface Props {
  readonly visible: boolean;
  readonly onReload: () => void;
  readonly onDismiss?: () => void;
  readonly busy?: boolean;
}

export function UpdateBannerSlip({ visible, onReload, onDismiss, busy }: Props) {
  const palette = useAppPalette();
  const translateY = useRef(new Animated.Value(visible ? 0 : -28)).current;
  const opacity = useRef(new Animated.Value(visible ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: visible ? 0 : -28,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: visible ? 1 : 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible, translateY, opacity]);

  if (!visible) {
    return null;
  }

  const restartLabel = busy ? "Restarting" : "Restart";
  const restartAccessibilityLabel = busy ? "Restarting update" : "Restart to apply update";
  const handleReload = () => {
    if (busy) return;
    onReload();
  };

  return (
    <Animated.View style={[styles.wrap, { transform: [{ translateY }], opacity }]}>
      <View
        accessibilityRole="alert"
        style={[
          styles.slip,
          { backgroundColor: palette.card, borderColor: palette.ruleStrong },
        ]}
      >
        <View style={styles.kickerRow}>
          <View style={[styles.dot, { backgroundColor: colors.greenDot }]} />
          <Text style={[styles.kicker, { color: palette.text }]}>UPDATE READY</Text>
          <View style={[styles.kickerRule, { backgroundColor: palette.rule }]} />
          <Text style={[styles.kicker, { color: palette.text }]}>OTA</Text>
        </View>

        <Text style={[styles.title, { color: palette.text }]}>New build is ready</Text>
        <Text style={[styles.body, { color: palette.muted }]}>
          A fresher Beep Get build is ready. Restart to apply it.
        </Text>

        <View style={[styles.rule, { backgroundColor: palette.rule }]} />

        <View style={styles.actionRow}>
          {onDismiss && !busy ? (
            <ActionButton
              label="Later"
              variant="ghost"
              flex
              onPress={onDismiss}
              accessibilityLabel="Dismiss update reminder"
              icon={(iconColor) => <XLineIcon color={iconColor} />}
            />
          ) : null}
          <ActionButton
            label={restartLabel}
            variant="dark"
            flex
            onPress={handleReload}
            disabled={Boolean(busy)}
            accessibilityLabel={restartAccessibilityLabel}
            icon={(iconColor) => <RefreshLineIcon color={iconColor} />}
          />
        </View>
      </View>
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
    padding: spacing[5],
    overflow: "hidden",
    ...shadow.slip,
  },
  kickerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
    marginBottom: spacing[4],
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  kicker: {
    ...type.tinyMono,
    color: colors.ink,
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  kickerRule: {
    flex: 1,
    height: 1,
    backgroundColor: colors.rule,
  },
  title: {
    ...type.slipTitle,
    color: colors.ink,
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: 0,
  },
  body: {
    ...type.body,
    marginTop: spacing[1],
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: 0,
  },
  rule: {
    marginTop: spacing[5],
    height: 1,
  },
  actionRow: {
    marginTop: spacing[4],
    flexDirection: "row",
    gap: spacing[3],
  },
});
