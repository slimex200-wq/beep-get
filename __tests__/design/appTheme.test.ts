import { getAppPalette, isDarkSkin, normalizeSkinSlug } from "@/design/appTheme";

describe("app skin palettes", () => {
  it("maps identity pack aliases into the app skin palette system", () => {
    expect(normalizeSkinSlug("classic-paper")).toBe("swiss-paper");
    expect(normalizeSkinSlug("school-desk")).toBe("neumorphism");
    expect(normalizeSkinSlug("photo-booth-blink")).toBe("retro-future");
    expect(normalizeSkinSlug("night-signal")).toBe("cyber-neon");
  });

  it("gives each skin family a real app-level palette", () => {
    expect(getAppPalette("neumorphism").background).toBe("#ECE8E1");
    expect(getAppPalette("glassmorphism").primary).toBe("#6F8762");
    expect(getAppPalette("retro-future").mode).toBe("dark");
    expect(getAppPalette("cyber-neon").ruleStrong).toBe("rgba(146,214,109,0.42)");
  });

  it("keeps dark mode detection aligned with aliased packs", () => {
    expect(isDarkSkin("photo-booth-blink")).toBe(true);
    expect(isDarkSkin("night-signal")).toBe(true);
    expect(isDarkSkin("classic-paper")).toBe(false);
  });
});
