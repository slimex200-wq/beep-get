import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { ActionButton } from "@/components/ActionButton";
import { RefreshLineIcon, XLineIcon } from "@/components/MockupLineIcons";
import { colors, radius, spacing } from "@/design/tokens";
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
  const translateY = useRef(new Animated.Value(visible ? 0 : 16)).current;
  const opacity = useRef(new Animated.Value(visible ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: visible ? 0 : 16,
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
          styles.stage,
          { backgroundColor: palette.background, borderColor: palette.ruleStrong },
        ]}
      >
        <View style={styles.topRail}>
          <Text style={[styles.kicker, { color: palette.muted }]}>FULL SCREEN UPDATE</Text>
          {onDismiss && !busy ? (
            <ActionButton
              label="Later"
              variant="ghost"
              onPress={onDismiss}
              accessibilityLabel="Dismiss update reminder"
              icon={(iconColor) => <XLineIcon color={iconColor} />}
            />
          ) : null}
        </View>

        <View style={styles.center}>
          <View style={[styles.glyph, { backgroundColor: palette.card, borderColor: palette.ruleStrong }]}>
            <RefreshLineIcon color={palette.text} />
          </View>
          <Text style={[styles.title, { color: palette.text }]}>
            {busy ? "Applying update" : "Update ready to install"}
          </Text>
          <Text style={[styles.body, { color: palette.muted }]}>
            The app will restart into the new build.
          </Text>

          <View style={[styles.progressTrack, { backgroundColor: palette.rule }]}>
            <View
              style={[
                styles.progressFill,
                { backgroundColor: busy ? colors.greenDot : palette.primary },
                busy && styles.progressFillBusy,
              ]}
            />
          </View>

          <ActionButton
            label={restartLabel}
            variant="dark"
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
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 999,
  },
  stage: {
    flex: 1,
    backgroundColor: colors.paper,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: colors.ruleStrong,
    paddingTop: spacing[12],
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[8],
    overflow: "hidden",
  },
  topRail: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing[4],
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing[5],
    paddingBottom: spacing[12],
  },
  glyph: {
    width: 72,
    height: 72,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 36,
  },
  kicker: {
    ...type.tinyMono,
    maxWidth: 180,
    letterSpacing: 0,
  },
  title: {
    ...type.slipTitle,
    maxWidth: 300,
    color: colors.ink,
    textAlign: "center",
    fontSize: 25,
    lineHeight: 31,
    letterSpacing: 0,
  },
  body: {
    ...type.body,
    maxWidth: 270,
    textAlign: "center",
    fontSize: 13,
    lineHeight: 19,
    letterSpacing: 0,
  },
  progressTrack: {
    width: "100%",
    maxWidth: 280,
    height: 7,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    width: "62%",
    height: "100%",
    borderRadius: 4,
  },
  progressFillBusy: {
    width: "84%",
  },
});
