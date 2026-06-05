import { readFileSync } from "fs";
import path from "path";

describe("TodayScreen product sections", () => {
  it("keeps Today widget-first while preserving quick reply, queue, and widget mirror", () => {
    const source = readFileSync(path.join(process.cwd(), "src/screens/TodayScreen.tsx"), "utf8");

    [
      "Today",
      "Incoming Now",
      "Friend Pulse",
      "Widget Mirror",
      "Quick Reply",
      "Today Queue",
      "Done",
      "View",
      "TodayIncomingCard",
      "TodayMockupHeader",
      "TodaySectionHeader",
      "WidgetPreviewPanel",
      "FriendPulseCard",
      "SignalSlotRail",
      "buildQuickReplySlots",
      "quickReply",
    ].forEach((label) => {
      expect(source).toContain(label);
    });

    expect(source).toContain("useAppPalette");
    expect(source).toContain("backgroundColor={palette.background}");
    expect(source).toContain("statusBarStyle={palette.statusBar}");
    expect(source).toContain("paperMode");
    expect(source).toContain("compact");
    expect(source).toContain("오늘의 작은 신호");
    expect(source).toContain("홈 화면 나의 위젯");
    expect(source).not.toContain("TodaySupportDock");
    expect(source).not.toContain("widgetActionChip");
  });

  it("keeps received Blink frames in the compact Today card with theme-aware components", () => {
    const source = readFileSync(path.join(process.cwd(), "src/screens/TodayScreen.tsx"), "utf8");
    const incomingCardSource = readFileSync(path.join(process.cwd(), "src/components/TodayIncomingCard.tsx"), "utf8");
    const pulseSource = readFileSync(path.join(process.cwd(), "src/components/FriendPulseCard.tsx"), "utf8");

    expect(source).toContain("frameUris={latestMessage.media?.stripFrameUris}");
    expect(source).toContain("hasBlink={Boolean(latestSignal.hasBlink)}");
    expect(incomingCardSource).toContain("incomingRow");
    expect(incomingCardSource).toContain("replyRow");
    expect(incomingCardSource).toContain("MiniFrameStrip");
    expect(incomingCardSource).toContain("frameUris?.length");
    expect(incomingCardSource).toContain("useAppPalette");
    expect(pulseSource).toContain("useAppPalette");
    expect(incomingCardSource).toContain('accessibilityLabel="Open signal"');
    expect(incomingCardSource).toContain('accessibilityLabel="Mark signal done"');
    expect(incomingCardSource).not.toContain("ActionButton");
    expect(incomingCardSource).not.toContain("SignalCode");
    expect(incomingCardSource).not.toContain("StatusPill");
    expect(incomingCardSource).not.toContain("TodayFrameStrip");
    expect(incomingCardSource).not.toContain("mockupBlinkFrameUris");
    expect(incomingCardSource).not.toContain("playbackUri");
  });

  it("does not synthesize fake Today widget or friend pulse values without real signals", () => {
    const source = readFileSync(path.join(process.cwd(), "src/screens/TodayScreen.tsx"), "utf8");
    const widgetSource = readFileSync(path.join(process.cwd(), "src/components/WidgetPreviewPanel.tsx"), "utf8");

    expect(source).not.toContain('const fallbackCodes = ["OK", "8282", "BLINK"]');
    expect(source).not.toContain('latestSignal?.code ?? "8282"');
    expect(source).not.toContain('profile?.nickname?.trim() ?? "민아"');
    expect(source).toContain("if (!recentSignal) return []");
    expect(source).toContain('latestSignal?.code ?? "----"');
    expect(source).toContain('latestSignal?.sender ?? "No signal yet"');
    expect(widgetSource).not.toContain('{code || "8282"}');
    expect(widgetSource).not.toContain('{from || "민아"}');
  });
});
