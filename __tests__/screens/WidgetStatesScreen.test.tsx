import { readFileSync } from "fs";
import path from "path";

describe("WidgetStatesScreen Kotlin mockup shell", () => {
  it("uses the current widget layout surface instead of the old setup page", () => {
    const source = readFileSync(
      path.join(process.cwd(), "src/screens/WidgetStatesScreen.tsx"),
      "utf8"
    );

    ["Widget Layouts", "Preview Size", "LIVE PREVIEW", "Widget State", "Quick Replies", "Skin Packs"].forEach((label) => {
      expect(source).toContain(label);
    });
    expect(source).toContain("WidgetSkinPackCard");
    expect(source).toContain("identityPacks");
    expect(source).toContain("applyIdentityPack");
    expect(source).toContain("activeIdentityPackSlug");
    expect(source).toContain("showAvatar={false}");
    expect(source).toContain("PREVIEW_STATES_BY_SIZE");
    expect(source).toContain('small: ["empty", "incoming-beep"]');
    expect(source).toContain('medium: ["empty", "incoming-blink"]');
    expect(source).toContain("coercePreviewStateForSize");
    expect(source).toContain("handleSizeChange");
    expect(source).toContain("previewStateLabel");
    expect(source).toContain("KotlinHeader");
    // The live preview now delegates to the single ActualWidgetPreview renderer
    // (Principle 6: Beep=SM, Blink=MD) instead of a screen-local mockup.
    expect(source).toContain("ActualWidgetPreview");
    expect(source).toContain('kind={size === "small" ? "beep" : "blink"}');
    expect(source).toContain('variant={previewState === "empty" ? "empty" : "filled"}');
    expect(source).not.toContain("MediumWidgetMockup");
    expect(source).not.toContain("smallWidgetShell");
    expect(source).not.toContain("MediumFrameStrip");
    expect(source).not.toContain("MediumQuickSlots");
    expect(source).not.toContain("getSkinPackCatalog");
    expect(source).not.toContain("getSkinPackMeta");
    expect(source).not.toContain("MediumBeepSquare");
    expect(source).not.toContain("BEEP SLOT");
    expect(source).not.toContain("HeaderBar");
    expect(source).not.toContain("INSTALL ON ANDROID");
    expect(source).not.toContain("iPhone Home Screen");
  });

  it("keeps the whole widget configuration in one scroll surface", () => {
    const source = readFileSync(
      path.join(process.cwd(), "src/screens/WidgetStatesScreen.tsx"),
      "utf8"
    );

    expect(source.indexOf("<ScrollView")).toBeLessThan(source.indexOf("<KotlinHeader"));
  });
});
