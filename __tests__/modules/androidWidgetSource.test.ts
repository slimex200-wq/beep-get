import { readFileSync } from "fs";
import path from "path";

describe("Android widget source", () => {
  const widgetDir = path.join(
    process.cwd(),
    "modules/beep-widget/android/src/main/java/expo/modules/beepwidget"
  );
  const mediumSource = readFileSync(path.join(widgetDir, "BeepWidgetMedium.kt"), "utf8");
  const smallSource = readFileSync(path.join(widgetDir, "BeepWidgetSmall.kt"), "utf8");
  const actionsSource = readFileSync(path.join(widgetDir, "WidgetActions.kt"), "utf8");
  const displaySource = readFileSync(path.join(widgetDir, "LcdComposable.kt"), "utf8");

  it("routes widget taps through app-owned deep links", () => {
    expect(actionsSource).toContain("Intent.ACTION_VIEW");
    expect(actionsSource).toContain("Uri.parse(url)");
    expect(actionsSource).toContain("setPackage(context.packageName)");
    expect(smallSource).toContain("openReplyRoomUrl");
    expect(displaySource).toContain("openWidgetUrlAction(url)");
  });

  it("keeps the medium widget reply chip row visible", () => {
    expect(mediumSource).toContain("showActions = true");
    ["OK", "OPEN", "quickReplyUrls"].forEach((token) => {
      expect(displaySource).toContain(token);
    });
  });
});
