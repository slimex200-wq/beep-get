import { useCallback, useEffect, useRef, useState } from "react";
import type { MaterialTopTabBarProps } from "@react-navigation/material-top-tabs";
import { Animated } from "react-native";
import type { LayoutChangeEvent } from "react-native";

type TabSlotLayout = {
  readonly x: number;
  readonly width: number;
};

type UseLiquidTabLobeParams = {
  readonly state: MaterialTopTabBarProps["state"];
};

const fallbackTabWidth = 82;
const lobeExtraWidth = 12;
const minimumLobeWidth = 62;

function lobeWidthForLayout(layout: TabSlotLayout | null | undefined): number {
  return Math.max(minimumLobeWidth, (layout?.width ?? fallbackTabWidth) + lobeExtraWidth);
}

export function useLiquidTabLobe({ state }: UseLiquidTabLobeParams) {
  const [tabLayouts, setTabLayouts] = useState<ReadonlyArray<TabSlotLayout | null>>([]);
  const lobeTranslateX = useRef(new Animated.Value(0)).current;
  const lobeStretch = useRef(new Animated.Value(0)).current;
  const lobeWidth = lobeWidthForLayout(tabLayouts[state.index]);

  useEffect(() => {
    if (tabLayouts.length === state.routes.length) {
      return;
    }

    setTabLayouts((current) => state.routes.map((_, index) => current[index] ?? null));
  }, [state.routes, tabLayouts.length]);

  const lobeTargetForIndex = useCallback((index: number) => {
    const layout = tabLayouts[index];
    const width = lobeWidthForLayout(layout);

    if (!layout) {
      return index * fallbackTabWidth + (fallbackTabWidth - width) / 2;
    }

    return layout.x + (layout.width - width) / 2;
  }, [tabLayouts]);

  const snapLobeToIndex = useCallback((index: number) => {
    Animated.parallel([
      Animated.spring(lobeTranslateX, {
        toValue: lobeTargetForIndex(index),
        stiffness: 220,
        damping: 28,
        mass: 0.8,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(lobeStretch, {
          toValue: 1,
          duration: 110,
          useNativeDriver: true,
        }),
        Animated.spring(lobeStretch, {
          toValue: 0,
          stiffness: 260,
          damping: 30,
          mass: 0.7,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [lobeStretch, lobeTargetForIndex, lobeTranslateX]);

  useEffect(() => {
    snapLobeToIndex(state.index);
  }, [snapLobeToIndex, state.index]);

  const onTabLayout = useCallback((index: number) => (event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;

    setTabLayouts((current) => {
      const currentLayout = current[index];

      if (currentLayout?.x === x && currentLayout.width === width) {
        return current;
      }

      const next: Array<TabSlotLayout | null> = state.routes.map((_, routeIndex) => current[routeIndex] ?? null);
      next[index] = { x, width };
      return next;
    });
  }, [state.routes]);

  return {
    lobeTranslateX,
    lobeStretch,
    lobeWidth,
    onTabLayout,
  };
}
