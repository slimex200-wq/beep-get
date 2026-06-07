import { readFileSync } from "fs";
import path from "path";

const source = readFileSync(
  path.join(process.cwd(), "src/components/WidgetSkinPackCard.tsx"),
  "utf8"
);
const visualSource = readFileSync(
  path.join(process.cwd(), "src/design/widgetSkinVisuals.ts"),
  "utf8"
);

describe("WidgetSkinPackCard shared identity-pack preview", () => {
  it("hosts the small/medium widget previews extracted from WidgetStates", () => {
    [
      "export function WidgetSkinPackCard",
      "SkinPackWidgetPreview",
      "MediumSkinPackWidgetPreview",
      "SignalPayloadPreview",
      "VideoSlotPreviewStrip",
      'from "@/design/widgetSkinVisuals"',
      "export { getPackVisual }",
      "skinPackWidgetSmall",
      "skinPackWidgetMedium",
      "skinPackVideoMeta",
      "DEMO_BLINK_FRAME_DATA_URIS",
      "Skin Pack",
    ].forEach((token) => {
      expect(source).toContain(token);
    });
    expect(visualSource).toContain("PACK_VISUALS");
  });

  it("renders against the identity pack model, not the palette skin model", () => {
    expect(source).toContain('from "@/design/identityPacks"');
    expect(source).toContain("IdentityPack");
    expect(source).not.toContain("getSkinPackMeta");
    expect(source).not.toContain("SkinPackItem");
  });

  it("drives owned/active labels from the identity pack price label", () => {
    expect(source).toContain('active ? "ACTIVE" : owned ? "OWNED" : lockedLabel ?? skin.priceLabel');
  });
});
