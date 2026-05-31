import { create } from "zustand";
import * as SecureStore from "expo-secure-store";

export type ThemePreference = "system" | "light" | "dark";

export const THEME_PREFERENCE_STORAGE_KEY = "beepget.theme_preference";

const VALID_PREFERENCES: readonly ThemePreference[] = ["system", "light", "dark"];

function isThemePreference(value: string | null | undefined): value is ThemePreference {
  return value != null && (VALID_PREFERENCES as readonly string[]).includes(value);
}

interface ThemeState {
  themePreference: ThemePreference;
  // `hydrated` flips true after the one-shot SecureStore read on app mount and is
  // never read by the UI (the first frame intentionally shows the "system"
  // default, then swaps once SecureStore resolves; the flash is rare). It only
  // guards `hydrate()` against re-running.
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setThemePreference: (preference: ThemePreference) => Promise<void>;
}

// NOTE: this store intentionally exposes no `reset()`. The theme preference is a
// device-level setting (OS color scheme + in-app toggle), not account state, so
// it must persist across logout and account switch. `resetUserStores()` in
// SettingsScreen deliberately omits it. (A `reset()` that cleared `hydrated`
// would also have been unsafe: App.tsx hydrates once on mount, so there is no
// re-hydrate path to reload SecureStore afterwards.)
export const useThemeStore = create<ThemeState>((set, get) => ({
  themePreference: "system",
  hydrated: false,

  hydrate: async () => {
    if (get().hydrated) return;
    try {
      const stored = await SecureStore.getItemAsync(THEME_PREFERENCE_STORAGE_KEY);
      if (isThemePreference(stored)) {
        set({ themePreference: stored, hydrated: true });
        return;
      }
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
}));
