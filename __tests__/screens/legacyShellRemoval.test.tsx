import { readFileSync } from "fs";
import path from "path";

const screen = (file: string) => readFileSync(path.join(process.cwd(), file), "utf8");

describe("legacy shell removal", () => {
  it("keeps widget tap reply room visually tied to the Today expanded card", () => {
    const source = screen("src/screens/SlipReplyRoomScreen.tsx");

    expect(source).toContain("DetailBlinkPreview");
    expect(source).toContain("DetailFrameStrip");
    expect(source).toContain("getMockupFriendPhotoUri");
    expect(source).toContain("SignalSlotRail");
    expect(source).toContain("confirmedSlot={quickReplyFeedback}");
    expect(source).toContain("XLineIcon");
    expect(source).not.toContain("KotlinHeader");
    expect(source).not.toContain("BlinkHeroPreview");
    expect(source).not.toContain("HeaderBar");
    expect(source).not.toContain("SignalSlip");
  });

  it("keeps account settings on the Kotlin mockup shell", () => {
    const source = screen("src/screens/SettingsScreen.tsx");

    expect(source).toContain("KotlinHeader");
    expect(source).toContain("My Beep ID");
    expect(source).toContain("Account Actions");
    expect(source).toContain("Privacy & Data");
    expect(source).not.toContain("HeaderBar");
    expect(source).not.toContain("My Beep Slip");
  });

  it("makes personalization an in-place identity pack flow instead of opening the old collection UI", () => {
    const source = screen("src/screens/MyScreen.tsx");

    expect(source).toContain("setLocalActiveIdentityPack");
    expect(source).toContain("applyIdentityPack");
    expect(source).toContain("Personalize");
    expect(source).toContain("Header opens Skin Packs");
    expect(source).toContain("SkinPackSheet");
    expect(source).not.toContain('navigation.navigate("Collection")');
  });
});
