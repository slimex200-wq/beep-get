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
    expect(source).toContain("SkinPackWidgetPreview");
    expect(source).toContain("identityPacks");
    expect(source).toContain("SignalPayloadPreview");
    expect(source).toContain("VideoSlotPreviewStrip");
    expect(source).toContain("DEMO_BLINK_FRAME_DATA_URIS");
    expect(source).toContain("skinPackVideoMeta");
    expect(source).toContain("PACK_VISUALS");
    expect(source).toContain("showAvatar={false}");
    expect(source).toContain("smallWidgetShell");
    expect(source).toContain("MediumWidgetMockup");
    expect(source).toContain("PREVIEW_STATES_BY_SIZE");
    expect(source).toContain('small: ["empty", "incoming-beep"]');
    expect(source).toContain('medium: ["empty", "incoming-blink"]');
    expect(source).toContain("coercePreviewStateForSize");
    expect(source).toContain("handleSizeChange");
    expect(source).toContain("previewStateLabel");
    expect(source).toContain("MediumSkinPackWidgetPreview");
    expect(source).toContain("skinPackWidgetSmall");
    expect(source).toContain("skinPackWidgetMedium");
    expect(source).toContain("Incoming");
    expect(source).toContain("SIGNAL SLOTS");
    expect(source).toContain("2.0s - MUTE");
    expect(source).toContain('size === "small"');
    expect(source).toContain('size === "medium"');
    expect(source).toContain("Skin Pack Preview");
    expect(source).toContain("KotlinHeader");
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
