import { readFileSync } from "fs";
import path from "path";

describe("SettingsScreen account surface", () => {
  it("rebuilds account settings on the primitives vocabulary", () => {
    const source = readFileSync(path.join(process.cwd(), "src/screens/SettingsScreen.tsx"), "utf8");

    expect(source).toContain('from "@/ui/primitives"');
    expect(source).toContain('title="Account"');
    expect(source).toContain("<SectionLabel>My Beep ID</SectionLabel>");
    expect(source).toContain("Account Actions");
    expect(source).toContain("Privacy & Data");
    expect(source).toContain("<Card");
    expect(source).toContain("<ListRow");
    expect(source).toContain("<Segmented");
    expect(source).toContain("setThemePreference(preference)");
    expect(source).toContain("getAvatarImageSource");
    // Drill-in from a My chevron row: pushed with a back affordance, not a modal X.
    expect(source).toContain('backAccessibilityLabel="Back to My"');
    expect(source).toContain("onBack={closeToMy}");
    expect(source).not.toContain("XLineIcon");
    expect(source).toContain("Share Beep ID");
    expect(source).toContain("Log Out");
    expect(source).toContain("Privacy Policy");
    expect(source).toContain("Support");
    expect(source).toContain("Web Delete Request");
    expect(source).toContain("Delete Account");
    expect(source).not.toContain("KotlinMockupUI");
    expect(source).not.toContain("KotlinHeader");
    expect(source).not.toContain("MockupCard");
    expect(source).not.toContain("MockupSection");
    expect(source).not.toContain("TodayMockupChrome");
    expect(source).not.toContain("SendMockupControls");
    expect(source).not.toContain("ActionButton");
    expect(source).not.toContain("SettingsActionRow");
    expect(source).not.toContain("AppearancePreferenceCard");
    expect(source).not.toContain("Choose the app theme.");
    expect(source).not.toContain("actionCard");
    expect(source).not.toContain("colors.");
  });
});
