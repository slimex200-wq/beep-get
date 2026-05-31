import {
  darkPalette,
  getAppPalette,
  lightPalette,
  resolveThemeMode,
} from "@/design/appTheme";

describe("app light/dark palettes", () => {
  it("keeps the Classic Paper baseline as the light palette", () => {
    expect(lightPalette.mode).toBe("light");
    expect(lightPalette.background).toBe("#F8F6F1");
    expect(lightPalette.card).toBe("#FFFFFF");
    expect(lightPalette.statusBar).toBe("dark");
  });

  it("uses a calm neutral dark palette (not the old neon/retro skins)", () => {
    expect(darkPalette.mode).toBe("dark");
    expect(darkPalette.background).toBe("#0E0F0E");
    expect(darkPalette.card).toBe("#17181A");
    expect(darkPalette.text).toBe("#F4F2EE");
    expect(darkPalette.statusBar).toBe("light");
    // Accent must stay neutral, never the retired neon green / retro red.
    expect(darkPalette.ruleStrong).not.toContain("146,214,109");
    expect(darkPalette.primary).not.toBe("#92D66D");
    expect(darkPalette.primary).not.toBe("#D8361E");
  });

  it("getAppPalette returns the palette for the resolved mode", () => {
    expect(getAppPalette("light")).toBe(lightPalette);
    expect(getAppPalette("dark")).toBe(darkPalette);
  });
});

describe("resolveThemeMode", () => {
  it("follows the OS color scheme when preference is system", () => {
    expect(resolveThemeMode("system", "dark")).toBe("dark");
    expect(resolveThemeMode("system", "light")).toBe("light");
  });

  it("defaults to light when the OS color scheme is unavailable", () => {
    expect(resolveThemeMode("system", null)).toBe("light");
    expect(resolveThemeMode("system", undefined)).toBe("light");
  });

  it("lets an explicit preference override the OS color scheme", () => {
    expect(resolveThemeMode("light", "dark")).toBe("light");
    expect(resolveThemeMode("dark", "light")).toBe("dark");
    expect(resolveThemeMode("dark", null)).toBe("dark");
    expect(resolveThemeMode("light", undefined)).toBe("light");
  });
});
