import { readFileSync } from "fs";
import path from "path";

describe("WidgetStatesScreen platform setup copy", () => {
  it("keeps Android widget setup Android-first and tied to app-owned reply links", () => {
    const source = readFileSync(
      path.join(process.cwd(), "src/screens/WidgetStatesScreen.tsx"),
      "utf8"
    );

    [
      "INSTALL ON ANDROID",
      "Android launcher widget picker",
      "OK / reply / OPEN chips",
      "deep links",
      "idempotent quick replies",
    ].forEach((label) => {
      expect(source).toContain(label);
    });
  });

  it("keeps the iOS setup branch separate", () => {
    const source = readFileSync(
      path.join(process.cwd(), "src/screens/WidgetStatesScreen.tsx"),
      "utf8"
    );

    expect(source).toContain("INSTALL ON IOS");
    expect(source).toContain("iPhone Home Screen");
  });
});
