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

const swissPaperPalette: AppPalette = {
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

const softPalette: AppPalette = {
  mode: "light",
  background: "#ECE8E1",
  card: "#F7F3EC",
  cardSoft: "#E8E1D8",
  input: "#E4DED4",
  chip: "#E9E4DD",
  text: "#14120F",
  muted: "#6E665C",
  muted2: "#8B8175",
  rule: "rgba(20,18,15,0.20)",
  ruleStrong: "rgba(20,18,15,0.38)",
  primary: "#14120F",
  primaryText: "#F8F2EA",
  statusBar: "dark",
};

const glassPalette: AppPalette = {
  mode: "light",
  background: "#F3F7F6",
  card: "#FBFFFF",
  cardSoft: "#EDF4F2",
  input: "#E7EFEC",
  chip: "#EEF6F3",
  text: "#0C1412",
  muted: "#60736D",
  muted2: "#7E918A",
  rule: "rgba(12,20,18,0.18)",
  ruleStrong: "rgba(12,20,18,0.34)",
  primary: "#6F8762",
  primaryText: "#F8FFF8",
  statusBar: "dark",
};

const retroPalette: AppPalette = {
  mode: "dark",
  background: "#211A15",
  card: "#2C231D",
  cardSoft: "#352A22",
  input: "#3A2F27",
  chip: "#3D3026",
  text: "#FFF5E4",
  muted: "#D8C8B4",
  muted2: "#A9917B",
  rule: "rgba(255,245,228,0.18)",
  ruleStrong: "rgba(255,245,228,0.36)",
  primary: "#D8361E",
  primaryText: "#FFF5E4",
  statusBar: "light",
};

const neonPalette: AppPalette = {
  mode: "dark",
  background: "#080A08",
  card: "#11150F",
  cardSoft: "#171D14",
  input: "#20271C",
  chip: "#202A1D",
  text: "#F8F2E8",
  muted: "#B9B0A3",
  muted2: "#89927C",
  rule: "rgba(248,242,232,0.18)",
  ruleStrong: "rgba(146,214,109,0.42)",
  primary: "#92D66D",
  primaryText: "#071006",
  statusBar: "light",
};

const paletteBySkin: Record<string, AppPalette> = {
  "swiss-paper": swissPaperPalette,
  neumorphism: softPalette,
  glassmorphism: glassPalette,
  "retro-future": retroPalette,
  "cyber-neon": neonPalette,
};

const skinAliases: Record<string, string> = {
  "classic-paper": "swiss-paper",
  "pixel-pager": "swiss-paper",
  "school-desk": "neumorphism",
  "cherry-dot": "glassmorphism",
  "photo-booth-blink": "retro-future",
  "night-signal": "cyber-neon",
};

export function normalizeSkinSlug(slug: string): string {
  return skinAliases[slug] ?? slug;
}

export function isDarkSkin(slug: string): boolean {
  const normalizedSlug = normalizeSkinSlug(slug);
  return normalizedSlug === "cyber-neon" || normalizedSlug === "retro-future";
}

export function getAppPalette(slug: string): AppPalette {
  return paletteBySkin[normalizeSkinSlug(slug)] ?? swissPaperPalette;
}

export function useAppPalette(): AppPalette {
  const slug = useSkinStore((state) => state.activeSkinSlug);
  return getAppPalette(slug);
}
