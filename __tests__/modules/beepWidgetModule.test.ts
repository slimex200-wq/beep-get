describe("beep-widget module boundary", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("does not fail at import time when the native widget module is missing", async () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => undefined);

    jest.doMock("expo-modules-core", () => ({
      requireNativeModule: jest.fn(() => {
        throw new Error("Cannot find native module 'BeepWidget'");
      }),
    }));

    const widget = require("../../modules/beep-widget/index") as typeof import("../../modules/beep-widget");

    expect(() =>
      widget.updateWidgetData({ latestMessage: null, recentSenders: [] }),
    ).not.toThrow();
    expect(() => widget.reloadWidgets()).not.toThrow();
    await expect(widget.getWidgetData()).resolves.toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(
      "BeepWidget native module unavailable",
      "Cannot find native module 'BeepWidget'",
    );
  });
});
