import React, { useCallback, useEffect, useRef, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import type { NavigationContainerRef } from "@react-navigation/native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import * as Linking from "expo-linking";
import { StyleSheet, Text, View } from "react-native";
import { RootNavigator } from "@/navigation/RootNavigator";
import type { RootStackParamList } from "@/navigation/RootNavigator";
import { parseWidgetActionUrl } from "@/lib/widgetActions";
import { useAuthStore } from "@/stores/authStore";
import { useMessageStore } from "@/stores/messageStore";
import { supabase } from "@/lib/supabase";
import { exchangeOAuthCodeFromUrl } from "@/services/authService";
import { getNotificationSignalId, registerPushToken } from "@/services/pushService";
import { customFonts } from "@/theme/fonts";
import { ThemeProvider } from "@/theme/ThemeProvider";
import { UpdateBannerSlip } from "@/components/UpdateBannerSlip";
import * as Notifications from "expo-notifications";
import * as Updates from "expo-updates";
import { useUpdates } from "expo-updates";

void SplashScreen.preventAutoHideAsync().catch((err) => {
  console.warn("Splash prevent auto-hide failed", err?.message ?? err);
});

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

class StartupErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.warn("Startup render failed", error.message);
  }

  render() {
    if (this.state.error) {
      return (
        <View style={styles.errorStage}>
          <Text style={styles.errorTitle}>BEEP-GET STARTUP ERROR</Text>
          <Text style={styles.errorBody}>{this.state.error.message}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const { setSession, fetchProfile, session, profile } = useAuthStore();
  const { quickReply, read, save } = useMessageStore();
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);
  const [fontsLoaded, fontError] = useFonts(customFonts);
  const [startupTimedOut, setStartupTimedOut] = useState(false);
  const [navigationReady, setNavigationReady] = useState(false);
  const [pendingWidgetUrl, setPendingWidgetUrl] = useState<string | null>(null);
  const [updateDismissed, setUpdateDismissed] = useState(false);
  const [updateReloading, setUpdateReloading] = useState(false);
  const appReady = fontsLoaded || Boolean(fontError) || startupTimedOut;
  const canHandleWidgetActions = Boolean(appReady && navigationReady && session && profile);
  const updatesState = useUpdates();
  const showUpdateBanner =
    Boolean(updatesState.isUpdatePending) && !updateDismissed;

  const applyUpdate = useCallback(async () => {
    if (updateReloading) return;
    setUpdateReloading(true);
    try {
      await Updates.reloadAsync();
    } catch (err: any) {
      console.warn("Update reload failed", err?.message ?? err);
      setUpdateReloading(false);
    }
  }, [updateReloading]);

  const handleWidgetUrl = useCallback(
    async (url: string) => {
      const action = parseWidgetActionUrl(url);
      if (!action) return false;

      if (!canHandleWidgetActions) {
        setPendingWidgetUrl(url);
        return true;
      }

      try {
        if (action.type === "confirm") {
          await read(action.signalId);
        } else if (action.type === "save") {
          await save(action.signalId);
        } else {
          await quickReply(action.signalId, action.code);
        }
        navigationRef.current?.navigate("ReplyRoom", { signalId: action.signalId });
      } catch (err: any) {
        console.warn("Widget action failed", err?.message ?? err);
      }

      return true;
    },
    [canHandleWidgetActions, quickReply, read, save]
  );

  // Handle widget deeplink actions
  useEffect(() => {
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
        handleWidgetUrl(url);
      });
    };

    Linking.getInitialURL().then((url) => {
      if (!url) return;
      handleOAuthUrl(url).then((handled) => {
        if (!handled) handleWidgetUrl(url);
      });
    });

    const sub = Linking.addEventListener("url", handleUrl);
    return () => sub.remove();
  }, [handleWidgetUrl, read]);

  useEffect(() => {
    if (!pendingWidgetUrl || !canHandleWidgetActions) return;
    const url = pendingWidgetUrl;
    setPendingWidgetUrl(null);
    handleWidgetUrl(url);
  }, [canHandleWidgetActions, handleWidgetUrl, pendingWidgetUrl]);

  useEffect(() => {
    if (!profile?.id) return;
    registerPushToken(profile.id).catch((err) =>
      console.warn("Push registration failed", err?.message ?? err),
    );
  }, [profile?.id]);

  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const signalId = getNotificationSignalId(response);
      if (signalId) navigationRef.current?.navigate("ReplyRoom", { signalId });
    });
    return () => sub.remove();
  }, []);

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
    const timeout = setTimeout(() => setStartupTimedOut(true), 2500);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (appReady) {
      SplashScreen.hideAsync().catch((err) =>
        console.warn("Splash hide failed", err?.message ?? err),
      );
    }
  }, [appReady]);

  if (!appReady) return null;

  return (
    <StartupErrorBoundary>
      <ThemeProvider>
        <NavigationContainer
          ref={navigationRef}
          linking={linking}
          onReady={() => setNavigationReady(true)}
        >
          <RootNavigator />
        </NavigationContainer>
        <UpdateBannerSlip
          visible={showUpdateBanner}
          onReload={applyUpdate}
          onDismiss={() => setUpdateDismissed(true)}
          busy={updateReloading}
        />
      </ThemeProvider>
    </StartupErrorBoundary>
  );
}

const styles = StyleSheet.create({
  errorStage: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#111111",
  },
  errorTitle: {
    color: "#FFF5EE",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  errorBody: {
    color: "#F36F5A",
    fontSize: 13,
    lineHeight: 19,
  },
});
