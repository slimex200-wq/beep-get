import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useAuthStore } from "@/stores/authStore";
import { colors } from "@/design/tokens";
import { type } from "@/design/typography";
import { AuthScreen } from "@/screens/AuthScreen";
import { Text } from "react-native";
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
  Widgets: undefined;
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
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Today"
        component={TodayScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Text style={[type.tinyMono, { color: focused ? colors.paperWarm : "rgba(247,243,234,0.45)" }]}>
              TODAY
            </Text>
          ),
        }}
      />
      <Tab.Screen
        name="People"
        component={PeopleScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Text style={[type.tinyMono, { color: focused ? colors.paperWarm : "rgba(247,243,234,0.45)" }]}>
              PEOPLE
            </Text>
          ),
        }}
      />
      <Tab.Screen
        name="Compose"
        component={SendSignalScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Text style={[type.tinyMono, { color: focused ? colors.paperWarm : "rgba(247,243,234,0.45)" }]}>
              SEND
            </Text>
          ),
        }}
      />
      <Tab.Screen
        name="Studio"
        component={StudioScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Text style={[type.tinyMono, { color: focused ? colors.paperWarm : "rgba(247,243,234,0.45)" }]}>
              STUDIO
            </Text>
          ),
        }}
      />
      <Tab.Screen
        name="Logs"
        component={LogsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Text style={[type.tinyMono, { color: focused ? colors.paperWarm : "rgba(247,243,234,0.45)" }]}>
              LOGS
            </Text>
          ),
        }}
      />
      <Tab.Screen
        name="Widgets"
        component={WidgetStatesScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Text style={[type.tinyMono, { color: focused ? colors.paperWarm : "rgba(247,243,234,0.45)" }]}>
              WIDGET
            </Text>
          ),
        }}
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
