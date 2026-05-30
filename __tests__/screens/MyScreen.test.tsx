import { readFileSync } from "fs";
import path from "path";

describe("MyScreen production tools", () => {
  it("surfaces the Kotlin mockup settings groups first", () => {
    const source = readFileSync(path.join(process.cwd(), "src/screens/MyScreen.tsx"), "utf8");

    [
      "My Settings",
      "Profile",
      "Avatar lives here",
      "Edit Avatar",
      "Personalize",
      "Header opens Skin Packs",
      "Widget Skins",
      "Quick Replies",
      "Apply Pack",
      "Unlock Pack",
      "Configure Slots",
      "+ active preview",
      "3 queued slots",
      "Signal Directory (On-Demand)",
      "Define New Signal Token",
      "8282 / 집중중 🔕",
    ].forEach((label) => {
      expect(source).toContain(label);
    });
    expect(source).not.toContain("setDraftCode(value.replace(/[^0-9]/g, \"\"))");
    expect(source).not.toContain("MY BEEP ROOM");
  });

  it("does not expose internal Studio or Collection tools in the user room", () => {
    const source = readFileSync(path.join(process.cwd(), "src/screens/MyScreen.tsx"), "utf8");

    ["SM Widget", "MD List Widget", "SkinPackCard"].forEach((label) => {
      expect(source).toContain(label);
    });
    expect(source).toContain("SkinPackSheet");
    expect(source).toContain("AvatarPickerSheet");
    expect(source).toContain("Open skin packs");
    expect(source).toContain("Open Skin Pack picker");
    expect(source).toContain("Profile Avatar");
    expect(source).toContain("updateAvatar");
    expect(source).toContain("AVATAR_PRESETS");
    expect(source).toContain("chooseSkinPack");
    expect(source).toContain("Skin Pack Store");
    expect(source).toContain("applySkinPack");
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
