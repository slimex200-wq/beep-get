import { readFileSync } from "fs";
import path from "path";

describe("RootNavigator primary tabs", () => {
  it("locks the authenticated four-tab product model", () => {
    const source = readFileSync(path.join(process.cwd(), "src/navigation/RootNavigator.tsx"), "utf8");

    expect(source).toContain('export const primaryTabLabels = ["TODAY", "SEND", "FRIENDS", "MY"] as const');
    expect(source).toContain("TodayCalendarIcon");
    expect(source).toContain("SendPlaneIcon");
    expect(source).toContain("FriendsGroupIcon");
    expect(source).toContain("MyUserIcon");
    expect(source).toContain('Today: "Today"');
    expect(source).toContain('Compose: "Send"');
    expect(source).toContain('People: "Friends"');
    expect(source).toContain('My: "My"');
    expect(source).not.toContain("tabGlyphs");
    expect(source).not.toContain('"LOGS", "STUDIO", "ACCOUNT"');
  });

  it("routes incomplete profiles back to onboarding", () => {
    const source = readFileSync(path.join(process.cwd(), "src/navigation/RootNavigator.tsx"), "utf8");

    expect(source).toContain("profile.nickname?.trim()");
    expect(source).toContain("profile.avatar_url?.trim()");
    expect(source).toContain("needsOnboarding");
  });

  it("keeps Reply Room on the normal stack so View feels like Today detail", () => {
    const source = readFileSync(path.join(process.cwd(), "src/navigation/RootNavigator.tsx"), "utf8");
    const replyRoomBlock = source.slice(
      source.indexOf('name="ReplyRoom"'),
      source.indexOf('name="WidgetStates"')
    );

    expect(replyRoomBlock).toContain("SlipReplyRoomScreen");
    expect(replyRoomBlock).not.toContain('presentation: "modal"');
  });
});
