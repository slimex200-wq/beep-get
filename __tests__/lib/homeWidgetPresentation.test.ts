import {
  formatWidgetIndex,
  formatWidgetTimeParts,
  getWidgetSenderName,
} from "@/lib/homeWidgetPresentation";

describe("home widget presentation helpers", () => {
  it("uses a trimmed sender nickname when available", () => {
    expect(
      getWidgetSenderName({
        created_at: "2026-05-02T14:34:00Z",
        from_user_profile: { nickname: "  Mina  " },
      })
    ).toBe("Mina");
  });

  it("falls back to UNKNOWN without a sender nickname", () => {
    expect(getWidgetSenderName({ created_at: "2026-05-02T14:34:00Z" })).toBe("UNKNOWN");
    expect(
      getWidgetSenderName({
        created_at: "2026-05-02T14:34:00Z",
        from_user_profile: { nickname: "   " },
      })
    ).toBe("UNKNOWN");
  });

  it("formats the mockup-style message index with bounds", () => {
    expect(formatWidgetIndex(0)).toBe("02");
    expect(formatWidgetIndex(2)).toBe("04");
    expect(formatWidgetIndex(250)).toBe("99");
  });

  it("formats widget time as two digit parts", () => {
    const parts = formatWidgetTimeParts("2026-05-02T04:05:00Z");
    expect(parts.hour).toMatch(/^\d{2}$/);
    expect(parts.minute).toMatch(/^\d{2}$/);
  });

  it("uses placeholder parts for invalid dates", () => {
    expect(formatWidgetTimeParts("not-a-date")).toEqual({ hour: "--", minute: "--" });
  });
});
