import { readFileSync } from "fs";
import path from "path";

describe("TodayScreen product sections", () => {
  it("keeps Today widget-first with incoming now, friend pulse, and widget mirror", () => {
    const source = readFileSync(path.join(process.cwd(), "src/screens/TodayScreen.tsx"), "utf8");

    [
      "Today",
      "Incoming Now",
      "Friend Pulse",
      "Widget Mirror",
      "Done",
      "View",
      "TodayIncomingCard",
      "TodayMockupHeader",
      "TodaySectionHeader",
      "WidgetPreviewPanel",
      "FriendPulseCard",
    ].forEach((label) => {
      expect(source).toContain(label);
    });

    expect(source).toContain("useAppPalette");
    expect(source).toContain("backgroundColor={palette.background}");
    expect(source).toContain("statusBarStyle={palette.statusBar}");
    expect(source).toContain("paperMode");
    expect(source).toContain("compact");
    expect(source).toContain("Latest signal");
    expect(source).toContain("Home screen preview");
    expect(source).not.toContain('<MockupSection label="Quick Reply"');
    expect(source).not.toContain("TodaySupportDock");
    expect(source).not.toContain("Quick Reply");
    expect(source).not.toContain("TODAY QUEUE");
    expect(source).not.toContain("widgetActionChip");
    expect(source).not.toContain('label: "Settings"');
    expect(source).not.toContain('accessibilityLabel: "Account settings"');
    expect(source).not.toContain('navigation.navigate("Account")');
    expect(source).not.toContain("GearLineIcon");
  });

  it("keeps received Blink frames in the widget mirror instead of the compact Today card", () => {
    const source = readFileSync(path.join(process.cwd(), "src/screens/TodayScreen.tsx"), "utf8");
    const incomingCardSource = readFileSync(path.join(process.cwd(), "src/components/TodayIncomingCard.tsx"), "utf8");
    const pulseSource = readFileSync(path.join(process.cwd(), "src/components/FriendPulseCard.tsx"), "utf8");

    expect(source).not.toContain("frameUris={latestMessage.media?.stripFrameUris}");
    expect(source).not.toContain("hasBlink={Boolean(latestSignal.hasBlink)}");
    expect(source).toContain("const latestFrameUris = latestMessage?.media?.stripFrameUris ?? undefined");
    expect(source).toContain("frameUris={latestFrameUris}");
    expect(source).toContain("skin={activePack}");
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
