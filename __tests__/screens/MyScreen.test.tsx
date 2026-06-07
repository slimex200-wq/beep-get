import { readFileSync } from "fs";
import path from "path";

function readSource(relativePath: string) {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("MyScreen production tools", () => {
  it("surfaces My Beep Room as a compact photo-avatar room instead of a dense tool wall", () => {
    const source = readSource("src/screens/MyScreen.tsx");
    const combinedSource = [
      source,
      readSource("src/components/my/PhotoAvatarCard.tsx"),
      readSource("src/components/my/RoomStyleCard.tsx"),
      readSource("src/components/my/MyRoomToolsCard.tsx"),
      readSource("src/components/liquidTabBar/model.ts"),
    ].join("\n");

    [
      "My Beep Room",
      "Widget Preview",
      "Photo Avatar",
      "Decorate Photo",
      "Room Style",
      "Change Skin Pack",
      "Room Tools",
      "PhotoAvatarCard",
      "RoomStyleCard",
      "MyRoomToolsCard",
      "Widget Quick Replies",
      "Skin Packs",
      "Edit Replies",
      "Configure Widget Quick Replies",
      'label: "CODES"',
      'screen: "Dictionary"',
    ].forEach((label) => {
      expect(combinedSource).toContain(label);
    });
    expect(source.indexOf("<PhotoAvatarCard")).toBeLessThan(source.indexOf("<RoomStyleCard"));
    expect(source.indexOf("<RoomStyleCard")).toBeLessThan(source.indexOf("<MyRoomToolsCard"));
    expect(source).not.toContain('navigation.navigate("Account")');
    expect(source).not.toContain('navigation.navigate("Dictionary")');
    expect(source).not.toContain("MyBlinkThreeCutCard");
    expect(source).not.toContain("BlinkMemoriesCard");
    expect(source).not.toContain("My Blink 3-cut");
    expect(source).not.toContain("Blink Memories");
    expect(source).not.toContain("WidgetCommercePreviewStrip");
    expect(source).not.toContain("SkinPackPreviewGrid");
    expect(source).not.toContain("Widget Store Preview");
    expect(source).not.toContain('label: "Settings"');
    expect(source).not.toContain("Signal Code Dictionary");
    expect(source).not.toContain("Open Dictionary");
    expect(source).not.toContain("Account settings");
    expect(source).not.toContain('<MockupSection label="Account"');
    expect(source).not.toContain("privacy, logout, and app settings");
    expect(source).not.toContain("Define New Signal Token");
    expect(source).not.toContain("setAddCodeDialogVisible");
    expect(source).not.toContain("draftCode");
    expect(source).not.toContain("setDraftCode(value.replace(/[^0-9]/g, \"\"))");
  });

  it("does not expose internal Studio, Collection, or duplicate Settings tools in the user room", () => {
    const source = readSource("src/screens/MyScreen.tsx");
    const combinedSource = [
      source,
      readSource("src/components/my/PhotoAvatarCard.tsx"),
      readSource("src/components/my/RoomStyleCard.tsx"),
      readSource("src/components/my/MyRoomToolsCard.tsx"),
    ].join("\n");

    ["WidgetSkinPackCard"].forEach((label) => {
      expect(source).toContain(label);
    });
    ["SM Widget", "MD List Widget", "+ active preview", "3 queued slots", "WidgetStates"].forEach((label) => {
      expect(source).not.toContain(label);
    });
    expect(source).toContain("SkinPackSheet");
    expect(source).toContain("AvatarPickerSheet");
    expect(combinedSource).toContain("Decorate Photo Avatar");
    expect(combinedSource).toContain("Open Skin Pack picker");
    expect(combinedSource).toContain("Photo Avatar");
    expect(source).toContain("updateAvatar");
    expect(source).toContain("AVATAR_PRESETS");
    expect(source).toContain("chooseSkinPack");
    expect(source).toContain("Skin Pack Preview");
    expect(source).toContain("isIdentityPackStoreEnabled");
    expect(source).toContain("applyIdentityPack");
    expect(source).not.toContain("GearLineIcon");
    expect(source).toContain("quickReplyDrafts");
    expect(source).toContain("saveQuickReplySlots");
    expect(source).toContain("KeyboardAvoidingView");
    expect(source).not.toContain("editable={false}");
    expect(source).not.toContain("Switch");
    expect(source).not.toContain('label="STUDIO"');
    expect(source).not.toContain('label="COLLECTION"');
  });
});
