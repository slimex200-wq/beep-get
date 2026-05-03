import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useAuthStore } from "@/stores/authStore";
import { colors } from "@/design/tokens";
import { type } from "@/design/typography";
import { AuthScreen } from "@/screens/AuthScreen";
import { FirstRunScreen } from "@/screens/FirstRunScreen";
import { LogsScreen } from "@/screens/LogsScreen";
import { PeopleScreen } from "@/screens/PeopleScreen";
import { SendSignalScreen } from "@/screens/SendSignalScreen";
import { ReplyRoomScreen as SlipReplyRoomScreen } from "@/screens/SlipReplyRoomScreen";
import { StudioScreen } from "@/screens/StudioScreen";
import { TodayScreen } from "@/screens/TodayScreen";
import { WidgetStatesScreen } from "@/screens/WidgetStatesScreen";

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  FirstRun: undefined;
  Send: { friendId: string; friendName: string };
  ReplyRoom: { signalId: string };
  WidgetStates: undefined;
};

export type MainTabParamList = {
  Today: undefined;
  People: undefined;
  Compose: undefined;
  Studio: undefined;
  Logs: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.stage,
          borderTopColor: "rgba(247,243,234,0.16)",
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.paperWarm,
        tabBarInactiveTintColor: "rgba(247,243,234,0.45)",
        tabBarIcon: () => null,
        tabBarIconStyle: { height: 0 },
        tabBarItemStyle: { paddingBottom: 8 },
        tabBarLabelStyle: {
          fontFamily: type.tinyMono.fontFamily,
          fontSize: 9,
          lineHeight: 11,
          letterSpacing: 0.4,
        },
        tabBarShowLabel: true,
      }}
    >
      <Tab.Screen
        name="Today"
        component={TodayScreen}
        options={{ tabBarLabel: "TODAY" }}
      />
      <Tab.Screen
        name="People"
        component={PeopleScreen}
        options={{ tabBarLabel: "PEOPLE" }}
      />
      <Tab.Screen
        name="Compose"
        component={SendSignalScreen}
        options={{ tabBarLabel: "SEND" }}
      />
      <Tab.Screen
        name="Studio"
        component={StudioScreen}
        options={{ tabBarLabel: "STUDIO" }}
      />
      <Tab.Screen
        name="Logs"
        component={LogsScreen}
        options={{ tabBarLabel: "LOGS" }}
      />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const { session, profile } = useAuthStore();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!session || !profile ? (
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
            options={{ presentation: "modal" }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
