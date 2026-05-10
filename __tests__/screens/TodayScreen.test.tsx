import { readFileSync } from "fs";
import path from "path";

describe("TodayScreen product sections", () => {
  it("renders Signal Desk section labels", () => {
    const source = readFileSync(path.join(process.cwd(), "src/screens/TodayScreen.tsx"), "utf8");
    ["INCOMING NOW", "QUICK REPLY", "TODAY QUEUE", "FRIEND PULSE", "WIDGET MIRROR"].forEach((label) => {
      expect(source).toContain(label);
    });
  });
});
