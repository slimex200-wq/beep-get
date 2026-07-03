import React from "react";
import { TabActions } from "@react-navigation/native";
import type { MaterialTopTabBarProps } from "@react-navigation/material-top-tabs";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { AppPalette } from "@/design/appTheme";
import { getTabVisual } from "@/components/tabBar/model";
import { useAuthStore } from "@/stores/authStore";
import { useFriendStore } from "@/stores/friendStore";
import { useMessageStore } from "@/stores/messageStore";

type Props = MaterialTopTabBarProps & {
  readonly palette: AppPalette;
};

// Signal Edition fixed tab bar (2026-07-02): a quiet full-width bar with exactly
// four tabs. Active state is ink text plus a signal-color dot above the icon.
// Deliberately no floating pill, no liquid glass, no More button, no secondary
// rail — SAVED / ACCOUNT / CODES live as rows under My instead.
export function FixedTabBar({ state, descriptors, navigation, palette }: Props) {
  const insets = useSafeAreaInsets();
  const hasUnreadSignals = useMessageStore((store) =>
    store.received.some((message) => !message.is_read),
  );
  const inboundSeenAt = useAuthStore((store) => store.profile?.inbound_seen_at ?? null);
  const inboundFriends = useFriendStore((store) => store.inboundFriends);
  const unseenInboundCount = useFriendStore((store) => store.unseenInboundCount);
  const hasUnseenInbound = inboundFriends.length > 0 && unseenInboundCount(inboundSeenAt) > 0;

  return (
    <View
      testID="fixed-tab-bar"
      style={[
        styles.bar,
        {
          backgroundColor: palette.card,
          borderTopColor: palette.rule,
          paddingBottom: Math.max(insets.bottom, 10),
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const descriptor = descriptors[route.key];
        const visual = getTabVisual(route.name);
        const showBadge =
          route.name === "Today"
            ? hasUnreadSignals
            : route.name === "People"
              ? hasUnseenInbound
              : false;
        const color = focused ? palette.text : palette.muted2;

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
          <Pressable
            key={route.key}
            testID={`fixed-tab-${visual.label}`}
            accessibilityRole="button"
            accessibilityState={focused ? { selected: true } : {}}
            accessibilityLabel={descriptor?.options.tabBarAccessibilityLabel ?? visual.label}
            onPress={onPress}
            style={styles.item}
          >
            <View
              style={[
                styles.activeDot,
                { backgroundColor: palette.sig, opacity: focused ? 1 : 0 },
              ]}
            />
            <View style={styles.iconWrap}>
              <visual.Icon color={color} />
              {showBadge ? (
                <View
                  testID={`fixed-tab-badge-${visual.label}`}
                  style={[
                    styles.badge,
                    { backgroundColor: palette.sig, borderColor: palette.card },
                  ]}
                />
              ) : null}
            </View>
            <Text style={[styles.label, { color }]}>{visual.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    borderTopWidth: 1,
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  item: {
    flex: 1,
    alignItems: "center",
    gap: 3,
  },
  activeDot: {
    width: 5,
    height: 5,
    borderRadius: 999,
  },
  iconWrap: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -5,
    width: 9,
    height: 9,
    borderRadius: 999,
    borderWidth: 2,
  },
  label: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
});
