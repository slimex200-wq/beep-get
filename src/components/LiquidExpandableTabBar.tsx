import React, { useEffect, useRef, useState } from "react";
import { TabActions } from "@react-navigation/native";
import type { MaterialTopTabBarProps } from "@react-navigation/material-top-tabs";
import { Animated, PanResponder, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { AppPalette } from "@/design/appTheme";
import { getTabVisual } from "@/components/liquidTabBar/model";
import { LiquidTabItem } from "@/components/liquidTabBar/LiquidTabItem";
import { MoreToggleButton } from "@/components/liquidTabBar/MoreToggleButton";
import { SecondaryActionRail } from "@/components/liquidTabBar/SecondaryActionRail";
import {
  darkLiquidGlassBackground,
  darkLiquidGlassBorder,
  darkLiquidGlassCompensation,
  darkLiquidGlassLobe,
  darkLiquidGlassWash,
  lightLiquidGlassBackground,
  lightLiquidGlassBorder,
  lightLiquidGlassCompensation,
  lightLiquidGlassLobe,
  lightLiquidGlassWash,
  liquidTabStyles as styles,
} from "@/components/liquidTabBar/styles";
import type { SecondaryAction } from "@/components/liquidTabBar/types";
import { useLiquidTabLobe } from "@/components/liquidTabBar/useLiquidTabLobe";
import { liquidGlassTokens } from "@/components/appleLiquidGlass/tokens";
import { useAuthStore } from "@/stores/authStore";
import { useFriendStore } from "@/stores/friendStore";
import { useMessageStore } from "@/stores/messageStore";

type Props = MaterialTopTabBarProps & {
  readonly palette: AppPalette;
};

export function LiquidExpandableTabBar({
  state,
  descriptors,
  navigation,
  palette,
}: Props) {
  const insets = useSafeAreaInsets();
  const [expanded, setExpanded] = useState(false);
  const expandedProgress = useRef(new Animated.Value(0)).current;
  const {
    lobeTranslateX,
    lobeStretch,
    lobeWidth,
    onTabLayout,
  } = useLiquidTabLobe({ state });
  const hasUnreadSignals = useMessageStore((store) =>
    store.received.some((message) => !message.is_read),
  );
  const inboundSeenAt = useAuthStore((store) => store.profile?.inbound_seen_at ?? null);
  const inboundFriends = useFriendStore((store) => store.inboundFriends);
  const unseenInboundCount = useFriendStore((store) => store.unseenInboundCount);
  const hasUnseenInbound = inboundFriends.length > 0 && unseenInboundCount(inboundSeenAt) > 0;

  useEffect(() => {
    Animated.spring(expandedProgress, {
      toValue: expanded ? 1 : 0,
      damping: 18,
      stiffness: 180,
      mass: 0.7,
      useNativeDriver: false,
    }).start();
  }, [expanded, expandedProgress]);

  const toggleMore = () => setExpanded((current) => !current);

  // Swipe-up on the bar reveals the secondary rail (Apple liquid-glass feel);
  // swipe-down collapses it. Only claims vertical drags so tab taps/horizontal
  // motion still pass through to the buttons below.
  const swipeResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_evt, gesture) =>
        Math.abs(gesture.dy) > 8 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
      onPanResponderRelease: (_evt, gesture) => {
        if (gesture.dy < -24) {
          setExpanded(true);
        } else if (gesture.dy > 24) {
          setExpanded(false);
        }
      },
    }),
  ).current;

  const openSecondaryAction = (action: SecondaryAction) => {
    navigation.getParent()?.navigate(action.screen);
    setExpanded(false);
  };

  const isDarkMode = palette.mode === "dark";
  const glassBackground = isDarkMode
    ? darkLiquidGlassBackground
    : lightLiquidGlassBackground;
  const glassBorder = isDarkMode ? darkLiquidGlassBorder : lightLiquidGlassBorder;
  const glassWash = isDarkMode ? darkLiquidGlassWash : lightLiquidGlassWash;
  const glassCompensation = isDarkMode
    ? darkLiquidGlassCompensation
    : lightLiquidGlassCompensation;
  const lobeBackground = isDarkMode
    ? darkLiquidGlassLobe
    : lightLiquidGlassLobe;
  const lobeBorder = isDarkMode ? "rgba(255,255,255,0.15)" : liquidGlassTokens.lobe.border;
  const railIconForeground = "rgba(255,255,255,0.82)";
  const lensForeground = "rgba(255,255,255,0.96)";
  const expandedPillHeight = expandedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [liquidGlassTokens.bar.height, 128],
  });
  const lobeScaleX = lobeStretch.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.09],
  });

  return (
    <View
      testID="liquid-tab-bar"
      pointerEvents="box-none"
      style={[styles.host, { bottom: Math.max(insets.bottom, 8) + 8 }]}
    >
      <Animated.View
        testID="liquid-tab-surface"
        {...swipeResponder.panHandlers}
        style={[
          styles.pill,
          {
            height: expandedPillHeight,
            backgroundColor: glassBackground,
            borderColor: glassBorder,
            shadowOpacity: isDarkMode ? 0.42 : 0.28,
          },
        ]}
      >
        <View pointerEvents="none" style={[styles.borrowedColorWash, { backgroundColor: glassWash }]} />
        <View pointerEvents="none" style={[styles.glassCompensation, { backgroundColor: glassCompensation }]} />
        <View pointerEvents="none" style={styles.glassEdgeGlow} />
        <SecondaryActionRail
          expanded={expanded}
          progress={expandedProgress}
          onActionPress={openSecondaryAction}
        />
        <View testID="liquid-tab-primary-rail" style={styles.mainRow}>
          <Animated.View
            testID="liquid-tab-lobe"
            pointerEvents="none"
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={[
              styles.liquidLobe,
              {
                width: lobeWidth,
                backgroundColor: lobeBackground,
                borderColor: lobeBorder,
                transform: [
                  { translateX: lobeTranslateX },
                  { scaleX: lobeScaleX },
                ],
              },
            ]}
          />
          {state.routes.map((route, index) => {
            const focused = state.index === index;
            const descriptor = descriptors[route.key];
            const visual = getTabVisual(route.name);
            const showBadge =
              route.name === "Today" ? hasUnreadSignals : route.name === "People" ? hasUnseenInbound : false;
            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });

              if (!focused && !event.defaultPrevented) {
                navigation.dispatch({
                  ...TabActions.jumpTo(route.name),
                  target: state.key,
                });
              }
            };

            return (
              <LiquidTabItem
                key={route.key}
                label={visual.label}
                Icon={visual.Icon}
                focused={focused}
                badge={showBadge}
                accessibilityLabel={descriptor?.options.tabBarAccessibilityLabel ?? visual.label}
                onPress={onPress}
                onLayout={onTabLayout(index)}
                activeColor={lensForeground}
                inactiveColor={railIconForeground}
              />
            );
          })}
          <MoreToggleButton expanded={expanded} onPress={toggleMore} />
        </View>
      </Animated.View>
    </View>
  );
}
