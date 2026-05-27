import { readFileSync } from "fs";
import path from "path";

describe("WidgetStatesScreen Kotlin mockup shell", () => {
  it("uses the current widget layout surface instead of the old setup page", () => {
    const source = readFileSync(
      path.join(process.cwd(), "src/screens/WidgetStatesScreen.tsx"),
      "utf8"
    );

    ["Widget Layouts", "Preview Size", "LIVE PREVIEW", "Widget State", "Quick Replies"].forEach((label) => {
      expect(source).toContain(label);
    });
    expect(source).toContain("KotlinHeader");
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
