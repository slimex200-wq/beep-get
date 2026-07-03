import { readFileSync } from "fs";
import path from "path";

const readSource = (relativePath: string) =>
  readFileSync(path.join(process.cwd(), relativePath), "utf8");

describe("RootNavigator primary tabs", () => {
  it("locks the authenticated four-tab product model", () => {
    const source = readSource("src/navigation/RootNavigator.tsx");
    const tabBarSource = readSource("src/components/FixedTabBar.tsx");
    const modelSource = readSource("src/components/tabBar/model.ts");
    const combinedSource = `${source}\n${tabBarSource}\n${modelSource}`;

    expect(source).toContain('export const primaryTabLabels = ["TODAY", "SEND", "PEOPLE", "MY"] as const');
    expect(source).toContain("FixedTabBar");
    expect(source).toContain("tabBar={(props) => <FixedTabBar {...props} palette={themedPalette} />}");
    expect(combinedSource).toContain("TodayCalendarIcon");
    expect(combinedSource).toContain("SendPlaneIcon");
    expect(combinedSource).toContain("FriendsGroupIcon");
    expect(combinedSource).toContain("MyUserIcon");
    expect(combinedSource).toContain('Today: "TODAY"');
    expect(combinedSource).toContain('Compose: "SEND"');
    expect(combinedSource).toContain('People: "PEOPLE"');
    expect(combinedSource).toContain('My: "MY"');
    expect(combinedSource).not.toContain("tabGlyphs");
    expect(combinedSource).not.toContain('"LOGS", "STUDIO", "ACCOUNT"');
  });

  it("renders a quiet fixed bar: no glass, no More button, no secondary rail (Signal Edition 2026-07-02)", () => {
    const tabBarSource = readSource("src/components/FixedTabBar.tsx");

    expect(tabBarSource).toContain("MaterialTopTabBarProps");
    expect(tabBarSource).toContain("useSafeAreaInsets");
    expect(tabBarSource).toContain('testID="fixed-tab-bar"');
    expect(tabBarSource).toContain("testID={`fixed-tab-${visual.label}`}");
    // The old liquid-glass expandable nav is gone for good.
    expect(tabBarSource).not.toContain("MoreToggleButton");
    expect(tabBarSource).not.toContain("SecondaryActionRail");
    expect(tabBarSource).not.toContain("expanded");
    expect(tabBarSource).not.toContain("PanResponder");
    expect(tabBarSource).not.toContain("LiquidGlass");
    expect(tabBarSource).not.toContain("liquidGlassTokens");
    expect(tabBarSource).not.toContain("lobe");
    // Full-width quiet bar, not a floating pill.
    expect(tabBarSource).toContain("borderTopWidth: 1");
    expect(tabBarSource).not.toContain("borderRadius: 32");
    expect(tabBarSource).not.toContain("maxWidth: 430");
  });

  it("marks the active tab with ink text plus a signal dot, never a primary-color fill", () => {
    const tabBarSource = readSource("src/components/FixedTabBar.tsx");

    expect(tabBarSource).toContain("focused ? palette.text : palette.muted2");
    expect(tabBarSource).toContain("backgroundColor: palette.sig, opacity: focused ? 1 : 0");
    expect(tabBarSource).not.toContain("palette.primary");
  });

  it("keeps unread badges on Today and People as signal-color dots", () => {
    const tabBarSource = readSource("src/components/FixedTabBar.tsx");

    expect(tabBarSource).toContain("hasUnreadSignals");
    expect(tabBarSource).toContain("hasUnseenInbound");
    expect(tabBarSource).toContain("testID={`fixed-tab-badge-${visual.label}`}");
    expect(tabBarSource).toContain("unseenInboundCount(inboundSeenAt)");
  });

  it("dispatches TabActions.jumpTo scoped to the tab navigator state", () => {
    const tabBarSource = readSource("src/components/FixedTabBar.tsx");

    expect(tabBarSource).toContain("TabActions.jumpTo(route.name)");
    expect(tabBarSource).toContain("target: state.key");
    expect(tabBarSource).not.toContain("CommonActions.navigate");
  });

  it("routes incomplete profiles back to onboarding", () => {
    const source = readSource("src/navigation/RootNavigator.tsx");

    expect(source).toContain("profile.nickname?.trim()");
    expect(source).toContain("profile.avatar_url?.trim()");
    expect(source).toContain("needsOnboarding");
  });

  it("lets the UI preview user bypass broken login and profile completion gates", () => {
    const source = readSource("src/navigation/RootNavigator.tsx");

    expect(source).toContain("isUiPreviewUser");
    expect(source).toContain("const isPreviewSession");
    expect(source).toContain("isUiPreviewUser(profile?.id)");
    expect(source).toContain("const needsOnboarding =");
    expect(source).toContain("!isPreviewSession &&");
  });

  it("keeps UI preview tabs on the active theme palette", () => {
    const source = readSource("src/navigation/RootNavigator.tsx");

    expect(source).toContain("const themedPalette = useAppPalette()");
    expect(source).toContain("tabBar={(props) => <FixedTabBar {...props} palette={themedPalette} />}");
    expect(source).not.toContain("isPreviewSession ? lightPalette : themedPalette");
  });

  it("keeps Reply Room on the normal stack so View feels like Today detail", () => {
    const source = readSource("src/navigation/RootNavigator.tsx");
    const replyRoomBlock = source.slice(
      source.indexOf('name="ReplyRoom"'),
      source.indexOf('name="Logs"')
    );

    expect(replyRoomBlock).toContain("SlipReplyRoomScreen");
    expect(replyRoomBlock).not.toContain('presentation: "modal"');
  });

  it("pushes chevron-row drill-ins (Logs/Account/Dictionary) and keeps modal only for the Send compose task", () => {
    const source = readSource("src/navigation/RootNavigator.tsx");
    const sendBlock = source.slice(source.indexOf('name="Send"'), source.indexOf('name="ReplyRoom"'));
    const drillInBlock = source.slice(source.indexOf('name="Logs"'));

    expect(sendBlock).toContain('presentation: "modal"');
    expect(drillInBlock).not.toContain('presentation: "modal"');
  });

  it("does not register preview-only tooling as authenticated app screens", () => {
    const source = readSource("src/navigation/RootNavigator.tsx");

    expect(source).not.toContain('name="WidgetStates"');
    expect(source).not.toContain('name="StudioTools"');
    expect(source).not.toContain('name="Collection"');
    expect(source).not.toContain("WidgetStates:");
    expect(source).not.toContain("StudioTools:");
    expect(source).not.toContain("Collection:");
  });
});
