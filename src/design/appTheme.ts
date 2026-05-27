import { useSkinStore } from "@/stores/skinStore";
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

const lightPalette: AppPalette = {
  mode: "light",
  background: "#F8F6F1",
  card: "#FFFFFF",
  cardSoft: "#F7F4EF",
  input: "#F0EEE9",
  chip: "#F1EEE8",
  text: colors.ink,
  muted: colors.muted,
  muted2: colors.muted2,
  rule: colors.rule,
  ruleStrong: colors.ruleStrong,
  primary: colors.ink,
  primaryText: colors.paperWarm,
  statusBar: "dark",
};

const darkPalette: AppPalette = {
  mode: "dark",
  background: "#11100E",
  card: "#1B1916",
  cardSoft: "#24211D",
  input: "#24211D",
  chip: "#2B2722",
  text: "#F8F2E8",
  muted: "#BDB3A5",
  muted2: "#8D8377",
  rule: "rgba(248,242,232,0.18)",
  ruleStrong: "rgba(248,242,232,0.34)",
  primary: "#F8F2E8",
  primaryText: "#11100E",
  statusBar: "light",
};

export function isDarkSkin(slug: string): boolean {
  return slug === "cyber-neon";
}

export function getAppPalette(slug: string): AppPalette {
  return isDarkSkin(slug) ? darkPalette : lightPalette;
}

export function useAppPalette(): AppPalette {
  const slug = useSkinStore((state) => state.activeSkinSlug);
  return getAppPalette(slug);
}
