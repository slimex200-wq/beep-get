import {
  BEEP_DAILY_FREE_LIMIT,
  BLINK_DAILY_FREE_LIMIT,
  RELATIONSHIP_BLINK_COOLDOWN_SECONDS,
} from "@/lib/beepBlinkLimits";

export type UsageLimitReason =
  | "daily-beep-limit"
  | "daily-blink-limit"
  | "relationship-cooldown";

export type UsageLimitDecision =
  | { allowed: true }
  | {
      allowed: false;
      reason: UsageLimitReason;
      retryAfterSeconds?: number;
    };

export type BeepUsageSnapshot = {
  beepSentCount: number;
};

export type BlinkUsageSnapshot = {
  blinkSentCount: number;
  bytesUploaded: number;
  lastSentAt?: string | Date | null;
  isSavedMedia?: boolean;
  now?: Date;
};

export function canSendBeep(usage: BeepUsageSnapshot): UsageLimitDecision {
  if (usage.beepSentCount >= BEEP_DAILY_FREE_LIMIT) {
    return { allowed: false, reason: "daily-beep-limit" };
  }

  return { allowed: true };
}

export function canSendBlink(usage: BlinkUsageSnapshot): UsageLimitDecision {
  void usage.bytesUploaded;
  void usage.isSavedMedia;

  if (usage.blinkSentCount >= BLINK_DAILY_FREE_LIMIT) {
    return { allowed: false, reason: "daily-blink-limit" };
  }

  const retryAfterSeconds = getRelationshipCooldownRemainingSeconds(
    usage.lastSentAt ?? null,
    usage.now
  );

  if (retryAfterSeconds > 0) {
    return {
      allowed: false,
      reason: "relationship-cooldown",
      retryAfterSeconds,
    };
  }

  return { allowed: true };
}

export function getRelationshipCooldownRemainingSeconds(
  lastSentAt: string | Date | null,
  now = new Date(),
  cooldownSeconds = RELATIONSHIP_BLINK_COOLDOWN_SECONDS
): number {
  if (!lastSentAt) return 0;

  const lastSentTime = new Date(lastSentAt).getTime();
  if (!Number.isFinite(lastSentTime)) return 0;

  const elapsedSeconds = (now.getTime() - lastSentTime) / 1000;
  return Math.max(0, Math.ceil(cooldownSeconds - elapsedSeconds));
}

export function getLimitErrorMessage(
  reason: UsageLimitReason,
  retryAfterSeconds?: number
): string {
  switch (reason) {
    case "daily-beep-limit":
      return "Daily Beep limit reached. Try again tomorrow.";
    case "daily-blink-limit":
      return "Daily Blink limit reached. Try again tomorrow.";
    case "relationship-cooldown":
      return `Slow down a little. Try this friend again in ${
        retryAfterSeconds ?? RELATIONSHIP_BLINK_COOLDOWN_SECONDS
      } seconds.`;
  }
}
