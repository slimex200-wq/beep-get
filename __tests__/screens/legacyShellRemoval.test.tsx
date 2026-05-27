import { readFileSync } from "fs";
import path from "path";

const screen = (file: string) => readFileSync(path.join(process.cwd(), file), "utf8");

describe("legacy shell removal", () => {
  it("keeps widget tap reply room on the Kotlin mockup shell", () => {
    const source = screen("src/screens/SlipReplyRoomScreen.tsx");

    expect(source).toContain("KotlinHeader");
    expect(source).toContain("BlinkHeroPreview");
    expect(source).toContain("SignalSlotRail");
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

  it("makes appearance a real in-place theme toggle instead of opening the old collection UI", () => {
    const source = screen("src/screens/MyScreen.tsx");

    expect(source).toContain("setLocalActiveSkin");
    expect(source).toContain("Dark Pager Mode");
    expect(source).not.toContain('navigation.navigate("Collection")');
  });
});
