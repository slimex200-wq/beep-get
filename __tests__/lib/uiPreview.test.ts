describe("uiPreview Today copy", () => {
  it("keeps preview inbox copy product-like instead of labeling the first signal as a demo", () => {
    const { uiPreviewMessages } = require("@/lib/uiPreview") as typeof import("@/lib/uiPreview");
    const memoText = uiPreviewMessages
      .map((message) => message.memo ?? "")
      .join(" ");

    expect(memoText).not.toMatch(/demo blink/i);
    expect(memoText).not.toMatch(/2 sec blink/i);
  });

  it("does not expose UI Preview in production bundles even when the public flag is set", () => {
    const previousFlag = process.env.EXPO_PUBLIC_UI_PREVIEW;
    const previousNodeEnv = process.env.NODE_ENV;
    jest.resetModules();
    process.env.EXPO_PUBLIC_UI_PREVIEW = "1";
    process.env.NODE_ENV = "production";

    const { isUiPreviewEnabled } = require("@/lib/uiPreview");

    expect(isUiPreviewEnabled).toBe(false);
    if (previousFlag === undefined) {
      delete process.env.EXPO_PUBLIC_UI_PREVIEW;
    } else {
      process.env.EXPO_PUBLIC_UI_PREVIEW = previousFlag;
    }
    process.env.NODE_ENV = previousNodeEnv;
    jest.resetModules();
  });
});
