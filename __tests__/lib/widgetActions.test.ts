import {
  buildQuickReplyClientActionId,
  buildQuickReplyActionKey,
  buildWidgetActionUrls,
  parseWidgetActionUrl,
} from "@/lib/widgetActions";

describe("buildWidgetActionUrls", () => {
  it("builds open, confirm, save, and quick reply deep links", () => {
    expect(buildWidgetActionUrls("signal-1", ["8282", "OK", "1004"])).toEqual({
      openReplyRoomUrl: "beepget://reply/signal-1",
      confirmUrl: "beepget://signal/signal-1/confirm",
      saveUrl: "beepget://signal/signal-1/save",
      quickReplyUrls: [
        {
          code: "8282",
          url: "beepget://signal/signal-1/quick-reply/8282",
        },
        {
          code: "1004",
          url: "beepget://signal/signal-1/quick-reply/1004",
        },
      ],
    });
  });

  it("caps quick replies for widget-safe action density", () => {
    const urls = buildWidgetActionUrls("signal-1", ["1", "2", "3", "4"]);

    expect(urls.quickReplyUrls.map((item) => item.code)).toEqual(["1", "2", "3"]);
  });
});

describe("parseWidgetActionUrl", () => {
  it("parses widget action URLs", () => {
    expect(parseWidgetActionUrl("beepget://signal/signal-1/confirm")).toEqual({
      type: "confirm",
      signalId: "signal-1",
    });
    expect(parseWidgetActionUrl("beepget://signal/signal-1/save")).toEqual({
      type: "save",
      signalId: "signal-1",
    });
    expect(parseWidgetActionUrl("beepget://signal/signal-1/quick-reply/8282")).toEqual({
      type: "quickReply",
      signalId: "signal-1",
      code: "8282",
    });
  });

  it("ignores non-widget action URLs", () => {
    expect(parseWidgetActionUrl("beepget://reply/signal-1")).toBeNull();
    expect(parseWidgetActionUrl("https://example.com")).toBeNull();
  });
});

describe("buildQuickReplyActionKey", () => {
  it("creates a stable duplicate-tap guard key", () => {
    expect(buildQuickReplyActionKey("signal-1", "8282")).toBe("quick-reply:signal-1:8282");
  });
});

describe("buildQuickReplyClientActionId", () => {
  it("creates a stable UUID-shaped idempotency key", () => {
    const first = buildQuickReplyClientActionId("signal-1", "8282");
    const second = buildQuickReplyClientActionId("signal-1", "8282");

    expect(first).toBe(second);
    expect(first).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
    );
    expect(buildQuickReplyClientActionId("signal-1", "486")).not.toBe(first);
  });
});
