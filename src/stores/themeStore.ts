import { create } from "zustand";
import * as SecureStore from "expo-secure-store";

export type ThemePreference = "system" | "light" | "dark";
export type SignalColor = "orange" | "violet";

export const THEME_PREFERENCE_STORAGE_KEY = "beepget.theme_preference";
export const SIGNAL_COLOR_STORAGE_KEY = "beepget.signal_color";

const VALID_PREFERENCES: readonly ThemePreference[] = ["system", "light", "dark"];
const VALID_SIGNAL_COLORS: readonly SignalColor[] = ["orange", "violet"];

function isThemePreference(value: string | null | undefined): value is ThemePreference {
  return value != null && (VALID_PREFERENCES as readonly string[]).includes(value);
}

function isSignalColor(value: string | null | undefined): value is SignalColor {
  return value != null && (VALID_SIGNAL_COLORS as readonly string[]).includes(value);
}

interface ThemeState {
  themePreference: ThemePreference;
  // Signal Edition: the one accent reserved for signal semantics (LED beacons,
  // INCOMING labels, REC, selection rings, new-signal codes). User-selectable in
  // My; both options ship. Primary actions stay ink and never follow this color.
  signalColor: SignalColor;
  // `hydrated` flips true after the one-shot SecureStore read on app mount and is
  // never read by the UI (the first frame intentionally shows the "system"
  // default, then swaps once SecureStore resolves; the flash is rare). It only
  // guards `hydrate()` against re-running.
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setThemePreference: (preference: ThemePreference) => Promise<void>;
  setSignalColor: (color: SignalColor) => Promise<void>;
}

// NOTE: this store intentionally exposes no `reset()`. The theme preference and
// signal color are device-level settings (OS color scheme + in-app toggles), not
// account state, so they must persist across logout and account switch.
// `resetUserStores()` in SettingsScreen deliberately omits them. (A `reset()`
// that cleared `hydrated` would also have been unsafe: App.tsx hydrates once on
// mount, so there is no re-hydrate path to reload SecureStore afterwards.)
export const useThemeStore = create<ThemeState>((set, get) => ({
  themePreference: "system",
  signalColor: "orange",
  hydrated: false,

  hydrate: async () => {
    if (get().hydrated) return;
    try {
      const [storedPreference, storedSignal] = await Promise.all([
        SecureStore.getItemAsync(THEME_PREFERENCE_STORAGE_KEY),
        SecureStore.getItemAsync(SIGNAL_COLOR_STORAGE_KEY),
      ]);
      set({
        ...(isThemePreference(storedPreference) ? { themePreference: storedPreference } : {}),
        ...(isSignalColor(storedSignal) ? { signalColor: storedSignal } : {}),
        hydrated: true,
      });
      return;
    } catch (err: any) {
      console.warn("Theme preference hydrate failed", err?.message ?? err);
    }
    set({ hydrated: true });
  },

  setThemePreference: async (preference) => {
    set({ themePreference: preference });
    try {
      await SecureStore.setItemAsync(THEME_PREFERENCE_STORAGE_KEY, preference);
    } catch (err: any) {
      console.warn("Theme preference persist failed", err?.message ?? err);
    }
  },

  setSignalColor: async (color) => {
    set({ signalColor: color });
    try {
      await SecureStore.setItemAsync(SIGNAL_COLOR_STORAGE_KEY, color);
    } catch (err: any) {
      console.warn("Signal color persist failed", err?.message ?? err);
    }
  },
}));
