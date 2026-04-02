import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useAuthStore } from "@/stores/authStore";
import { AuthScreen } from "@/screens/AuthScreen";
import { HomeScreen } from "@/screens/HomeScreen";
import { SendScreen } from "@/screens/SendScreen";
import { FriendsScreen } from "@/screens/FriendsScreen";
import { DictionaryScreen } from "@/screens/DictionaryScreen";
import { ProfileScreen } from "@/screens/ProfileScreen";
import { neumorphism as theme } from "@/theme/neumorphism";
import { Text } from "react-native";

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Send: { friendId: string; friendName: string };
};

export type MainTabParamList = {
  Home: undefined;
  Friends: undefined;
  Dictionary: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text
      style={{
        fontFamily: theme.fonts.pixel,
        fontSize: 10,
        color: focused ? theme.colors.primary : theme.colors.textSecondary,
      }}
    >
      {label}
    </Text>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.border,
          paddingTop: 8,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="HOME" focused={focused} /> }}
      />
      <Tab.Screen
        name="Friends"
        component={FriendsScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="FRIENDS" focused={focused} /> }}
      />
      <Tab.Screen
        name="Dictionary"
        component={DictionaryScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="CODES" focused={focused} /> }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="MY" focused={focused} /> }}
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
          <Stack.Screen
            name="Send"
            component={SendScreen}
            options={{ presentation: "modal" }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
