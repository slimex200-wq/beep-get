import {
  canSendBeep,
  canSendBlink,
  getLimitErrorMessage,
  getRelationshipCooldownRemainingSeconds,
} from "@/services/usageLimits";

describe("canSendBlink", () => {
  it("allows blink sends below daily limit and cooldown", () => {
    expect(
      canSendBlink({
        blinkSentCount: 9,
        bytesUploaded: 0,
        lastSentAt: "2026-05-03T12:00:00.000Z",
        now: new Date("2026-05-03T12:02:00.000Z"),
      })
    ).toEqual({ allowed: true });
  });

  it("blocks when daily blink limit is reached", () => {
    expect(
      canSendBlink({
        blinkSentCount: 10,
        bytesUploaded: 0,
        now: new Date("2026-05-03T12:02:00.000Z"),
      })
    ).toEqual({ allowed: false, reason: "daily-blink-limit" });
  });

  it("blocks when relationship cooldown has not elapsed", () => {
    expect(
      canSendBlink({
        blinkSentCount: 0,
        bytesUploaded: 0,
        lastSentAt: "2026-05-03T12:01:30.000Z",
        now: new Date("2026-05-03T12:02:00.000Z"),
      })
    ).toEqual({
      allowed: false,
      reason: "relationship-cooldown",
      retryAfterSeconds: 30,
    });
  });

  it("saved media does not bypass daily send limits", () => {
    expect(
      canSendBlink({
        blinkSentCount: 10,
        bytesUploaded: 0,
        isSavedMedia: true,
        now: new Date("2026-05-03T12:02:00.000Z"),
      })
    ).toEqual({ allowed: false, reason: "daily-blink-limit" });
  });
});

describe("canSendBeep", () => {
  it("allows beep sends below daily limit", () => {
    expect(canSendBeep({ beepSentCount: 99 })).toEqual({ allowed: true });
  });

  it("blocks when daily beep limit is reached", () => {
    expect(canSendBeep({ beepSentCount: 100 })).toEqual({
      allowed: false,
      reason: "daily-beep-limit",
    });
  });
});

describe("getRelationshipCooldownRemainingSeconds", () => {
  it("returns zero when there is no previous send", () => {
    expect(getRelationshipCooldownRemainingSeconds(null)).toBe(0);
  });

  it("rounds up remaining cooldown seconds", () => {
    expect(
      getRelationshipCooldownRemainingSeconds(
        "2026-05-03T12:00:30.500Z",
        new Date("2026-05-03T12:01:00.000Z")
      )
    ).toBe(31);
  });
});

describe("getLimitErrorMessage", () => {
  it("returns user-readable copy", () => {
    expect(getLimitErrorMessage("daily-blink-limit")).toBe(
      "Daily Blink limit reached. Try again tomorrow."
    );
    expect(getLimitErrorMessage("relationship-cooldown", 12)).toBe(
      "Slow down a little. Try this friend again in 12 seconds."
    );
  });
});
