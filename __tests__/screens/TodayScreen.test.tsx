import { readFileSync } from "fs";
import path from "path";

describe("TodayScreen product sections", () => {
  it("keeps Today focused on latest signal, quick reply, and queue", () => {
    const source = readFileSync(path.join(process.cwd(), "src/screens/TodayScreen.tsx"), "utf8");
    ["Today", "Quick Reply", "Queue", "Done", "View", "TodayFrameStrip"].forEach((label) => {
      expect(source).toContain(label);
    });
    expect(source).toContain("showAvatar={false}");
    expect(source).not.toContain("INCOMING NOW");
    expect(source).not.toContain("TODAY QUEUE");
    expect(source).not.toContain("FRIEND PULSE");
    expect(source).not.toContain("WIDGET MIRROR");
    expect(source).not.toContain("widgetActionChip");
  });

  it("puts the received Blink frames on the main Today card", () => {
    const source = readFileSync(path.join(process.cwd(), "src/screens/TodayScreen.tsx"), "utf8");

    expect(source).toContain("TodayFrameStrip");
    expect(source).toContain("frameUris={latestMessage.media?.stripFrameUris}");
    expect(source).toContain("mockupBlinkFrameUris");
    expect(source).not.toContain("playbackUri={latestMessage.media?.playbackUri}");
  });
});
