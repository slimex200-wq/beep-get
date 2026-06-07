import React from "react";
import { Animated, Pressable, Text } from "react-native";
import { secondaryActions } from "@/components/liquidTabBar/model";
import { liquidTabStyles as styles } from "@/components/liquidTabBar/styles";
import type { SecondaryAction } from "@/components/liquidTabBar/types";

type Props = {
  readonly expanded: boolean;
  readonly progress: Animated.Value;
  readonly onActionPress: (action: SecondaryAction) => void;
};

export function SecondaryActionRail({
  expanded,
  progress,
  onActionPress,
}: Props) {
  const foreground = "rgba(255,255,255,0.88)";
  const railHeight = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 62],
  });
  const railPaddingTop = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 10],
  });
  const railPaddingBottom = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 4],
  });
  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-8, 0],
  });

  return (
    <Animated.View
      testID="liquid-tab-secondary-rail"
      pointerEvents={expanded ? "auto" : "none"}
      accessibilityElementsHidden={!expanded}
      importantForAccessibility={expanded ? "auto" : "no-hide-descendants"}
      style={[
        styles.secondaryRail,
        styles.secondaryRailExpanded,
        {
          height: railHeight,
          paddingTop: railPaddingTop,
          paddingBottom: railPaddingBottom,
          opacity: progress,
          transform: [{ translateY }],
        },
      ]}
    >
      {expanded
        ? secondaryActions.map((action) => (
            <Pressable
              key={action.key}
              testID={`liquid-tab-secondary-${action.key}`}
              accessibilityRole="button"
              accessibilityLabel={action.label}
              accessibilityState={{ disabled: !expanded }}
              disabled={!expanded}
              onPress={() => onActionPress(action)}
              style={({ pressed }) => [styles.secondaryAction, pressed && styles.pressed]}
            >
              <action.Icon color={foreground} />
              <Text style={[styles.secondaryLabel, { color: foreground }]}>{action.label}</Text>
            </Pressable>
          ))
        : null}
    </Animated.View>
  );
}
