export const neumorphism = {
  colors: {
    background: "#E8E8E8",
    surface: "#E0E0E0",
    lcdBackground: "#C8D8C0",
    lcdText: "#1A4A1A",
    lcdSubtext: "#3A7A3A",
    primary: "#6A6A8A",
    secondary: "#8A8AAA",
    accent: "#C47080",
    textPrimary: "#3A3A5A",
    textSecondary: "#8A8A9A",
    border: "rgba(180,160,220,0.2)",
  },
  shadows: {
    raised: {
      shadowColor: "#FFFFFF",
      shadowOffset: { width: -4, height: -4 },
      shadowOpacity: 0.7,
      shadowRadius: 6,
      elevation: 4,
    },
    raisedDark: {
      shadowColor: "#B8B8C8",
      shadowOffset: { width: 4, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 6,
      elevation: 4,
    },
    inset: {
      shadowColor: "#B8B8C8",
      shadowOffset: { width: 2, height: 2 },
      shadowOpacity: 0.4,
      shadowRadius: 4,
      elevation: 2,
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 8,
    md: 14,
    lg: 20,
    round: 999,
  },
  fonts: {
    lcd: "VT323",
    pixel: "Silkscreen",
    ui: "Inter",
    mono: "SpaceMono",
  },
} as const;

export type Theme = typeof neumorphism;
