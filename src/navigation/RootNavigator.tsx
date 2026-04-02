import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useAuthStore } from "@/stores/authStore";
import { useTheme } from "@/theme/ThemeProvider";
import { AuthScreen } from "@/screens/AuthScreen";
import { HomeScreen } from "@/screens/HomeScreen";
import { SendScreen } from "@/screens/SendScreen";
import { FriendsScreen } from "@/screens/FriendsScreen";
import { DictionaryScreen } from "@/screens/DictionaryScreen";
import { SkinShopScreen } from "@/screens/SkinShopScreen";
import { CollectionScreen } from "@/screens/CollectionScreen";
import { ProfileScreen } from "@/screens/ProfileScreen";
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
  Skins: undefined;
  Collection: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  const theme = useTheme();

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
        options={{
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontFamily: theme.fonts.pixel, fontSize: 9, color: focused ? theme.colors.primary : theme.colors.textSecondary }}>
              HOME
            </Text>
          ),
        }}
      />
      <Tab.Screen
        name="Friends"
        component={FriendsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontFamily: theme.fonts.pixel, fontSize: 9, color: focused ? theme.colors.primary : theme.colors.textSecondary }}>
              FRIEND
            </Text>
          ),
        }}
      />
      <Tab.Screen
        name="Dictionary"
        component={DictionaryScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontFamily: theme.fonts.pixel, fontSize: 9, color: focused ? theme.colors.primary : theme.colors.textSecondary }}>
              CODES
            </Text>
          ),
        }}
      />
      <Tab.Screen
        name="Skins"
        component={SkinShopScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontFamily: theme.fonts.pixel, fontSize: 9, color: focused ? theme.colors.primary : theme.colors.textSecondary }}>
              SKIN
            </Text>
          ),
        }}
      />
      <Tab.Screen
        name="Collection"
        component={CollectionScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontFamily: theme.fonts.pixel, fontSize: 9, color: focused ? theme.colors.primary : theme.colors.textSecondary }}>
              ICON
            </Text>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontFamily: theme.fonts.pixel, fontSize: 9, color: focused ? theme.colors.primary : theme.colors.textSecondary }}>
              MY
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
