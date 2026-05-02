import React, { createContext, useContext } from "react";
import { useSkinStore } from "@/stores/skinStore";
import type { SkinTheme } from "@/theme/neumorphism";

import neumorphismSkin from "./skins/neumorphism.json";
import cyberNeonSkin from "./skins/cyber-neon.json";
import retroFutureSkin from "./skins/retro-future.json";
import glassmorphismSkin from "./skins/glassmorphism.json";
import swissPaperSkin from "./skins/swiss-paper.json";

const skinMap: Record<string, any> = {
  "swiss-paper": swissPaperSkin,
  neumorphism: neumorphismSkin,
  "cyber-neon": cyberNeonSkin,
  "retro-future": retroFutureSkin,
  glassmorphism: glassmorphismSkin,
};

function parseSkinJson(raw: any): SkinTheme {
  return {
    slug: raw.slug,
    name: raw.name,
    colors: raw.colors,
    shadows: {
      raised: {
        shadowColor: raw.shadows.raised.shadowColor,
        shadowOffset: {
          width: raw.shadows.raised.shadowOffsetX,
          height: raw.shadows.raised.shadowOffsetY,
        },
        shadowOpacity: raw.shadows.raised.shadowOpacity,
        shadowRadius: raw.shadows.raised.shadowRadius,
        elevation: raw.shadows.raised.elevation,
      },
      inset: {
        shadowColor: raw.shadows.inset.shadowColor,
        shadowOffset: {
          width: raw.shadows.inset.shadowOffsetX,
          height: raw.shadows.inset.shadowOffsetY,
        },
        shadowOpacity: raw.shadows.inset.shadowOpacity,
        shadowRadius: raw.shadows.inset.shadowRadius,
        elevation: raw.shadows.inset.elevation,
      },
    },
    spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
    borderRadius: raw.borderRadius,
    fonts: raw.fonts,
  };
}

export function getSkinTheme(slug: string): SkinTheme {
  const raw = skinMap[slug] ?? skinMap.neumorphism;
  return parseSkinJson(raw);
}

const ThemeContext = createContext<SkinTheme>(parseSkinJson(neumorphismSkin));

export function useTheme(): SkinTheme {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const activeSkinSlug = useSkinStore((s) => s.activeSkinSlug);
  const theme = getSkinTheme(activeSkinSlug);

  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
}
