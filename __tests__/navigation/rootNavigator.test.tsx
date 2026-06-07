import { readFileSync } from "fs";
import path from "path";

describe("RootNavigator primary tabs", () => {
  it("locks the authenticated four-tab product model", () => {
    const source = readFileSync(path.join(process.cwd(), "src/navigation/RootNavigator.tsx"), "utf8");
    const tabBarSource = readFileSync(path.join(process.cwd(), "src/components/LiquidExpandableTabBar.tsx"), "utf8");
    const tabBarModelSource = readFileSync(path.join(process.cwd(), "src/components/liquidTabBar/model.ts"), "utf8");
    const combinedSource = `${source}\n${tabBarSource}\n${tabBarModelSource}`;

    expect(source).toContain('export const primaryTabLabels = ["TODAY", "SEND", "PEOPLE", "MY"] as const');
    expect(source).toContain("LiquidExpandableTabBar");
    expect(source).toContain("tabBar={(props) => <LiquidExpandableTabBar {...props} palette={themedPalette} />}");
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

  it("keeps the app tab bar to one primary icon rail plus an integrated glass more rail", () => {
    const tabBarSource = readFileSync(path.join(process.cwd(), "src/components/LiquidExpandableTabBar.tsx"), "utf8");
    const tabBarItemSource = readFileSync(path.join(process.cwd(), "src/components/liquidTabBar/LiquidTabItem.tsx"), "utf8");
    const moreToggleSource = readFileSync(path.join(process.cwd(), "src/components/liquidTabBar/MoreToggleButton.tsx"), "utf8");
    const secondaryRailSource = readFileSync(path.join(process.cwd(), "src/components/liquidTabBar/SecondaryActionRail.tsx"), "utf8");
    const modelSource = readFileSync(path.join(process.cwd(), "src/components/liquidTabBar/model.ts"), "utf8");
    const combinedSource = `${tabBarSource}\n${tabBarItemSource}\n${moreToggleSource}\n${secondaryRailSource}\n${modelSource}`;

    expect(tabBarSource).toContain("BottomTabBarProps");
    expect(tabBarSource).toContain("useSafeAreaInsets");
    expect(combinedSource).toContain("liquid-tab-primary-rail");
    expect(tabBarSource).toContain("MoreToggleButton");
    expect(tabBarSource).toContain("SecondaryActionRail");
    expect(tabBarSource).toContain("const [expanded, setExpanded]");
    expect(tabBarSource).not.toContain("CommonActions.navigate");
    expect(tabBarItemSource).not.toContain("<Text");
    expect(combinedSource).toContain('accessibilityLabel="More tabs"');
    expect(combinedSource).toContain('accessibilityLabel="Close tabs"');
    expect(combinedSource).toContain('testID="liquid-tab-more-open"');
    expect(combinedSource).toContain('testID="liquid-tab-secondary-rail"');
    expect(combinedSource).not.toContain('testID="liquid-tab-secondary-popover"');
    expect(combinedSource).toContain("testID={`liquid-tab-secondary-${action.key}`}");
    expect(combinedSource).toContain("accessibilityElementsHidden={!expanded}");
    expect(combinedSource).toContain('importantForAccessibility={expanded ? "auto" : "no-hide-descendants"}');
    expect(combinedSource).toContain("SAVED");
    expect(combinedSource).toContain("SETTINGS");
    expect(combinedSource).toContain("CODES");
    expect(combinedSource).not.toContain("LOGS");
    expect(combinedSource).not.toContain("ACCOUNT");
    expect(combinedSource).not.toContain('navigation.navigate("More"');
  });

  it("keeps secondary actions as clearly named modal utilities, not duplicate primary tabs", () => {
    const modelSource = readFileSync(path.join(process.cwd(), "src/components/liquidTabBar/model.ts"), "utf8");

    expect(modelSource).toContain('key: "saved"');
    expect(modelSource).toContain('label: "SAVED"');
    expect(modelSource).toContain('screen: "Logs"');
    expect(modelSource).toContain('key: "settings"');
    expect(modelSource).toContain('label: "SETTINGS"');
    expect(modelSource).toContain('screen: "Account"');
    expect(modelSource).toContain('key: "codes"');
    expect(modelSource).toContain('label: "CODES"');
    expect(modelSource).toContain('screen: "Dictionary"');
    expect(modelSource).not.toContain('label: "LOGS"');
    expect(modelSource).not.toContain('label: "ACCOUNT"');
  });

  it("hides collapsed secondary actions from accessibility and maps secondary icons semantically", () => {
    const secondaryRailSource = readFileSync(path.join(process.cwd(), "src/components/liquidTabBar/SecondaryActionRail.tsx"), "utf8");
    const modelSource = readFileSync(path.join(process.cwd(), "src/components/liquidTabBar/model.ts"), "utf8");

    expect(secondaryRailSource).toContain("accessibilityElementsHidden={!expanded}");
    expect(secondaryRailSource).toContain('importantForAccessibility={expanded ? "auto" : "no-hide-descendants"}');
    expect(secondaryRailSource).toContain("{expanded");
    expect(secondaryRailSource).toContain("? secondaryActions.map");
    expect(secondaryRailSource).toContain("disabled={!expanded}");
    expect(modelSource).toContain("BookmarkLineIcon");
    expect(modelSource).toContain("HashLineIcon");
    expect(modelSource).toContain('{ key: "saved", label: "SAVED", screen: "Logs", Icon: BookmarkLineIcon }');
    expect(modelSource).toContain('{ key: "settings", label: "SETTINGS", screen: "Account", Icon: GearLineIcon }');
    expect(modelSource).toContain('{ key: "codes", label: "CODES", screen: "Dictionary", Icon: HashLineIcon }');
    expect(modelSource).not.toContain('{ key: "settings", label: "SETTINGS", screen: "Account", Icon: MyUserIcon }');
    expect(modelSource).not.toContain('{ key: "codes", label: "CODES", screen: "Dictionary", Icon: GearLineIcon }');
  });

  it("keeps More as an integrated rail slot and the extra tabs inside a merged expansion surface", () => {
    const moreToggleSource = readFileSync(path.join(process.cwd(), "src/components/liquidTabBar/MoreToggleButton.tsx"), "utf8");
    const secondaryRailSource = readFileSync(path.join(process.cwd(), "src/components/liquidTabBar/SecondaryActionRail.tsx"), "utf8");
    const stylesSource = readFileSync(path.join(process.cwd(), "src/components/liquidTabBar/styles.ts"), "utf8");
    const moreButtonBlock = stylesSource.slice(
      stylesSource.indexOf("moreButton: {"),
      stylesSource.indexOf("secondaryRail: {")
    );
    const secondaryActionBlock = stylesSource.slice(
      stylesSource.indexOf("secondaryAction: {"),
      stylesSource.indexOf("secondaryLabel: {")
    );

    expect(moreButtonBlock).toContain("width: 40");
    expect(moreButtonBlock).toContain("height: 64");
    expect(moreButtonBlock).toContain("borderWidth: 0");
    expect(moreButtonBlock).toContain('backgroundColor: "transparent"');
    expect(moreButtonBlock).not.toContain("borderRadius: 24");
    expect(moreToggleSource).not.toContain("backgroundColor, borderColor");
    expect(secondaryActionBlock).toContain("borderWidth: 0");
    expect(secondaryActionBlock).toContain('backgroundColor: "transparent"');
    expect(secondaryActionBlock).not.toContain("borderRadius: 20");
    expect(secondaryRailSource).not.toContain("expanded ? styles.secondaryRailExpanded : styles.secondaryRailCollapsed");
    expect(secondaryRailSource).toContain("railHeight");
    expect(secondaryRailSource).toContain("height: railHeight");
    expect(secondaryRailSource).toContain("outputRange: [-8, 0]");
    expect(secondaryRailSource).not.toContain("outputRange: [10, 0]");
    expect(stylesSource).toContain("secondaryRailExpanded");
    expect(stylesSource).toContain("height: 62");
    expect(secondaryRailSource).not.toContain("actionBackground");
    expect(secondaryRailSource).not.toContain("actionBorder");
  });

  it("expands More by growing the bottom tab pill instead of floating a separate card", () => {
    const tabBarSource = readFileSync(path.join(process.cwd(), "src/components/LiquidExpandableTabBar.tsx"), "utf8");
    const stylesSource = readFileSync(path.join(process.cwd(), "src/components/liquidTabBar/styles.ts"), "utf8");
    const pillIndex = tabBarSource.indexOf("styles.pill");
    const secondaryIndex = tabBarSource.indexOf("<SecondaryActionRail");
    const secondaryRailBlock = stylesSource.slice(
      stylesSource.indexOf("secondaryRail: {"),
      stylesSource.indexOf("secondaryRailExpanded: {")
    );

    expect(tabBarSource).toContain("expandedPillHeight");
    expect(tabBarSource).toContain("height: expandedPillHeight");
    expect(pillIndex).toBeGreaterThanOrEqual(0);
    expect(secondaryIndex).toBeGreaterThan(pillIndex);
    expect(secondaryRailBlock).toContain('width: "100%"');
    expect(secondaryRailBlock).toContain('backgroundColor: "transparent"');
    expect(secondaryRailBlock).not.toContain('position: "absolute"');
    expect(secondaryRailBlock).not.toContain("bottom: 76");
    expect(secondaryRailBlock).not.toContain("shadowOpacity");
    expect(secondaryRailBlock).not.toContain("elevation: 14");
  });

  it("uses a dark liquid glass material in dark mode instead of the bright preview tint", () => {
    const tabBarSource = readFileSync(path.join(process.cwd(), "src/components/LiquidExpandableTabBar.tsx"), "utf8");
    const stylesSource = readFileSync(path.join(process.cwd(), "src/components/liquidTabBar/styles.ts"), "utf8");
    const combinedSource = `${tabBarSource}\n${stylesSource}`;

    expect(combinedSource).toContain("darkLiquidGlassBackground");
    expect(combinedSource).toContain("darkLiquidGlassWash");
    expect(combinedSource).toContain("darkLiquidGlassLobe");
    expect(combinedSource).toContain("lightLiquidGlassBackground");
    expect(combinedSource).toContain("lightLiquidGlassWash");
    expect(combinedSource).toContain("lightLiquidGlassLobe");
    expect(tabBarSource).not.toContain("? liquidGlassTokens.bar.backgroundTinted");
    expect(tabBarSource).not.toContain("? liquidGlassTokens.lobe.backgroundTinted");
    expect(combinedSource).not.toContain('rgba(28,120,255,0.22)');
    expect(combinedSource).not.toContain('rgba(87,211,255,0.10)');
    expect(combinedSource).not.toContain('rgba(80,103,103,0.22)');
  });

  it("uses theme-matched liquid glass material instead of a black capsule", () => {
    const tabBarSource = readFileSync(path.join(process.cwd(), "src/components/LiquidExpandableTabBar.tsx"), "utf8");
    const stylesSource = readFileSync(path.join(process.cwd(), "src/components/liquidTabBar/styles.ts"), "utf8");
    const combinedSource = `${tabBarSource}\n${stylesSource}`;

    expect(stylesSource).toContain("height: 64");
    expect(stylesSource).toContain("borderRadius: 32");
    expect(stylesSource).toContain("maxWidth: 430");
    expect(stylesSource).toContain("liquidLobe");
    const lobeBlock = stylesSource.slice(
      stylesSource.indexOf("liquidLobe: {"),
      stylesSource.indexOf("iconWrap: {")
    );

    expect(lobeBlock).toContain("top: -1");
    expect(lobeBlock).toContain("height: 66");
    expect(lobeBlock).toContain("borderRadius: 33");
    expect(combinedSource).toContain("lightLiquidGlassBackground");
    expect(combinedSource).toContain("lightLiquidGlassLobe");
    expect(combinedSource).toContain("darkLiquidGlassBackground");
    expect(combinedSource).toContain("darkLiquidGlassLobe");
    expect(combinedSource).toContain('rgba(255,255,255,0.82)');
    expect(combinedSource).toContain('rgba(255,255,255,0.96)');
    expect(combinedSource).not.toContain('rgba(16,16,18,0.46)');
    expect(combinedSource).not.toContain('rgba(255,255,255,0.62)');
    expect(combinedSource).not.toContain('rgba(255,255,255,0.54)');
  });

  it("renders the bottom navigation with a simple Apple-style liquid lobe", () => {
    const tabBarSource = readFileSync(path.join(process.cwd(), "src/components/LiquidExpandableTabBar.tsx"), "utf8");
    const tabBarItemSource = readFileSync(path.join(process.cwd(), "src/components/liquidTabBar/LiquidTabItem.tsx"), "utf8");
    const stylesSource = readFileSync(path.join(process.cwd(), "src/components/liquidTabBar/styles.ts"), "utf8");
    const combinedSource = `${tabBarSource}\n${tabBarItemSource}\n${stylesSource}`;

    expect(tabBarSource).toContain("styles.borrowedColorWash");
    expect(tabBarSource).toContain("styles.glassCompensation");
    expect(tabBarSource).toContain("styles.glassEdgeGlow");
    expect(tabBarSource).toContain('testID="liquid-tab-surface"');
    expect(combinedSource).toContain("styles.liquidLobe");
    expect(combinedSource).toContain('testID="liquid-tab-lobe"');
    expect(combinedSource).not.toContain("styles.convexLens");
    expect(combinedSource).not.toContain("styles.convexLensMatte");
    expect(combinedSource).not.toContain("styles.convexLensHighlight");
    expect(combinedSource).not.toContain("styles.convexLensBulge");
    expect(combinedSource).not.toContain("styles.convexLensShade");
    expect(combinedSource).not.toContain("lensRailTranslateX");
    expect(combinedSource).not.toContain("lensRailScale");
    expect(tabBarItemSource).toContain("rgba(255,255,255,0.82)");
    expect(tabBarItemSource).not.toContain("palette.text");
    expect(combinedSource).toContain("readonly palette: AppPalette");
  });

  it("moves the bottom tab lobe between primary tabs with spring glass motion", () => {
    const tabBarSource = readFileSync(path.join(process.cwd(), "src/components/LiquidExpandableTabBar.tsx"), "utf8");
    const tabBarItemSource = readFileSync(path.join(process.cwd(), "src/components/liquidTabBar/LiquidTabItem.tsx"), "utf8");
    const stylesSource = readFileSync(path.join(process.cwd(), "src/components/liquidTabBar/styles.ts"), "utf8");
    const lobeHookSource = readFileSync(path.join(process.cwd(), "src/components/liquidTabBar/useLiquidTabLobe.ts"), "utf8");
    const combinedSource = `${tabBarSource}\n${tabBarItemSource}\n${stylesSource}\n${lobeHookSource}`;

    expect(lobeHookSource).toContain("snapLobeToIndex");
    expect(lobeHookSource).toContain("Animated.sequence");
    expect(lobeHookSource).toContain("lobeStretch");
    expect(lobeHookSource).toContain("onTabLayout");
    expect(tabBarSource).toContain("useLiquidTabLobe");
    expect(tabBarSource).not.toContain("useConvexTabLens");
    expect(tabBarItemSource).toContain("readonly onLayout");
    expect(combinedSource).toContain("styles.liquidLobe");
    expect(combinedSource).not.toContain("styles.convexLens");
    expect(combinedSource).not.toContain("PanResponder.create");
    expect(combinedSource).not.toContain("matteLensFill");
    expect(combinedSource).not.toContain("darkGlassBackground");
  });

  it("does not duplicate the tab rail inside the moving lobe", () => {
    const tabBarSource = readFileSync(path.join(process.cwd(), "src/components/LiquidExpandableTabBar.tsx"), "utf8");
    const tabBarItemSource = readFileSync(path.join(process.cwd(), "src/components/liquidTabBar/LiquidTabItem.tsx"), "utf8");
    const stylesSource = readFileSync(path.join(process.cwd(), "src/components/liquidTabBar/styles.ts"), "utf8");
    const combinedSource = `${tabBarSource}\n${tabBarItemSource}\n${stylesSource}`;

    expect(combinedSource).not.toContain("lensRailTranslateX");
    expect(combinedSource).not.toContain("lensRailScale");
    expect(combinedSource).not.toContain("lensRailOpacity");
    expect(combinedSource).not.toContain("tabRailWidth");
    expect(combinedSource).not.toContain("styles.convexLensRail");
    expect(combinedSource).not.toContain("styles.convexLensTabButton");
    expect(combinedSource).not.toContain("key={`lens-${route.key}`}");
    expect(combinedSource).toContain('testID="liquid-tab-bar"');
    expect(combinedSource).toContain('testID="liquid-tab-primary-rail"');
    expect(combinedSource).toContain('testID="liquid-tab-lobe"');
    expect(combinedSource).not.toContain('testID="liquid-tab-lens"');
    expect(combinedSource).not.toContain('testID="liquid-tab-lens-duplicate-rail"');
    expect(combinedSource).not.toContain("testID={`liquid-tab-lens-copy-${visual.label}`}");
    expect(combinedSource).toContain("testID={`liquid-tab-${label}`}");
    expect(combinedSource).toContain("importantForAccessibility=\"no-hide-descendants\"");
    expect(combinedSource).toContain("accessibilityElementsHidden");
    expect(tabBarSource).not.toContain("<Text");
    expect(stylesSource).not.toContain("convexLensLabel");
    expect(stylesSource).toContain("overflow: \"hidden\"");
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

  it("keeps UI preview tabs on the active theme palette", () => {
    const source = readFileSync(path.join(process.cwd(), "src/navigation/RootNavigator.tsx"), "utf8");

    expect(source).toContain("const themedPalette = useAppPalette()");
    expect(source).toContain("tabBar={(props) => <LiquidExpandableTabBar {...props} palette={themedPalette} />}");
    expect(source).not.toContain("isPreviewSession ? lightPalette : themedPalette");
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
