import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { NavigatorScreenParams } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useAuthStore } from "@/stores/authStore";
import { colors } from "@/design/tokens";
import { font, type } from "@/design/typography";
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
  Send: { friendId: string; friendName: string; friendNo?: string; mode?: "beep" | "blink" };
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

const tabLabels: Record<keyof MainTabParamList, (typeof primaryTabLabels)[number]> = {
  Today: "TODAY",
  Compose: "SEND",
  People: "FRIENDS",
  My: "MY",
};

const tabGlyphs: Record<keyof MainTabParamList, string> = {
  Today: "▣",
  Compose: "▷",
  People: "••",
  My: "♙",
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          left: 10,
          right: 10,
          bottom: 9,
          minHeight: 56,
          paddingTop: 6,
          paddingBottom: 6,
          borderTopWidth: 0,
          borderRadius: 16,
          backgroundColor: "#E6E3DE",
          shadowColor: colors.ink,
          shadowOpacity: 0.06,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
          elevation: 4,
        },
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: colors.muted,
        tabBarIcon: ({ focused, color }) => (
          <TabIcon routeName={route.name} focused={focused} color={color} />
        ),
        tabBarIconStyle: { marginTop: 2 },
        tabBarItemStyle: { paddingBottom: 1 },
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
  return (
    <View style={styles.tabIconWrap}>
      <Text style={[styles.tabGlyph, { color }, focused && styles.tabGlyphActive]}>
        {tabGlyphs[routeName]}
      </Text>
      {routeName === "People" ? <View style={styles.tabAlertDot} /> : null}
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
  const needsOnboarding = !session || !profile || !profile.nickname?.trim();

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
            options={{ presentation: "modal" }}
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
  tabGlyph: {
    fontFamily: font.sansBold,
    fontSize: 17,
    lineHeight: 20,
  },
  tabGlyphActive: {
    color: colors.ink,
  },
  tabAlertDot: {
    position: "absolute",
    right: 1,
    top: 1,
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.red,
  },
  tabLabel: {
    fontFamily: type.tinyMono.fontFamily,
    fontSize: 8,
    lineHeight: 10,
    letterSpacing: 0,
    fontWeight: "700",
  },
  tabLabelActive: {
    opacity: 1,
  },
});
