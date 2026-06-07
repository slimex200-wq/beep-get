import { readFileSync } from "fs";
import path from "path";

describe("SettingsScreen account surface", () => {
  it("uses modern settings rows instead of legacy stacked action buttons", () => {
    const source = readFileSync(path.join(process.cwd(), "src/screens/SettingsScreen.tsx"), "utf8");

    expect(source).toContain("SettingsActionRow");
    expect(source).toContain("AppearancePreferenceCard");
    expect(source).toContain("Account Actions");
    expect(source).toContain("Privacy & Data");
    expect(source).toContain("AppSurface backgroundColor={palette.background}");
    expect(source).toContain("KotlinHeader");
    expect(source).toContain("MockupCard");
    expect(source).not.toContain("ActionButton");
    expect(source).not.toContain("Choose the app theme.");
    expect(source).not.toContain("actionCard");
  });
});
