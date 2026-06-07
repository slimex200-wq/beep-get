import React, { useEffect, useRef, useState } from "react";
import type { ComponentType } from "react";
import type { LayoutChangeEvent } from "react-native";
import { Animated, Pressable, View } from "react-native";
import { appleLiquidGlassStyles as styles } from "@/components/appleLiquidGlass/styles";
import { liquidGlassTokens } from "@/components/appleLiquidGlass/tokens";

export type LiquidGlassMode = "transparent" | "tinted";

export type AppleLiquidGlassItem = {
  readonly key: string;
  readonly accessibilityLabel: string;
  readonly Icon: ComponentType<{
    readonly color?: string;
    readonly size?: number;
    readonly strokeWidth?: number;
  }>;
};

type Props = {
  readonly items: readonly AppleLiquidGlassItem[];
  readonly selectedIndex: number;
  readonly mode: LiquidGlassMode;
  readonly slowMotion: boolean;
  readonly onSelect: (index: number) => void;
};

const horizontalInset = 6;
const fallbackBarWidth = 320;

function clampSelectedIndex(index: number, itemCount: number): number {
  return Math.max(0, Math.min(index, Math.max(itemCount - 1, 0)));
}

export function AppleLiquidGlassControl({
  items,
  selectedIndex,
  mode,
  slowMotion,
  onSelect,
}: Props) {
  const [barWidth, setBarWidth] = useState(fallbackBarWidth);
  const lobeTranslateX = useRef(new Animated.Value(0)).current;
  const lobeStretch = useRef(new Animated.Value(0)).current;
  const safeSelectedIndex = clampSelectedIndex(selectedIndex, items.length);
  const itemWidth = (barWidth - horizontalInset * 2) / Math.max(items.length, 1);
  const lobeWidth = Math.min(itemWidth + 18, barWidth - horizontalInset * 2);
  const targetTranslateX =
    horizontalInset + safeSelectedIndex * itemWidth + (itemWidth - lobeWidth) / 2;
  const isTinted = mode === "tinted";
  const barBackground = isTinted
    ? liquidGlassTokens.bar.backgroundTinted
    : liquidGlassTokens.bar.backgroundTransparent;
  const lobeBackground = isTinted
    ? liquidGlassTokens.lobe.backgroundTinted
    : liquidGlassTokens.lobe.backgroundTransparent;
  const lobeScaleX = lobeStretch.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.09],
  });

  useEffect(() => {
    const stretchDuration = slowMotion ? 260 : 110;
    Animated.parallel([
      Animated.spring(lobeTranslateX, {
        toValue: targetTranslateX,
        stiffness: slowMotion ? 42 : 220,
        damping: slowMotion ? 14 : 28,
        mass: slowMotion ? 1.8 : 0.8,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(lobeStretch, {
          toValue: 1,
          duration: stretchDuration,
          useNativeDriver: true,
        }),
        Animated.spring(lobeStretch, {
          toValue: 0,
          stiffness: slowMotion ? 55 : 260,
          damping: slowMotion ? 18 : 30,
          mass: slowMotion ? 1.5 : 0.7,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [lobeStretch, lobeTranslateX, slowMotion, targetTranslateX]);

  const onBarLayout = (event: LayoutChangeEvent) => {
    setBarWidth(event.nativeEvent.layout.width);
  };

  return (
    <View
      testID="apple-liquid-glass-control"
      accessibilityRole="tablist"
      onLayout={onBarLayout}
      style={[
        styles.bar,
        {
          backgroundColor: barBackground,
          borderColor: liquidGlassTokens.bar.border,
        },
      ]}
    >
      <View style={[styles.borrowedColorWash, styles.pointerNone]} />
      <View
        style={[
          styles.darkCompensation,
          styles.pointerNone,
          { backgroundColor: liquidGlassTokens.bar.darkCompensation },
        ]}
      />
      <Animated.View
        testID="apple-liquid-glass-lobe"
        style={[
          styles.lobe,
          styles.pointerNone,
          {
            width: lobeWidth,
            backgroundColor: lobeBackground,
            borderColor: liquidGlassTokens.lobe.border,
            transform: [{ translateX: lobeTranslateX }, { scaleX: lobeScaleX }],
          },
        ]}
      />
      <View style={[styles.innerGlow, styles.pointerNone]} />
      <View style={styles.iconRail}>
        {items.map((item, index) => {
          const focused = safeSelectedIndex === index;
          const iconColor = focused
            ? liquidGlassTokens.icon.active
            : liquidGlassTokens.icon.inactive;

          return (
            <Pressable
              key={item.key}
              testID={`apple-liquid-glass-action-${item.key}`}
              accessibilityRole="tab"
              accessibilityLabel={item.accessibilityLabel}
              accessibilityState={{ selected: focused }}
              onPress={() => onSelect(index)}
              style={({ pressed }) => [
                styles.iconButton,
                { width: itemWidth },
                pressed && styles.pressed,
              ]}
            >
              <item.Icon
                color={iconColor}
                size={liquidGlassTokens.icon.size}
                strokeWidth={2.15}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
