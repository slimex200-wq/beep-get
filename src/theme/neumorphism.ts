export interface SkinTheme {
  slug: string;
  name: string;
  colors: {
    background: string;
    surface: string;
    lcdBackground: string;
    lcdText: string;
    lcdSubtext: string;
    primary: string;
    secondary: string;
    accent: string;
    textPrimary: string;
    textSecondary: string;
    border: string;
  };
  shadows: {
    raised: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
    inset: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
  };
  spacing: { xs: number; sm: number; md: number; lg: number; xl: number };
  borderRadius: { sm: number; md: number; lg: number; round: number };
  fonts: { lcd: string; pixel: string; ui: string; mono: string };
}

// Retained for backward compatibility. The `neumorphism` palette const was
// removed in M4 (ThemeProvider drives light/dark SkinThemes from code), so the
// former `typeof neumorphism` type now aliases the SkinTheme shape it mirrored.
export type Theme = SkinTheme;
