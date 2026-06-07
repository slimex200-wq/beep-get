import React from "react";
import { Pressable, View } from "react-native";
import type { LayoutChangeEvent } from "react-native";
import { liquidTabStyles as styles } from "@/components/liquidTabBar/styles";
import type { IconComponent } from "@/components/liquidTabBar/types";

type Props = {
  readonly label: string;
  readonly Icon: IconComponent;
  readonly focused: boolean;
  readonly badge: boolean;
  readonly accessibilityLabel: string;
  readonly onPress: () => void;
  readonly onLayout: (event: LayoutChangeEvent) => void;
  readonly activeColor?: string;
  readonly inactiveColor?: string;
};

const defaultActiveColor = "rgba(255,255,255,0.96)";
const defaultInactiveColor = "rgba(255,255,255,0.82)";

export function LiquidTabItem({
  label,
  Icon,
  focused,
  badge,
  accessibilityLabel,
  onPress,
  onLayout,
  activeColor,
  inactiveColor,
}: Props) {
  const foreground = focused
    ? activeColor ?? defaultActiveColor
    : inactiveColor ?? defaultInactiveColor;

  return (
    <Pressable
      testID={`liquid-tab-${label}`}
      accessibilityRole="tab"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected: focused }}
      onLayout={onLayout}
      onPress={onPress}
      style={({ pressed }) => [styles.tabButton, pressed && styles.pressed]}
    >
      <View style={styles.iconWrap}>
        <Icon color={foreground} />
        {badge ? <View style={styles.badge} /> : null}
      </View>
    </Pressable>
  );
}
