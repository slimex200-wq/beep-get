import { useColorScheme, type ColorSchemeName } from "react-native";
import {
  useThemeStore,
  type SignalColor,
  type ThemePreference,
} from "@/stores/themeStore";

export type AppMode = "light" | "dark";
export type { SignalColor };

export type AppPalette = {
  mode: AppMode;
  background: string;
  card: string;
  cardSoft: string;
  input: string;
  chip: string;
  text: string;
  muted: string;
  muted2: string;
  rule: string;
  ruleStrong: string;
  /** Ink action fill: near-black in light, warm cream in dark. Primary actions never follow the signal color. */
  primary: string;
  primaryText: string;
  /** Signal Edition accent — reserved for signal semantics only: LED beacons, INCOMING labels, REC, selection rings, new-signal codes. */
  sig: string;
  /** Soft wash of `sig` for selection halos and badges. */
  sigSoft: string;
  /** Presence green (mockup `--good`) — online status dots only. */
  good: string;
  statusBar: "light" | "dark";
};

// Signal color options (user setting in My). Both ship; dark variants are
// brightened for contrast against the near-black chrome.
export const SIGNAL_COLOR_OPTIONS: Record<
  SignalColor,
  { label: string; light: { sig: string; sigSoft: string }; dark: { sig: string; sigSoft: string } }
> = {
  orange: {
    label: "Signal Orange",
    light: { sig: "#FF4E1F", sigSoft: "#FFE9E0" },
    dark: { sig: "#FF5A26", sigSoft: "#33201A" },
  },
  violet: {
    label: "Electric Violet",
    light: { sig: "#7C3AED", sigSoft: "#EFE7FD" },
    dark: { sig: "#A78BFA", sigSoft: "#2A2333" },
  },
};

// "Paper · Ink · Signal" (2026-07-02): warm paper background, ink-black primary
// actions, one signal accent reserved for signal semantics. Supersedes the
// pastel-purple primary from 2026-06-09.
const lightBase = {
  mode: "light" as const,
  background: "#F2EDE2",
  card: "#FBF8F0",
  cardSoft: "#EAE4D6",
  input: "#EFE9DB",
  chip: "#F1EBDD",
  text: "#17150F",
  muted: "#6B6659",
  muted2: "#A29B8A",
  rule: "rgba(23, 21, 15, 0.14)",
  ruleStrong: "rgba(23, 21, 15, 0.30)",
  primary: "#17150F",
  primaryText: "#F7F3E8",
  good: "#3BA55D",
  statusBar: "dark" as const,
};

// Dark mirrors the light ink/paper relationship inverted: near-black warm
// chrome, soft raised cards, cream text, cream primary fill.
const darkBase = {
  mode: "dark" as const,
  background: "#100F0C",
  card: "#1A1915",
  cardSoft: "#221F19",
  input: "#211F19",
  chip: "#252219",
  text: "#F2EDE0",
  muted: "#A39D8D",
  muted2: "#6B6659",
  rule: "rgba(242, 237, 224, 0.14)",
  ruleStrong: "rgba(242, 237, 224, 0.30)",
  primary: "#F2EDE0",
  primaryText: "#14130E",
  good: "#4CC272",
  statusBar: "light" as const,
};

export const lightPalette: AppPalette = {
  ...lightBase,
  ...SIGNAL_COLOR_OPTIONS.orange.light,
};

export const darkPalette: AppPalette = {
  ...darkBase,
  ...SIGNAL_COLOR_OPTIONS.orange.dark,
};

export function getAppPalette(mode: AppMode, signalColor: SignalColor = "orange"): AppPalette {
  const base = mode === "dark" ? darkBase : lightBase;
  const sig = SIGNAL_COLOR_OPTIONS[signalColor][mode];
  return { ...base, ...sig };
}

// Pure resolution of the effective light/dark mode. A "system" preference follows
// the OS color scheme (defaulting to light when the OS value is unavailable);
// explicit "light"/"dark" override it. Kept pure (no hooks) so it is directly
// unit-testable without rendering.
export function resolveThemeMode(
  preference: ThemePreference,
  systemScheme: ColorSchemeName,
): AppMode {
  if (preference === "light" || preference === "dark") return preference;
  return systemScheme === "dark" ? "dark" : "light";
}

// Resolves the effective light/dark mode from the user's theme preference and the
// OS color scheme.
export function useResolvedThemeMode(): AppMode {
  const preference = useThemeStore((state) => state.themePreference);
  const systemScheme = useColorScheme();
  return resolveThemeMode(preference, systemScheme);
}

export function useAppPalette(): AppPalette {
  const mode = useResolvedThemeMode();
  const signalColor = useThemeStore((state) => state.signalColor);
  return getAppPalette(mode, signalColor);
}
