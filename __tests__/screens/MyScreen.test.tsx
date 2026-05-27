import { readFileSync } from "fs";
import path from "path";

describe("MyScreen production tools", () => {
  it("surfaces the Kotlin mockup settings groups first", () => {
    const source = readFileSync(path.join(process.cwd(), "src/screens/MyScreen.tsx"), "utf8");

    [
      "My Settings",
      "APPEARANCE",
      "WIDGET LAYOUTS",
      "QUICK REPLIES",
      "Configure Slots",
      "SIGNAL DIRECTORY CODES",
    ].forEach((label) => {
      expect(source).toContain(label);
    });
    expect(source).not.toContain("MY BEEP ROOM");
  });

  it("does not expose internal Studio or Collection tools in the user room", () => {
    const source = readFileSync(path.join(process.cwd(), "src/screens/MyScreen.tsx"), "utf8");

    ["WIDGET SETUP", "CODES", "LOGS", "ACCOUNT"].forEach((label) => {
      expect(source).toContain(`label="${label}"`);
    });
    expect(source).not.toContain('label="STUDIO"');
    expect(source).not.toContain('label="COLLECTION"');
  });
});
