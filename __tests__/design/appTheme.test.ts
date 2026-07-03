import {
  SIGNAL_COLOR_OPTIONS,
  darkPalette,
  getAppPalette,
  lightPalette,
  resolveThemeMode,
} from "@/design/appTheme";

describe("app light/dark palettes (Signal Edition 2026-07-02)", () => {
  it("keeps the warm paper + ink baseline as the light palette", () => {
    expect(lightPalette.mode).toBe("light");
    expect(lightPalette.background).toBe("#F2EDE2");
    expect(lightPalette.card).toBe("#FBF8F0");
    expect(lightPalette.text).toBe("#17150F");
    // Primary actions are ink, never a decorative accent.
    expect(lightPalette.primary).toBe("#17150F");
    expect(lightPalette.statusBar).toBe("dark");
    // The pastel-purple primary and purple-tinted chip are retired.
    expect(lightPalette.primary).not.toBe("#8F5EC7");
    expect(lightPalette.chip).not.toBe("#F4E9F8");
  });

  it("uses a calm warm near-black dark palette with a cream ink-inverted primary", () => {
    expect(darkPalette.mode).toBe("dark");
    expect(darkPalette.background).toBe("#100F0C");
    expect(darkPalette.card).toBe("#1A1915");
    expect(darkPalette.text).toBe("#F2EDE0");
    expect(darkPalette.primary).toBe("#F2EDE0");
    expect(darkPalette.statusBar).toBe("light");
    // Never the retired neon green / retro red surfaces.
    expect(darkPalette.primary).not.toBe("#92D66D");
    expect(darkPalette.primary).not.toBe("#D8361E");
  });

  it("reserves the signal color as its own token, defaulting to Signal Orange", () => {
    expect(lightPalette.sig).toBe("#FF4E1F");
    expect(darkPalette.sig).toBe("#FF5A26");
    expect(lightPalette.sigSoft).toBe("#FFE9E0");
    // The signal color never doubles as the primary action fill.
    expect(lightPalette.sig).not.toBe(lightPalette.primary);
    expect(darkPalette.sig).not.toBe(darkPalette.primary);
  });

  it("ships exactly two user-selectable signal colors: orange and violet", () => {
    expect(Object.keys(SIGNAL_COLOR_OPTIONS).sort()).toEqual(["orange", "violet"]);
    expect(SIGNAL_COLOR_OPTIONS.orange.label).toBe("Signal Orange");
    expect(SIGNAL_COLOR_OPTIONS.violet.label).toBe("Electric Violet");
    expect(SIGNAL_COLOR_OPTIONS.violet.light.sig).toBe("#7C3AED");
    expect(SIGNAL_COLOR_OPTIONS.violet.dark.sig).toBe("#A78BFA");
  });

  it("getAppPalette resolves mode and signal color; only sig/sigSoft vary by signal color", () => {
    expect(getAppPalette("light")).toEqual(lightPalette);
    expect(getAppPalette("dark")).toEqual(darkPalette);

    const violetLight = getAppPalette("light", "violet");
    expect(violetLight.sig).toBe("#7C3AED");
    expect(violetLight.sigSoft).toBe("#EFE7FD");
    // Chrome stays identical across signal colors.
    const { sig: _s1, sigSoft: _ss1, ...orangeChrome } = getAppPalette("light", "orange");
    const { sig: _s2, sigSoft: _ss2, ...violetChrome } = violetLight;
    expect(violetChrome).toEqual(orangeChrome);
  });
});

describe("resolveThemeMode", () => {
  it("follows the OS scheme for the system preference", () => {
    expect(resolveThemeMode("system", "dark")).toBe("dark");
    expect(resolveThemeMode("system", "light")).toBe("light");
    expect(resolveThemeMode("system", null)).toBe("light");
    expect(resolveThemeMode("system", undefined)).toBe("light");
  });

  it("lets explicit preferences override the OS scheme", () => {
    expect(resolveThemeMode("light", "dark")).toBe("light");
    expect(resolveThemeMode("dark", "light")).toBe("dark");
  });
});
