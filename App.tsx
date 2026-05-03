import React, { useEffect, useRef } from "react";
import { NavigationContainer } from "@react-navigation/native";
import type { NavigationContainerRef } from "@react-navigation/native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import * as Linking from "expo-linking";
import { RootNavigator } from "@/navigation/RootNavigator";
import type { RootStackParamList } from "@/navigation/RootNavigator";
import { useAuthStore } from "@/stores/authStore";
import { useMessageStore } from "@/stores/messageStore";
import { supabase } from "@/lib/supabase";
import { customFonts } from "@/theme/fonts";
import { ThemeProvider } from "@/theme/ThemeProvider";

SplashScreen.preventAutoHideAsync();

const linking = {
  prefixes: [Linking.createURL("/"), "beepget://"],
  config: {
    screens: {
      Main: {
        screens: {
          Today: "today",
          People: "people",
          Compose: "send",
          Studio: "studio",
          Logs: "logs",
        },
      },
      FirstRun: "first-run",
      Send: "message/reply/:friendId/:friendName",
      ReplyRoom: "reply/:signalId",
      WidgetStates: "widget-states",
    },
  },
};

export default function App() {
  const { setSession, fetchProfile } = useAuthStore();
  const { read } = useMessageStore();
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);
  const [fontsLoaded] = useFonts(customFonts);

  // Handle widget deeplink actions
  useEffect(() => {
    const handleUrl = ({ url }: { url: string }) => {
      const confirmMatch = url.match(/beepget:\/\/message\/confirm\/(.+)/);
      if (confirmMatch) {
        read(confirmMatch[1]);
      }
    };
    const sub = Linking.addEventListener("url", handleUrl);
    return () => sub.remove();
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile();
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile();
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <ThemeProvider>
      <NavigationContainer ref={navigationRef} linking={linking}>
        <RootNavigator />
      </NavigationContainer>
    </ThemeProvider>
  );
}
