import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { NavigatorScreenParams } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useAuthStore } from "@/stores/authStore";
import { colors } from "@/design/tokens";
import { type } from "@/design/typography";
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

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          left: 10,
          right: 10,
          bottom: 8,
          minHeight: 58,
          paddingTop: 7,
          paddingBottom: 7,
          borderTopWidth: 0,
          borderRadius: 24,
          backgroundColor: colors.paperDeep,
          shadowColor: colors.ink,
          shadowOpacity: 0.10,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
          elevation: 8,
        },
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: colors.muted,
        tabBarIcon: () => null,
        tabBarIconStyle: { height: 0 },
        tabBarItemStyle: { paddingBottom: 0 },
        tabBarLabel: ({ focused, color }) => <TabLabel label={tabLabels[route.name]} focused={focused} color={color} />,
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

function TabLabel({ label, focused, color }: { label: string; focused: boolean; color: string }) {
  return (
    <View style={styles.tabLabelWrap}>
      <View style={[styles.tabIcon, focused && styles.tabIconActive]}>
        <Text style={[styles.tabIconText, focused && styles.tabIconTextActive]}>{label[0]}</Text>
      </View>
      <Text style={[styles.tabLabel, { color }, focused && styles.tabLabelActive]}>{label}</Text>
    </View>
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
  tabLabelWrap: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 62,
    gap: 2,
  },
  tabIcon: {
    width: 20,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9,
    backgroundColor: colors.transparent,
  },
  tabIconActive: {
    backgroundColor: colors.ink,
  },
  tabIconText: {
    fontFamily: type.tinyMono.fontFamily,
    fontSize: 9,
    lineHeight: 11,
    color: colors.muted,
    fontWeight: "700",
  },
  tabIconTextActive: {
    color: colors.paperWarm,
  },
  tabLabel: {
    fontFamily: type.tinyMono.fontFamily,
    fontSize: 9,
    lineHeight: 11,
    letterSpacing: 0,
    fontWeight: "700",
  },
  tabLabelActive: {
    opacity: 1,
  },
});
