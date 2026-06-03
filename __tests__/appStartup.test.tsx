import React from "react";
import { render, waitFor } from "@testing-library/react-native";
import * as Linking from "expo-linking";
import * as Notifications from "expo-notifications";
import * as SplashScreen from "expo-splash-screen";
import { useUpdates } from "expo-updates";
import { supabase } from "@/lib/supabase";
import { RootNavigator } from "@/navigation/RootNavigator";
import App from "../App";

jest.mock("expo-font", () => ({
  useFonts: jest.fn(() => [true, null]),
}));

jest.mock("expo-splash-screen", () => ({
  preventAutoHideAsync: jest.fn().mockResolvedValue(undefined),
  hideAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("expo-linking", () => ({
  createURL: jest.fn(() => "beepget://auth/callback"),
  getInitialURL: jest.fn().mockResolvedValue(null),
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
}));

jest.mock("expo-notifications", () => ({
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
}));

jest.mock("expo-updates", () => ({
  useUpdates: jest.fn(() => ({ isUpdatePending: false })),
  reloadAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@react-navigation/native", () => {
  const React = require("react");
  const { View } = require("react-native");

  return {
    NavigationContainer: ({
      children,
      onReady,
    }: {
      children: React.ReactNode;
      onReady?: () => void;
    }) => {
      React.useEffect(() => {
        onReady?.();
      }, [onReady]);
      return React.createElement(View, null, children);
    },
  };
});

jest.mock("@/navigation/RootNavigator", () => {
  return {
    RootNavigator: jest.fn(() => null),
  };
});

jest.mock("@/theme/ThemeProvider", () => {
  const React = require("react");

  return {
    ThemeProvider: ({ children }: { children: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
  };
});

jest.mock("@/theme/fonts", () => ({
  customFonts: {},
}));

jest.mock("@/components/UpdateBannerSlip", () => {
  const React = require("react");
  const { Text } = require("react-native");

  return {
    UpdateBannerSlip: () => React.createElement(Text, null, "UPDATE BANNER"),
  };
});

jest.mock("@/lib/widgetActions", () => ({
  parseWidgetActionUrl: jest.fn(() => null),
}));

jest.mock("@/services/authService", () => ({
  exchangeOAuthCodeFromUrl: jest.fn().mockResolvedValue(false),
}));

jest.mock("@/services/pushService", () => ({
  getNotificationSignalId: jest.fn(() => null),
  registerPushToken: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@/stores/authStore", () => ({
  useAuthStore: jest.fn(() => ({
    setSession: jest.fn(),
    fetchProfile: jest.fn(),
    session: null,
    profile: null,
  })),
}));

jest.mock("@/stores/friendStore", () => ({
  useFriendStore: {
    getState: jest.fn(() => ({
      fetchInbound: jest.fn().mockResolvedValue(undefined),
    })),
  },
}));

jest.mock("@/stores/messageStore", () => ({
  useMessageStore: Object.assign(
    jest.fn(() => ({
      quickReply: jest.fn().mockResolvedValue(undefined),
      read: jest.fn().mockResolvedValue(undefined),
      save: jest.fn().mockResolvedValue(undefined),
    })),
    {
      getState: jest.fn(() => ({
        fetchReceived: jest.fn().mockResolvedValue(undefined),
        subscribeRealtime: jest.fn(),
        unsubscribeRealtime: jest.fn(),
      })),
    },
  ),
}));

jest.mock("@/stores/themeStore", () => ({
  useThemeStore: {
    getState: jest.fn(() => ({
      hydrate: jest.fn().mockResolvedValue(undefined),
    })),
  },
}));

const createEventSubscription = () =>
  ({ remove: jest.fn() } as unknown as ReturnType<typeof Linking.addEventListener>);

const noPendingUpdateState = {
  currentlyRunning: {
    isEmbeddedLaunch: true,
    isEmergencyLaunch: false,
    emergencyLaunchReason: null,
  },
  isStartupProcedureRunning: false,
  isUpdateAvailable: false,
  isUpdatePending: false,
  isChecking: false,
  isDownloading: false,
  isRestarting: false,
  restartCount: 0,
};

describe("App startup crash isolation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(Linking.getInitialURL).mockRejectedValue(new Error("initial link exploded"));
    jest.mocked(Linking.addEventListener).mockImplementation(() => {
      throw new Error("link listener exploded");
    });
    jest
      .mocked(Notifications.addNotificationResponseReceivedListener)
      .mockImplementation(() => {
        throw new Error("notification listener exploded");
      });
    jest.mocked(useUpdates).mockImplementation(() => {
      throw new Error("updates hook exploded");
    });
    jest.spyOn(console, "warn").mockImplementation(() => undefined);
    jest.spyOn(console, "error").mockImplementation(() => undefined);

    jest.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    });
    jest.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
      data: {
        subscription: {
          id: "startup-test-subscription",
          callback: jest.fn(),
          unsubscribe: jest.fn(),
        },
      },
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders the startup navigator when initial link, link listener, notification listener, and update hook fail", async () => {
    render(<App />);

    await waitFor(() => expect(RootNavigator).toHaveBeenCalled());
    await waitFor(() =>
      expect(console.warn).toHaveBeenCalledWith(
        "Initial link handling failed",
        "initial link exploded",
      ),
    );

    expect(console.warn).toHaveBeenCalledWith(
      "Link listener unavailable",
      "link listener exploded",
    );
    expect(console.warn).toHaveBeenCalledWith(
      "Notification response listener unavailable",
      "notification listener exploded",
    );
    expect(console.warn).toHaveBeenCalledWith("Update banner disabled", "updates hook exploded");
    expect(SplashScreen.hideAsync).toHaveBeenCalled();
  });

  it("keeps the startup navigator alive when the auth state listener cannot register", async () => {
    jest.mocked(Linking.getInitialURL).mockResolvedValue(null);
    jest.mocked(Linking.addEventListener).mockReturnValue(createEventSubscription());
    jest
      .mocked(Notifications.addNotificationResponseReceivedListener)
      .mockReturnValue(createEventSubscription());
    jest.mocked(useUpdates).mockReturnValue(noPendingUpdateState);
    jest.mocked(supabase.auth.onAuthStateChange).mockImplementation(() => {
      throw new Error("auth listener exploded");
    });

    render(<App />);

    await waitFor(() => expect(RootNavigator).toHaveBeenCalled());
    expect(console.warn).toHaveBeenCalledWith(
      "Auth state listener unavailable",
      "auth listener exploded",
    );
    expect(SplashScreen.hideAsync).toHaveBeenCalled();
  });

  it("keeps the startup navigator alive when reading the initial auth session throws synchronously", async () => {
    jest.mocked(Linking.getInitialURL).mockResolvedValue(null);
    jest.mocked(Linking.addEventListener).mockReturnValue(createEventSubscription());
    jest
      .mocked(Notifications.addNotificationResponseReceivedListener)
      .mockReturnValue(createEventSubscription());
    jest.mocked(useUpdates).mockReturnValue(noPendingUpdateState);
    jest.mocked(supabase.auth.getSession).mockImplementation(() => {
      throw new Error("secure store exploded");
    });

    render(<App />);

    await waitFor(() => expect(RootNavigator).toHaveBeenCalled());
    expect(console.warn).toHaveBeenCalledWith(
      "Initial auth session failed",
      "secure store exploded",
    );
    expect(SplashScreen.hideAsync).toHaveBeenCalled();
  });
});
