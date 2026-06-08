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
  const signalSurfaceSource = readFileSync(path.join(widgetDir, "SignalSurface.kt"), "utf8");
  const dataSource = readFileSync(path.join(widgetDir, "BeepWidgetData.kt"), "utf8");

  it("routes widget taps through app-owned deep links", () => {
    // WidgetActions.kt: Intent-based deep link launcher
    expect(actionsSource).toContain("Intent.ACTION_VIEW");
    expect(actionsSource).toContain("Uri.parse(url)");
    expect(actionsSource).toContain("setPackage(context.packageName)");
    // Both sizes wire the tap to openReplyRoomUrl via openWidgetUrlAction
    expect(smallSource).toContain("openWidgetUrlAction");
    expect(smallSource).toContain("openReplyRoomUrl");
    expect(mediumSource).toContain("openWidgetUrlAction");
    expect(mediumSource).toContain("openReplyRoomUrl");
  });

  it("applies active skin tokens from the app widget payload", () => {
    // BeepWidgetData.kt defines the skin data class and payload field
    expect(dataSource).toContain("data class WidgetSkin");
    expect(dataSource).toContain("val activeSkin: WidgetSkin?");
    // SignalSurface.kt holds the palette definition and colour accessors
    expect(signalSurfaceSource).toContain("data class BeepWidgetPalette");
    expect(signalSurfaceSource).toContain("palette.paper");
    expect(signalSurfaceSource).toContain("palette.accent");
    // Both sizes create the palette from the JS payload
    expect(smallSource).toContain("val palette = BeepWidgetPalette.from(data?.activeSkin)");
    expect(mediumSource).toContain("val palette = BeepWidgetPalette.from(data?.activeSkin)");
  });

  it("matches iOS SwissPaper structure: SIGNAL SLOTS strip present, no RECENT column", () => {
    // iOS SwissPaperMediumView has a "SIGNAL SLOTS" section — Android mirrors it
    expect(signalSurfaceSource).toContain("SIGNAL SLOTS");
    // SignalSlotStrip renders 3 frames in both surfaces
    expect(signalSurfaceSource).toContain("SignalSlotStrip");
    // Mono font is used for tabular/code display (mirrors iOS monospaced)
    expect(signalSurfaceSource).toContain("FontFamily.Monospace");
    // RECENT sender column was removed to align with iOS — must not exist
    expect(mediumSource).not.toContain("recentSenders");
    expect(signalSurfaceSource).not.toContain("recentSenders");
  });
});
