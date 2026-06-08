import React from "react";
import type { NavigatorScreenParams } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { useAuthStore } from "@/stores/authStore";
import { isUiPreviewUser } from "@/lib/uiPreview";
import { useAppPalette } from "@/design/appTheme";
import { AuthScreen } from "@/screens/AuthScreen";
import { LiquidExpandableTabBar } from "@/components/LiquidExpandableTabBar";
import { DictionaryScreen } from "@/screens/DictionaryScreen";
import { LogsScreen } from "@/screens/LogsScreen";
import { MyScreen } from "@/screens/MyScreen";
import { PeopleScreen } from "@/screens/PeopleScreen";
import { SendSignalScreen } from "@/screens/SendSignalScreen";
import { ReplyRoomScreen as SlipReplyRoomScreen } from "@/screens/SlipReplyRoomScreen";
import { SettingsScreen } from "@/screens/SettingsScreen";
import { TodayScreen } from "@/screens/TodayScreen";

export type RootStackParamList = {
  Auth: undefined;
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
  Send: {
    friendId: string;
    friendName: string;
    friendNo?: string;
    friendAvatarUri?: string;
    mode?: "beep" | "blink";
    initialCode?: string;
  };
  ReplyRoom: { signalId: string };
  Logs: undefined;
  Account: undefined;
  Dictionary: undefined;
};

export type MainTabParamList = {
  Today: undefined;
  Compose: undefined;
  People: undefined;
  My: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createMaterialTopTabNavigator<MainTabParamList>();

export const primaryTabLabels = ["TODAY", "SEND", "PEOPLE", "MY"] as const;

function MainTabs() {
  const themedPalette = useAppPalette();

  return (
    <Tab.Navigator
      tabBarPosition="bottom"
      tabBar={(props) => <LiquidExpandableTabBar {...props} palette={themedPalette} />}
      screenOptions={{
        swipeEnabled: true,
        lazy: true,
      }}
    >
      <Tab.Screen name="Today" component={TodayScreen} />
      <Tab.Screen name="Compose" component={SendSignalScreen} />
      <Tab.Screen name="People" component={PeopleScreen} />
      <Tab.Screen name="My" component={MyScreen} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const { session, profile } = useAuthStore();
  const isPreviewSession = isUiPreviewUser(profile?.id);
  const needsOnboarding =
    !isPreviewSession &&
    (!session || !profile || !profile.nickname?.trim() || !profile.avatar_url?.trim());

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
            name="Logs"
            component={LogsScreen}
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
        </>
      )}
    </Stack.Navigator>
  );
}
