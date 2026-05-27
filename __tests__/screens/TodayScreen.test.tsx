import { readFileSync } from "fs";
import path from "path";

describe("TodayScreen product sections", () => {
  it("keeps Today focused on latest signal, quick reply, and queue", () => {
    const source = readFileSync(path.join(process.cwd(), "src/screens/TodayScreen.tsx"), "utf8");
    ["Today", "Quick Reply", "Queue", "Done", "View", "BlinkHeroPreview"].forEach((label) => {
      expect(source).toContain(label);
    });
    expect(source).not.toContain("INCOMING NOW");
    expect(source).not.toContain("TODAY QUEUE");
    expect(source).not.toContain("FRIEND PULSE");
    expect(source).not.toContain("WIDGET MIRROR");
    expect(source).not.toContain("widgetActionChip");
  });

  it("puts the received Blink video media on the main Today card", () => {
    const source = readFileSync(path.join(process.cwd(), "src/screens/TodayScreen.tsx"), "utf8");
    const hero = readFileSync(path.join(process.cwd(), "src/components/BlinkHeroPreview.tsx"), "utf8");

    expect(source).toContain("playbackUri={latestMessage.media?.playbackUri}");
    expect(source).toContain("frameUris={latestMessage.media?.stripFrameUris}");
    expect(hero).toContain("VideoView");
    expect(hero).toContain("useVideoPlayer");
    expect(hero).toContain("Incoming Blink");
  });
});
