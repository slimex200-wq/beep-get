import { readFileSync } from "fs";
import path from "path";

describe("iOS widget source", () => {
  const widgetDir = path.join(process.cwd(), "modules/beep-widget/ios/BeepWidget");
  const dataSource = readFileSync(
    path.join(process.cwd(), "modules/beep-widget/ios/BeepWidgetData.swift"),
    "utf8"
  );
  const mediumSource = readFileSync(path.join(widgetDir, "SwissPaperMediumView.swift"), "utf8");
  const smallSource = readFileSync(path.join(widgetDir, "SwissPaperSmallView.swift"), "utf8");
  const pluginSource = readFileSync(
    path.join(process.cwd(), "modules/beep-widget/plugin/src/withBeepWidgetIOS.ts"),
    "utf8"
  );
  const appWidgetSource = readFileSync(path.join(process.cwd(), "src/components/WidgetCard.tsx"), "utf8");
  const appJson = readFileSync(path.join(process.cwd(), "app.json"), "utf8");

  it("keeps parity with the app and Android widget payload", () => {
    ["kind", "WidgetSignalTeaser", "WidgetActions", "quickReplyUrls"].forEach((token) => {
      expect(dataSource).toContain(token);
    });
  });

  it("routes widget taps through app-owned deep links", () => {
    expect(mediumSource).toContain("Link(destination:");
    expect(mediumSource).toContain(".widgetURL");
    expect(smallSource).toContain(".widgetURL");
  });

  it("copies shared widget data into extension source folders", () => {
    expect(pluginSource).toContain("copySharedWidgetData(moduleSrcDir, widgetDstDir)");
    expect(pluginSource).toContain("copySharedWidgetData(moduleSrcDir, notifDstDir)");
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
