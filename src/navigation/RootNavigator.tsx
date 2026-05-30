import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { NavigatorScreenParams } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useAuthStore } from "@/stores/authStore";
import { colors } from "@/design/tokens";
import { font } from "@/design/typography";
import {
  FriendsGroupIcon,
  MyUserIcon,
  SendPlaneIcon,
  TodayCalendarIcon,
} from "@/components/MockupLineIcons";
import { AuthScreen } from "@/screens/AuthScreen";
import { CollectionScreen } from "@/screens/CollectionScreen";
import { DictionaryScreen } from "@/screens/DictionaryScreen";
import { LogsScreen } from "@/screens/LogsScreen";
import { MyScreen } from "@/screens/MyScreen";
import { PeopleScreen } from "@/screens/PeopleScreen";
import { SendSignalScreen } from "@/screens/SendSignalScreen";
import { ReplyRoomScreen as SlipReplyRoomScreen } from "@/screens/SlipReplyRoomScreen";
import { SettingsScreen } from "@/screens/SettingsScreen";
import { StudioScreen } from "@/screens/StudioScreen";
import { TodayScreen } from "@/screens/TodayScreen";
import { WidgetStatesScreen } from "@/screens/WidgetStatesScreen";

export type RootStackParamList = {
  Auth: undefined;
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
  Send: { friendId: string; friendName: string; friendNo?: string; mode?: "beep" | "blink"; initialCode?: string };
  ReplyRoom: { signalId: string };
  WidgetStates: { size?: "small" | "medium" } | undefined;
  Logs: undefined;
  StudioTools: undefined;
  Account: undefined;
  Dictionary: undefined;
  Collection: undefined;
};

export type MainTabParamList = {
  Today: undefined;
  Compose: undefined;
  People: undefined;
  My: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

export const primaryTabLabels = ["TODAY", "SEND", "FRIENDS", "MY"] as const;

const tabLabels: Record<keyof MainTabParamList, string> = {
  Today: "Today",
  Compose: "Send",
  People: "Friends",
  My: "My",
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          left: 14,
          right: 14,
          bottom: 9,
          minHeight: 52,
          paddingTop: 4,
          paddingBottom: 4,
          borderTopWidth: 0,
          borderWidth: 1,
          borderColor: "rgba(10,10,10,0.08)",
          borderRadius: 15,
          backgroundColor: "#E4E0DA",
          shadowColor: colors.ink,
          shadowOpacity: 0.04,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 1 },
          elevation: 2,
        },
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: colors.muted,
        tabBarIcon: ({ focused, color }) => (
          <TabIcon routeName={route.name} focused={focused} color={color} />
        ),
        tabBarIconStyle: { marginTop: 0 },
        tabBarItemStyle: { paddingBottom: 0 },
        tabBarLabel: ({ focused, color }) => (
          <TabLabel label={tabLabels[route.name]} focused={focused} color={color} />
        ),
        tabBarShowLabel: true,
      })}
    >
      <Tab.Screen name="Today" component={TodayScreen} />
      <Tab.Screen name="Compose" component={SendSignalScreen} />
      <Tab.Screen name="People" component={PeopleScreen} />
      <Tab.Screen name="My" component={MyScreen} />
    </Tab.Navigator>
  );
}

function TabIcon({ routeName, focused, color }: { routeName: keyof MainTabParamList; focused: boolean; color: string }) {
  const tint = focused ? colors.ink : color;

  return (
    <View style={styles.tabIconWrap}>
      {routeName === "Today" ? <TodayCalendarIcon color={tint} /> : null}
      {routeName === "Compose" ? <SendPlaneIcon color={tint} /> : null}
      {routeName === "People" ? (
        <>
          <FriendsGroupIcon color={tint} />
          <View style={styles.tabUnreadDot} />
        </>
      ) : null}
      {routeName === "My" ? <MyUserIcon color={tint} /> : null}
    </View>
  );
}

function TabLabel({ label, focused, color }: { label: string; focused: boolean; color: string }) {
  return (
    <Text style={[styles.tabLabel, { color }, focused && styles.tabLabelActive]}>{label}</Text>
  );
}

export function RootNavigator() {
  const { session, profile } = useAuthStore();
  const needsOnboarding =
    !session || !profile || !profile.nickname?.trim() || !profile.avatar_url?.trim();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {needsOnboarding ? (
        <Stack.Screen name="Auth" component={AuthScreen} />
      ) : (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen
            name="Send"
            component={SendSignalScreen}
            options={{ presentation: "modal" }}
          />
          <Stack.Screen
            name="ReplyRoom"
            component={SlipReplyRoomScreen}
          />
          <Stack.Screen
            name="WidgetStates"
            component={WidgetStatesScreen}
            options={{ presentation: "fullScreenModal" }}
          />
          <Stack.Screen
            name="Logs"
            component={LogsScreen}
            options={{ presentation: "modal" }}
          />
          <Stack.Screen
            name="StudioTools"
            component={StudioScreen}
            options={{ presentation: "modal" }}
          />
          <Stack.Screen
            name="Account"
            component={SettingsScreen}
            options={{ presentation: "modal" }}
          />
          <Stack.Screen
            name="Dictionary"
            component={DictionaryScreen}
            options={{ presentation: "modal" }}
          />
          <Stack.Screen
            name="Collection"
            component={CollectionScreen}
            options={{ presentation: "modal" }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabIconWrap: {
    width: 24,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  tabUnreadDot: {
    position: "absolute",
    top: -1,
    right: 1,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.red,
  },
  tabLabel: {
    fontFamily: font.sansBold,
    fontSize: 9,
    lineHeight: 11,
    letterSpacing: 0,
    fontWeight: "700",
  },
  tabLabelActive: {
    opacity: 1,
  },
});
