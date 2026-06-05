import { readFileSync } from "fs";
import path from "path";

describe("RootNavigator primary tabs", () => {
  it("locks the authenticated four-tab product model", () => {
    const source = readFileSync(path.join(process.cwd(), "src/navigation/RootNavigator.tsx"), "utf8");

    expect(source).toContain('export const primaryTabLabels = ["TODAY", "SEND", "PEOPLE", "MY"] as const');
    expect(source).toContain("TodayCalendarIcon");
    expect(source).toContain("SendPlaneIcon");
    expect(source).toContain("FriendsGroupIcon");
    expect(source).toContain("MyUserIcon");
    expect(source).toContain('Today: "TODAY"');
    expect(source).toContain('Compose: "SEND"');
    expect(source).toContain('People: "PEOPLE"');
    expect(source).toContain('My: "MY"');
    expect(source).not.toContain("tabGlyphs");
    expect(source).not.toContain('"LOGS", "STUDIO", "ACCOUNT"');
  });

  it("routes incomplete profiles back to onboarding", () => {
    const source = readFileSync(path.join(process.cwd(), "src/navigation/RootNavigator.tsx"), "utf8");

    expect(source).toContain("profile.nickname?.trim()");
    expect(source).toContain("profile.avatar_url?.trim()");
    expect(source).toContain("needsOnboarding");
  });

  it("lets the UI preview user bypass broken login and profile completion gates", () => {
    const source = readFileSync(path.join(process.cwd(), "src/navigation/RootNavigator.tsx"), "utf8");

    expect(source).toContain("isUiPreviewUser");
    expect(source).toContain("const isPreviewSession");
    expect(source).toContain("isUiPreviewUser(profile?.id)");
    expect(source).toContain("const needsOnboarding =");
    expect(source).toContain("!isPreviewSession &&");
  });

  it("keeps UI preview tabs on the light mockup palette", () => {
    const source = readFileSync(path.join(process.cwd(), "src/navigation/RootNavigator.tsx"), "utf8");

    expect(source).toContain("lightPalette");
    expect(source).toContain("const isPreviewSession = isUiPreviewUser(profileId)");
    expect(source).toContain("isPreviewSession ? lightPalette : themedPalette");
  });

  it("keeps Reply Room on the normal stack so View feels like Today detail", () => {
    const source = readFileSync(path.join(process.cwd(), "src/navigation/RootNavigator.tsx"), "utf8");
    const replyRoomBlock = source.slice(
      source.indexOf('name="ReplyRoom"'),
      source.indexOf('name="Logs"')
    );

    expect(replyRoomBlock).toContain("SlipReplyRoomScreen");
    expect(replyRoomBlock).not.toContain('presentation: "modal"');
  });

  it("does not register preview-only tooling as authenticated app screens", () => {
    const source = readFileSync(path.join(process.cwd(), "src/navigation/RootNavigator.tsx"), "utf8");

    expect(source).not.toContain('name="WidgetStates"');
    expect(source).not.toContain('name="StudioTools"');
    expect(source).not.toContain('name="Collection"');
    expect(source).not.toContain("WidgetStates:");
    expect(source).not.toContain("StudioTools:");
    expect(source).not.toContain("Collection:");
  });
});
