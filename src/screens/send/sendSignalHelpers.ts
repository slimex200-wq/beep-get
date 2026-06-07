import { Alert } from "react-native";
import type { PickableFriend } from "@/components/FriendPickerStrip";
import type { RecentSignalCombo } from "@/components/RecentSignalCombos";
import { BLINK_MAX_DURATION_MS } from "@/lib/beepBlinkLimits";
import type { BlinkDraft } from "@/lib/blinkDraft";
import { DEMO_BLINK_FRAME_DATA_URIS } from "@/lib/demoBlinkFrameData";
import { validateMessage } from "@/services/messageService";

export const DEFAULT_SLOT_DECK = ["8282", "486", "0707", "1313", "9999", "응원해", "보고싶어", "잘자"] as const;
export const RECENT_COMBO_SLOTS = ["8282", "486", "0707"] as const;
export const RECENT_COMBO_LABELS = ["8282 + 보고싶어", "486 + 잘자", "0707 + 응원해"] as const;

type SlotEntry = {
  readonly code?: string | null;
};

export function buildSignalSlotDeck(
  entries: readonly SlotEntry[] = [],
  baseSlots: readonly string[] = DEFAULT_SLOT_DECK,
): string[] {
  const [primarySlot, ...remainingBaseSlots] = baseSlots;
  const slots = [
    primarySlot,
    ...entries.map((entry) => entry.code),
    ...remainingBaseSlots,
  ].flatMap((slot) => {
    if (!slot) return [];
    const trimmed = slot.trim();
    return validateMessage(trimmed).valid ? [trimmed] : [];
  });
  return Array.from(new Set(slots)).slice(0, 8);
}

export function buildSlotDeck(
  entries: readonly SlotEntry[] = [],
  baseSlots: readonly string[] = DEFAULT_SLOT_DECK,
): string[] {
  return buildSignalSlotDeck(entries, baseSlots);
}

export function createPreviewBlinkDraft(frameUris: readonly string[] = DEMO_BLINK_FRAME_DATA_URIS): BlinkDraft {
  const previewFrameUris = [...frameUris].slice(0, 3);
  return {
    video: { uri: "preview-private-playback", durationMs: BLINK_MAX_DURATION_MS, mimeType: "video/mp4" },
    teaser: {
      thumbnailKey: null,
      stripKeys: [],
      assets: previewFrameUris.map((uri, index) => ({
        uri,
        objectKey: `preview-strip-${index + 1}`,
        mimeType: "image/jpeg" as const,
        timeMs: Math.floor(BLINK_MAX_DURATION_MS * (index / 3)),
      })),
    },
    previewFrameUris,
  };
}

export function friendNo(label?: string) {
  const digits = label?.replace(/\D/g, "");
  return digits?.slice(-2) || "01";
}

export function buildRecentCombos(friendOptions: readonly PickableFriend[]): RecentSignalCombo[] {
  return RECENT_COMBO_SLOTS.flatMap((slot, index) => {
    const friend = friendOptions[index % Math.max(friendOptions.length, 1)];
    if (!friend) return [];
    return [{
      id: `${friend.id}-${slot}`,
      friendId: friend.id,
      friendName: friend.name,
      friendNo: friend.no,
      slot,
      label: RECENT_COMBO_LABELS[index] ?? `${slot} + ${friend.name}`,
    }];
  });
}

export function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Try again.";
}

export function reportError(error: unknown) {
  Alert.alert("BEEP-GET", error instanceof Error ? error.message : "Unexpected error");
}
