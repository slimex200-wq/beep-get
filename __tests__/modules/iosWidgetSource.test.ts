import { readFileSync } from "fs";
import path from "path";

describe("iOS widget source", () => {
  const widgetDir = path.join(process.cwd(), "targets/BeepWidgetExtension");
  const dataSource = readFileSync(
    path.join(process.cwd(), "modules/beep-widget/ios/BeepWidgetData.swift"),
    "utf8"
  );
  const mediumSource = readFileSync(path.join(widgetDir, "SwissPaperMediumView.swift"), "utf8");
  const smallSource = readFileSync(path.join(widgetDir, "SwissPaperSmallView.swift"), "utf8");
  const skinSource = readFileSync(path.join(widgetDir, "SkinTokens.swift"), "utf8");
  const widgetSource = readFileSync(path.join(widgetDir, "BeepWidget.swift"), "utf8");
  const pluginSource = readFileSync(
    path.join(process.cwd(), "modules/beep-widget/plugin/src/withBeepWidgetIOS.ts"),
    "utf8"
  );
  const widgetTargetConfig = readFileSync(
    path.join(process.cwd(), "targets/BeepWidgetExtension/expo-target.config.js"),
    "utf8"
  );
  const notificationTargetConfig = readFileSync(
    path.join(process.cwd(), "targets/BeepNotificationService/expo-target.config.js"),
    "utf8"
  );
  const appWidgetSource = readFileSync(path.join(process.cwd(), "src/components/WidgetCard.tsx"), "utf8");
  const appJson = readFileSync(path.join(process.cwd(), "app.json"), "utf8");
  const packageJson = readFileSync(path.join(process.cwd(), "package.json"), "utf8");

  it("keeps parity with the app and Android widget payload", () => {
    ["kind", "WidgetSignalTeaser", "WidgetActions", "quickReplyUrls"].forEach((token) => {
      expect(dataSource).toContain(token);
    });
  });

  it("routes widget taps through app-owned deep links", () => {
    // v6 redesign uses widgetURL only (Link removed for the simpler
    // single-tap-to-open Reply Room behavior).
    expect(mediumSource).toContain(".widgetURL");
    expect(smallSource).toContain(".widgetURL");
  });

  it("uses the full widget canvas instead of a nested card surface", () => {
    expect(widgetTargetConfig).toContain('deploymentTarget: "16.0"');
    expect(widgetSource).toContain("#available(iOSApplicationExtension 17.0, *)");
    expect(widgetSource).toContain("contentMarginsDisabledOnNewOperatingSystem");
    expect(widgetSource).toContain(".contentMarginsDisabled()");
    expect(widgetSource.indexOf("#available(iOSApplicationExtension 17.0, *)")).toBeLessThan(
      widgetSource.indexOf(".contentMarginsDisabled()")
    );
    expect(skinSource).toContain("containerBackground(for: .widget)");
    expect(mediumSource).not.toMatch(/frame\(width:\s*(200|240|260|280)/);
    expect(smallSource).not.toMatch(/frame\(width:\s*(200|240|260|280)/);
    expect(mediumSource).not.toContain("width: max(CGFloat(96), min(CGFloat(116), proxy.size.width * 0.30)), maxHeight:");
  });

  it("renders inline demo Blink preview frames in WidgetKit", () => {
    expect(mediumSource).toContain("DataBackedImage");
    expect(mediumSource).toContain("base64Encoded:");
    expect(smallSource).toContain("SignalSlotStrip");
  });

  it("generates native iOS extension targets for EAS prebuild", () => {
    expect(packageJson).toContain("@bacons/apple-targets");
    expect(appJson).toContain("@bacons/apple-targets");
    expect(appJson).toContain("YR267UY7UX");
    expect(appJson).toContain("group.com.beepget.shared");
    expect(widgetTargetConfig).toContain('type: "widget"');
    expect(widgetTargetConfig).toContain('bundleIdentifier: ".widget"');
    expect(notificationTargetConfig).toContain('type: "notification-service"');
    expect(notificationTargetConfig).toContain('bundleIdentifier: ".notificationservice"');
  });

  it("keeps the app group plugin focused on app-level entitlements", () => {
    expect(pluginSource).toContain("withEntitlementsPlist");
    expect(pluginSource).toContain("withInfoPlist");
    expect(pluginSource).not.toContain("withDangerousMod");
  });

  it("does not ship mojibake permission prompts", () => {
    expect(appJson).toContain("2 second Blink messages");
    expect(appJson).toContain("help find friends");
  });

  it("keeps the in-app widget preview aligned with native widget wording", () => {
    expect(appWidgetSource).toContain("Incoming Blink");
    expect(appWidgetSource).toContain("Incoming Beep");
    expect(appWidgetSource).toContain("OK");
    expect(appWidgetSource).toContain("OPEN");
  });
});
