export const BLINK_MAX_DURATION_MS = 2000;
export const BLINK_DURATION_SECONDS = BLINK_MAX_DURATION_MS / 1000;
export const BLINK_MAX_BYTES = 750000;
export const BLINK_THUMB_MAX_BYTES = 262144;
export const BLINK_STRIP_FRAME_COUNT = 3;
export const BLINK_DAILY_FREE_LIMIT = 10;
export const BEEP_DAILY_FREE_LIMIT = 100;
export const UNSAVED_MEDIA_TTL_HOURS = 24;
export const RELATIONSHIP_BLINK_COOLDOWN_SECONDS = 60;
export const WIDGET_MAX_QUICK_REPLY_CODES = 3;

const SUPPORTED_BLINK_MIME_TYPES = new Set([
  "video/mp4",
  "video/quicktime",
  "video/webm",
]);

export type BlinkUploadValidationReason =
  | "duration"
  | "size"
  | "mime"
  | "missing";

export type BlinkUploadValidation =
  | { valid: true }
  | { valid: false; reason: BlinkUploadValidationReason };

export type BlinkUploadCandidate = {
  durationMs: number;
  byteSize: number;
  mimeType?: string | null;
};

export type DailyBlinkUsage = {
  blinkSentCount: number;
  bytesUploaded: number;
};

export function validateBlinkUpload(
  candidate: BlinkUploadCandidate
): BlinkUploadValidation {
  if (candidate.durationMs <= 0 || candidate.byteSize <= 0) {
    return { valid: false, reason: "missing" };
  }

  if (candidate.durationMs > BLINK_MAX_DURATION_MS) {
    return { valid: false, reason: "duration" };
  }

  if (candidate.byteSize > BLINK_MAX_BYTES) {
    return { valid: false, reason: "size" };
  }

  if (candidate.mimeType && !SUPPORTED_BLINK_MIME_TYPES.has(candidate.mimeType)) {
    return { valid: false, reason: "mime" };
  }

  return { valid: true };
}

export function getUnsavedMediaExpiry(
  createdAt: string | Date,
  ttlHours = UNSAVED_MEDIA_TTL_HOURS
) {
  const created = new Date(createdAt);
  return new Date(created.getTime() + ttlHours * 60 * 60 * 1000);
}

export function canSendBlinkToday(usage: DailyBlinkUsage) {
  if (usage.blinkSentCount >= BLINK_DAILY_FREE_LIMIT) {
    return { allowed: false, reason: "daily-limit" as const };
  }

  return { allowed: true as const };
}
