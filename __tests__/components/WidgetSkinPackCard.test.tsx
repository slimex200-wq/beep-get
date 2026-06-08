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
  it("delegates the small/medium widget preview to the single ActualWidgetPreview renderer", () => {
    [
      "export function WidgetSkinPackCard",
      "ActualWidgetPreview",
      'from "@/components/ActualWidgetPreview"',
      'from "@/design/widgetSkinVisuals"',
      "export { getPackVisual }",
      "Skin Pack",
    ].forEach((token) => {
      expect(source).toContain(token);
    });
    expect(visualSource).toContain("PACK_VISUALS");
  });

  it("no longer keeps a screen-local copy of the medium/small grid", () => {
    [
      "SkinPackWidgetPreview",
      "MediumSkinPackWidgetPreview",
      "SignalPayloadPreview",
      "VideoSlotPreviewStrip",
      "skinPackWidgetSmall",
      "skinPackWidgetMedium",
      "skinPackMediumStatus",
      "skinPackVideoMeta",
    ].forEach((token) => {
      expect(source).not.toContain(token);
    });
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
