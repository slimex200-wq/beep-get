import * as Haptics from "expo-haptics";

export type VibrationSegment = "S" | "L" | "P";

/**
 * Parse vibration pattern string like "L,S,S" or "S,P,L,L"
 * S = short buzz, L = long buzz, P = pause
 */
export function parseVibrationPattern(pattern: string): VibrationSegment[] {
  return pattern
    .split(",")
    .map((s) => s.trim().toUpperCase() as VibrationSegment)
    .filter((s) => ["S", "L", "P"].includes(s));
}

export function isValidVibrationPattern(pattern: string): boolean {
  const segments = parseVibrationPattern(pattern);
  return segments.length > 0 && segments.length <= 10;
}

export async function playVibrationPattern(pattern: string): Promise<void> {
  const segments = parseVibrationPattern(pattern);

  for (const segment of segments) {
    switch (segment) {
      case "S":
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        await delay(100);
        break;
      case "L":
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        await delay(300);
        break;
      case "P":
        await delay(200);
        break;
    }
  }
}

export async function playDefaultVibration(): Promise<void> {
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const VIBRATION_PRESETS = [
  { name: "기본", pattern: "S,S" },
  { name: "긴급", pattern: "L,S,L,S,L" },
  { name: "부드럽게", pattern: "S,P,S" },
  { name: "어머니", pattern: "L,L" },
  { name: "친구", pattern: "S,S,S" },
  { name: "연인", pattern: "L,S,L" },
  { name: "알림", pattern: "S,P,S,P,S" },
] as const;
