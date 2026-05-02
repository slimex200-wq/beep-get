import {
  BEEP_DAILY_FREE_LIMIT,
  BLINK_DAILY_FREE_LIMIT,
  BLINK_MAX_BYTES,
  BLINK_MAX_DURATION_MS,
  RELATIONSHIP_BLINK_COOLDOWN_SECONDS,
  UNSAVED_MEDIA_TTL_HOURS,
  canSendBlinkToday,
  getUnsavedMediaExpiry,
  validateBlinkUpload,
} from "@/lib/beepBlinkLimits";

describe("beep/blink limits", () => {
  it("locks the MVP Blink constraints", () => {
    expect(BLINK_MAX_DURATION_MS).toBe(2000);
    expect(BLINK_MAX_BYTES).toBe(750000);
    expect(BLINK_DAILY_FREE_LIMIT).toBe(10);
    expect(BEEP_DAILY_FREE_LIMIT).toBe(100);
    expect(UNSAVED_MEDIA_TTL_HOURS).toBe(24);
    expect(RELATIONSHIP_BLINK_COOLDOWN_SECONDS).toBeGreaterThanOrEqual(30);
  });

  it("accepts a valid 2 second Blink upload", () => {
    expect(
      validateBlinkUpload({
        durationMs: 1999,
        byteSize: 700000,
        mimeType: "video/mp4",
      })
    ).toEqual({ valid: true });
  });

  it("rejects videos that are too long, too large, or unsupported", () => {
    expect(validateBlinkUpload({ durationMs: 2001, byteSize: 1000 })).toMatchObject({
      valid: false,
      reason: "duration",
    });
    expect(validateBlinkUpload({ durationMs: 1500, byteSize: 750001 })).toMatchObject({
      valid: false,
      reason: "size",
    });
    expect(
      validateBlinkUpload({
        durationMs: 1500,
        byteSize: 1000,
        mimeType: "application/octet-stream",
      })
    ).toMatchObject({ valid: false, reason: "mime" });
  });

  it("computes the unsaved media expiry from creation time", () => {
    expect(getUnsavedMediaExpiry("2026-05-03T00:00:00.000Z").toISOString()).toBe(
      "2026-05-04T00:00:00.000Z"
    );
  });

  it("blocks daily Blink sends once the free quota is reached", () => {
    expect(canSendBlinkToday({ blinkSentCount: 9, bytesUploaded: 0 }).allowed).toBe(true);
    expect(canSendBlinkToday({ blinkSentCount: 10, bytesUploaded: 0 }).allowed).toBe(false);
  });
});
