import { readFileSync } from "fs";
import path from "path";

describe("MyScreen production tools", () => {
  it("keeps My Beep Room quiet with widget, compact skin, quick reply, and account controls", () => {
    const source = readFileSync(path.join(process.cwd(), "src/screens/MyScreen.tsx"), "utf8");

    [
      "My Beep Room",
      "Widget Preview",
      "Edit Avatar",
      "Skin Pack",
      "Quick Reply Slots",
      "Account",
      "Skin Packs",
      "Configure Slots",
      "Signal Directory (On-Demand)",
      "Define New Signal Token",
    ].forEach((label) => {
      expect(source).toContain(label);
    });

    [
      "WidgetCommercePreviewStrip",
      "Widget Store Preview",
      "live widget examples",
      "SkinPackPreviewGrid",
      "MyBlinkThreeCutCard",
      "My Blink 3-cut",
    ].forEach((label) => {
      expect(source).not.toContain(label);
    });

    expect(source).not.toContain("setDraftCode(value.replace(/[^0-9]/g, \"\"))");
  });

  it("does not expose internal Studio or Collection tools in the user room", () => {
    const source = readFileSync(path.join(process.cwd(), "src/screens/MyScreen.tsx"), "utf8");

    ["WidgetSkinPackCard"].forEach((label) => {
      expect(source).toContain(label);
    });
    ["SM Widget", "MD List Widget", "+ active preview", "3 queued slots", "WidgetStates"].forEach((label) => {
      expect(source).not.toContain(label);
    });
    expect(source).toContain("SkinPackSheet");
    expect(source).toContain("AvatarPickerSheet");
    expect(source).toContain("Open skin packs");
    expect(source).toContain("Open Skin Pack picker");
    expect(source).toContain("Profile Avatar");
    expect(source).toContain("updateAvatar");
    expect(source).toContain("AVATAR_PRESETS");
    expect(source).toContain("chooseSkinPack");
    expect(source).toContain("Skin Pack Preview");
    expect(source).toContain("isIdentityPackStoreEnabled");
    expect(source).toContain("applyIdentityPack");
    expect(source).toContain("ChevronRightLineIcon");
    expect(source).toContain("GearLineIcon");
    expect(source).toContain("quickReplyDrafts");
    expect(source).toContain("saveQuickReplySlots");
    expect(source).toContain("KeyboardAvoidingView");
    expect(source).not.toContain("editable={false}");
    expect(source).not.toContain("Switch");
    expect(source).not.toContain('label="STUDIO"');
    expect(source).not.toContain('label="COLLECTION"');
  });
});
