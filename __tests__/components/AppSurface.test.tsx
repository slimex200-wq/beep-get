import { shouldUseThemeBackground } from "@/components/AppSurface";
import { colors } from "@/design/tokens";

describe("AppSurface theme background resolution", () => {
  it("treats old light mockup paper colors as theme backgrounds", () => {
    expect(shouldUseThemeBackground()).toBe(true);
    expect(shouldUseThemeBackground(colors.paper)).toBe(true);
    expect(shouldUseThemeBackground(colors.ivory)).toBe(true);
    expect(shouldUseThemeBackground("#F8F6F1")).toBe(true);
    expect(shouldUseThemeBackground("#FBF7EF")).toBe(true);
  });

  it("keeps explicit non-theme backgrounds for special surfaces", () => {
    expect(shouldUseThemeBackground(colors.stage)).toBe(false);
    expect(shouldUseThemeBackground("#FF8FAB")).toBe(false);
  });
});
