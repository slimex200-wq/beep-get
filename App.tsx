import React, { useCallback, useEffect, useRef, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import type { NavigationContainerRef } from "@react-navigation/native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import * as Linking from "expo-linking";
import { Platform, StyleSheet, Text, View } from "react-native";
import { RootNavigator } from "@/navigation/RootNavigator";
import type { RootStackParamList } from "@/navigation/RootNavigator";
import { parseWidgetActionUrl } from "@/lib/widgetActions";
import { useAuthStore } from "@/stores/authStore";
import { useFriendStore } from "@/stores/friendStore";
import { useMessageStore } from "@/stores/messageStore";
import { useThemeStore } from "@/stores/themeStore";
import { supabase } from "@/lib/supabase";
import { exchangeOAuthCodeFromUrl } from "@/services/authService";
import { getNotificationSignalId, registerPushToken } from "@/services/pushService";
import { customFonts } from "@/theme/fonts";
import { ThemeProvider } from "@/theme/ThemeProvider";
import { UpdateBannerSlip } from "@/components/UpdateBannerSlip";
import { isUiPreviewEnabled } from "@/lib/uiPreview";
import * as Notifications from "expo-notifications";
import * as Updates from "expo-updates";
import { useUpdates } from "expo-updates";

void SplashScreen.preventAutoHideAsync().catch((err) => {
  console.warn("Splash prevent auto-hide failed", err?.message ?? err);
});

const FORCE_PREVIEW_UPDATE_PARAM = "beepUpdate";
const initialPreviewUpdateForced =
  Platform.OS === "web" &&
  typeof window !== "undefined" &&
  new URLSearchParams(window.location.search).has(FORCE_PREVIEW_UPDATE_PARAM);

function normalizeWebTabPath() {
  if (Platform.OS !== "web" || typeof window === "undefined") return;

  const rawPath = window.location.pathname.replace(/^\/+|\/+$/g, "");
  const normalizedTabPath = new Map([
    ["today", "today"],
    ["send", "send"],
    ["people", "people"],
    ["my", "my"],
  ]).get(rawPath.toLowerCase());

  if (!normalizedTabPath || rawPath === normalizedTabPath) return;
  window.history.replaceState(
    null,
    "",
    `/${normalizedTabPath}${window.location.search}${window.location.hash}`,
  );
}

normalizeWebTabPath();

const linking = {
  prefixes: [Linking.createURL("/"), "beepget://"],
  config: {
    screens: {
      Main: {
        screens: {
          Today: "today",
          Compose: "send",
          People: "people",
          My: "my",
        },
      },
      Send: "message/reply/:friendId/:friendName",
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
  return (
    <StartupErrorBoundary>
      <AppRuntime />
    </StartupErrorBoundary>
  );
}

class OptionalUpdateBoundary extends React.Component<
  { children: React.ReactNode },
  { failed: boolean }
> {
  state: { failed: boolean } = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error) {
    console.warn("Update banner disabled", error.message);
  }

  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}

function AppRuntime() {
  const { setSession, fetchProfile, session, profile, enterPreviewMode } = useAuthStore();
  const { quickReply, read, save } = useMessageStore();
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);
  const [fontsLoaded, fontError] = useFonts(customFonts);
  const [startupTimedOut, setStartupTimedOut] = useState(false);
  const [navigationReady, setNavigationReady] = useState(false);
  const [pendingWidgetUrl, setPendingWidgetUrl] = useState<string | null>(null);
  const appReady = fontsLoaded || Boolean(fontError) || startupTimedOut;
  const canHandleWidgetActions = Boolean(appReady && navigationReady && session && profile);

  const handleWidgetUrl = useCallback(
    async (url: string) => {
      const action = parseWidgetActionUrl(url);
      if (!action) return false;

      if (!canHandleWidgetActions) {
        setPendingWidgetUrl(url);
        return true;
      }

      try {
        if (action.type === "open") {
          navigationRef.current?.navigate("ReplyRoom", { signalId: action.signalId });
        } else if (action.type === "confirm") {
          await read(action.signalId);
          navigationRef.current?.navigate("ReplyRoom", { signalId: action.signalId });
        } else if (action.type === "save") {
          await save(action.signalId);
          navigationRef.current?.navigate("ReplyRoom", { signalId: action.signalId });
        } else {
          await quickReply(action.signalId, action.code);
          navigationRef.current?.navigate("ReplyRoom", { signalId: action.signalId });
        }
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

    Linking.getInitialURL()
      .then((url) => {
        if (!url) return;
        handleOAuthUrl(url).then((handled) => {
          if (!handled) handleWidgetUrl(url);
        });
      })
      .catch((err: any) => {
        console.warn("Initial link handling failed", err?.message ?? err);
      });

    let sub: { remove: () => void } | null = null;
    try {
      sub = Linking.addEventListener("url", handleUrl);
    } catch (err: any) {
      console.warn("Link listener unavailable", err?.message ?? err);
    }
    return () => sub?.remove();
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

  // App-level fetch so the tab badges (Today unread, Friends inbound) reflect
  // state from any tab, not only after visiting Today/People. Without this the
  // badges never appear: received/inbound stay empty until their own screen
  // mounts, and People marks inbound seen on mount.
  useEffect(() => {
    if (!profile?.id) return;
    const uid = profile.id;
    useMessageStore.getState().fetchReceived(uid).catch((err) =>
      console.warn("fetchReceived (app-level) failed", err?.message ?? err),
    );
    useFriendStore.getState().fetchInbound(uid).catch((err) =>
      console.warn("fetchInbound (app-level) failed", err?.message ?? err),
    );
    useMessageStore.getState().subscribeRealtime(uid);
    return () => useMessageStore.getState().unsubscribeRealtime();
  }, [profile?.id]);

  useEffect(() => {
    let sub: { remove: () => void } | null = null;
    try {
      sub = Notifications.addNotificationResponseReceivedListener((response) => {
        const signalId = getNotificationSignalId(response);
        if (signalId) navigationRef.current?.navigate("ReplyRoom", { signalId });
      });
    } catch (err: any) {
      console.warn("Notification response listener unavailable", err?.message ?? err);
    }
    return () => sub?.remove();
  }, []);

  useEffect(() => {
    if (isUiPreviewEnabled) {
      enterPreviewMode();
      return;
    }

    let subscription: { unsubscribe: () => void } | null = null;

    try {
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
    } catch (err: any) {
      console.warn("Initial auth session failed", err?.message ?? err);
      setSession(null);
    }

    try {
      const {
        data: { subscription: nextSubscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        if (session) fetchProfile();
      });
      subscription = nextSubscription;
    } catch (err: any) {
      console.warn("Auth state listener unavailable", err?.message ?? err);
    }

    return () => subscription?.unsubscribe();
  }, [enterPreviewMode, fetchProfile, setSession]);

  useEffect(() => {
    useThemeStore.getState().hydrate().catch((err) =>
      console.warn("Theme preference hydrate failed", err?.message ?? err),
    );
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => setStartupTimedOut(true), 2500);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (Platform.OS !== "web" || typeof document === "undefined") return;
    if (document.getElementById("beepget-tab-focus-reset")) return;

    const style = document.createElement("style");
    style.id = "beepget-tab-focus-reset";
    style.textContent =
      '[role="tab"]:focus,[role="tab"]:focus-visible,[role="button"]:focus,[role="button"]:focus-visible{outline:none!important;}';
    document.head.appendChild(style);
    return () => style.remove();
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
    <ThemeProvider>
      <NavigationContainer
        ref={navigationRef}
        linking={linking}
        onReady={() => setNavigationReady(true)}
      >
        <RootNavigator />
      </NavigationContainer>
      <OptionalUpdateBoundary>
        <UpdateBannerController />
      </OptionalUpdateBoundary>
    </ThemeProvider>
  );
}

function UpdateBannerController() {
  const [updateDismissed, setUpdateDismissed] = useState(false);
  const [updateReloading, setUpdateReloading] = useState(false);
  const updatesState = useUpdates();
  const forcePreviewUpdate =
    isUiPreviewEnabled &&
    Platform.OS === "web" &&
    (initialPreviewUpdateForced ||
      (typeof window !== "undefined" &&
        new URLSearchParams(window.location.search).has(FORCE_PREVIEW_UPDATE_PARAM)));
  const showUpdateBanner =
    (Boolean(updatesState.isUpdatePending) || forcePreviewUpdate) && !updateDismissed;

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

  return (
    <UpdateBannerSlip
      visible={showUpdateBanner}
      onReload={applyUpdate}
      onDismiss={() => setUpdateDismissed(true)}
      busy={updateReloading}
    />
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
