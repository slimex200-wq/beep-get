import { readFileSync } from "fs";
import path from "path";

describe("TodayScreen product sections", () => {
  it("keeps Today focused on latest signal, quick reply, and queue", () => {
    const source = readFileSync(path.join(process.cwd(), "src/screens/TodayScreen.tsx"), "utf8");
    ["Today", "Quick Reply", "Queue", "Done", "View", "MiniFrameStrip"].forEach((label) => {
      expect(source).toContain(label);
    });
    expect(source).not.toContain("INCOMING NOW");
    expect(source).not.toContain("TODAY QUEUE");
    expect(source).not.toContain("FRIEND PULSE");
    expect(source).not.toContain("WIDGET MIRROR");
    expect(source).not.toContain("widgetActionChip");
  });
});
