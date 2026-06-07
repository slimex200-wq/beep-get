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
  const dataSource = readFileSync(path.join(widgetDir, "BeepWidgetData.kt"), "utf8");

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

  it("applies active skin tokens from the app widget payload", () => {
    expect(dataSource).toContain("data class WidgetSkin");
    expect(dataSource).toContain('@SerializedName("activeSkin") val activeSkin: WidgetSkin?');
    expect(displaySource).toContain("data class BeepWidgetPalette");
    expect(displaySource).toContain("palette.paper");
    expect(displaySource).toContain("palette.accent");
    expect(smallSource).toContain("val palette = BeepWidgetPalette.from(data?.activeSkin)");
    expect(mediumSource).toContain("val palette = BeepWidgetPalette.from(data?.activeSkin)");
  });
});
