import React, { createContext, useContext } from "react";
import type { SkinTheme } from "@/theme/neumorphism";
import { useResolvedThemeMode, type AppMode } from "@/design/appTheme";

const sharedSpacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;
const sharedBorderRadius = { sm: 2, md: 14, lg: 22, round: 999 } as const;
const sharedFonts = {
  lcd: "IBMPlexMono",
  pixel: "Pretendard-SemiBold",
  ui: "Pretendard",
  mono: "IBMPlexMono",
} as const;

// Light/dark component themes. These drive the few leaf surfaces that read the
// SkinTheme (CodeInput, IconCard, QrScanner, StatusPicker, VibrationPicker) and
// stay in lockstep with the AppPalette light/dark system. The SkinTheme shape is
// unchanged so those consumers need no edits.
const lightSkinTheme: SkinTheme = {
  slug: "light",
  name: "Light",
  colors: {
    background: "#F8F6F1",
    surface: "#FFFFFF",
    lcdBackground: "#F2EDE4",
    lcdText: "#0A0A0A",
    lcdSubtext: "#68615A",
    primary: "#0A0A0A",
    secondary: "#6B6259",
    accent: "#D8361E",
    textPrimary: "#0A0A0A",
    textSecondary: "#6B6259",
    border: "rgba(10,10,10,0.22)",
  },
  // Soft natural card shadow. The earlier swiss-paper values (height 24 / radius
  // 70) were tuned for a full-bleed pager body, not the small leaf cards that read
  // SkinTheme, so they dropped an oversized shadow; these match the light ~height-4
  // drop-shadow level used elsewhere. `inset` stays flat (radius 0) on purpose so
  // CodeInput keeps its recessed-without-blur look.
  shadows: {
    raised: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
      elevation: 4,
    },
    inset: {
      shadowColor: "#0A0A0A",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.08,
      shadowRadius: 0,
      elevation: 0,
    },
  },
  spacing: { ...sharedSpacing },
  borderRadius: { ...sharedBorderRadius },
  fonts: { ...sharedFonts },
};

const darkSkinTheme: SkinTheme = {
  slug: "dark",
  name: "Dark",
  colors: {
    background: "#0E0F0E",
    surface: "#17181A",
    lcdBackground: "#202225",
    lcdText: "#F4F2EE",
    lcdSubtext: "#A7A39B",
    primary: "#E9E6E0",
    secondary: "#A7A39B",
    accent: "#D8361E",
    textPrimary: "#F4F2EE",
    textSecondary: "#A7A39B",
    border: "rgba(244,242,238,0.16)",
  },
  // Dark cards sit on a near-black background, so the shadow is a touch deeper and
  // wider than light but still a natural drop shadow, not the previous height-18 /
  // radius-40 halo. `inset` matches light (flat, radius 0).
  shadows: {
    raised: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.32,
      shadowRadius: 16,
      elevation: 6,
    },
    inset: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.2,
      shadowRadius: 0,
      elevation: 0,
    },
  },
  spacing: { ...sharedSpacing },
  borderRadius: { ...sharedBorderRadius },
  fonts: { ...sharedFonts },
};

export function getSkinTheme(mode: AppMode): SkinTheme {
  return mode === "dark" ? darkSkinTheme : lightSkinTheme;
}

const ThemeContext = createContext<SkinTheme>(lightSkinTheme);

export function useTheme(): SkinTheme {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const mode = useResolvedThemeMode();
  const theme = getSkinTheme(mode);

  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
}
