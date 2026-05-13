import React, { useEffect, useRef } from "react";
import { NavigationContainer } from "@react-navigation/native";
import type { NavigationContainerRef } from "@react-navigation/native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import * as Linking from "expo-linking";
import { RootNavigator } from "@/navigation/RootNavigator";
import type { RootStackParamList } from "@/navigation/RootNavigator";
import { parseWidgetActionUrl } from "@/lib/widgetActions";
import { useAuthStore } from "@/stores/authStore";
import { useMessageStore } from "@/stores/messageStore";
import { supabase } from "@/lib/supabase";
import { exchangeOAuthCodeFromUrl } from "@/services/authService";
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
          Settings: "settings",
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
  const { quickReply, read, save } = useMessageStore();
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);
  const [fontsLoaded, fontError] = useFonts(customFonts);

  // Handle widget deeplink actions
  useEffect(() => {
    const handleWidgetUrl = async (url: string) => {
      const action = parseWidgetActionUrl(url);
      if (!action) return;

      if (action.type === "confirm") {
        await read(action.signalId);
      } else if (action.type === "save") {
        await save(action.signalId);
      } else {
        await quickReply(action.signalId, action.code);
      }
    };

    const handleOAuthUrl = async (url: string) => {
      try {
        return await exchangeOAuthCodeFromUrl(url);
      } catch (err: any) {
        console.warn("OAuth callback failed", err?.message ?? err);
        return false;
      }
    };

    const handleUrl = ({ url }: { url: string }) => {
      handleOAuthUrl(url).then((handled) => {
        if (handled) return;

        const confirmMatch = url.match(/beepget:\/\/message\/confirm\/(.+)/);
        if (confirmMatch) {
          read(confirmMatch[1]);
          return;
        }
        void handleWidgetUrl(url);
      });
    };

    Linking.getInitialURL().then((url) => {
      if (!url) return;
      handleOAuthUrl(url).then((handled) => {
        if (!handled) void handleWidgetUrl(url);
      });
    });

    const sub = Linking.addEventListener("url", handleUrl);
    return () => sub.remove();
  }, [quickReply, read, save]);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setSession(session);
        if (session) fetchProfile();
      })
      .catch((err) => {
        console.warn("Initial auth session failed", err?.message ?? err);
        setSession(null);
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
    if (fontsLoaded || fontError) SplashScreen.hideAsync();
  }, [fontError, fontsLoaded]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <ThemeProvider>
      <NavigationContainer ref={navigationRef} linking={linking}>
        <RootNavigator />
      </NavigationContainer>
    </ThemeProvider>
  );
}
