import { useColorScheme, type ColorSchemeName } from "react-native";
import { useThemeStore, type ThemePreference } from "@/stores/themeStore";
import { colors } from "@/design/tokens";

export type AppMode = "light" | "dark";

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
  primary: string;
  primaryText: string;
  statusBar: "light" | "dark";
};

export const lightPalette: AppPalette = {
  mode: "light",
  background: "#FBF7EF",
  card: "#FFFDF9",
  cardSoft: "#F7F1EA",
  input: "#F1ECE5",
  chip: "#F4E9F8",
  text: colors.ink,
  muted: colors.muted,
  muted2: colors.muted2,
  rule: "rgba(86, 63, 54, 0.16)",
  ruleStrong: "rgba(86, 63, 54, 0.30)",
  primary: "#8F5EC7",
  primaryText: "#FFFDF9",
  statusBar: "dark",
};

// Dark is a calm neutral dark (readability first). Deliberately NOT the old
// neon-green / retro-red dark skins: near-black warm-neutral background, soft
// raised cards, warm off-white text, and a light high-contrast primary fill that
// mirrors the light palette's ink/paper relationship inverted.
export const darkPalette: AppPalette = {
  mode: "dark",
  background: "#0E0F0E",
  card: "#17181A",
  cardSoft: "#1F2123",
  input: "#202225",
  chip: "#242629",
  text: "#F4F2EE",
  muted: "#A7A39B",
  muted2: "#7C7872",
  rule: "rgba(244,242,238,0.16)",
  ruleStrong: "rgba(244,242,238,0.32)",
  primary: "#E9E6E0",
  primaryText: "#17181A",
  statusBar: "light",
};

export function getAppPalette(mode: AppMode): AppPalette {
  return mode === "dark" ? darkPalette : lightPalette;
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
  return getAppPalette(mode);
}
