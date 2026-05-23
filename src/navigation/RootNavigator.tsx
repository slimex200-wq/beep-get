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
import { FirstRunScreen } from "@/screens/FirstRunScreen";
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
  FirstRun: undefined;
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

export const primaryTabLabels = ["TODAY", "SEND", "PEOPLE", "MY"] as const;

const tabLabels: Record<keyof MainTabParamList, (typeof primaryTabLabels)[number]> = {
  Today: "TODAY",
  Compose: "SEND",
  People: "PEOPLE",
  My: "MY",
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.stage,
          borderTopColor: "rgba(247,243,234,0.16)",
          paddingTop: 8,
          minHeight: 62,
        },
        tabBarActiveTintColor: colors.paperWarm,
        tabBarInactiveTintColor: "rgba(247,243,234,0.45)",
        tabBarIcon: () => null,
        tabBarIconStyle: { height: 0 },
        tabBarItemStyle: { paddingBottom: 7 },
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
      <Text style={[styles.tabLabel, { color }, focused && styles.tabLabelActive]}>{label}</Text>
      <View style={[styles.tabIndicator, focused && styles.tabIndicatorActive]} />
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
          <Stack.Screen name="FirstRun" component={FirstRunScreen} />
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
    minWidth: 54,
  },
  tabLabel: {
    fontFamily: type.tinyMono.fontFamily,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.65,
    fontWeight: "700",
  },
  tabLabelActive: {
    opacity: 1,
  },
  tabIndicator: {
    width: 14,
    height: 2,
    marginTop: 3,
    borderRadius: 2,
    backgroundColor: colors.transparent,
  },
  tabIndicatorActive: {
    backgroundColor: colors.paperWarm,
  },
});
