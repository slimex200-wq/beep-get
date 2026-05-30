export type QuickReplySlotEntry = {
  code: string;
  meaning: string;
  sort_order?: number | null;
  is_widget_slot?: boolean | null;
};

export const DEFAULT_QUICK_REPLY_SLOTS = ["Done", "8282", "View"];
export const QUICK_REPLY_SLOT_LABEL_PREFIX = "Quick reply slot ";

export function getQuickReplySlotLabel(index: number) {
  return `${QUICK_REPLY_SLOT_LABEL_PREFIX}${index + 1}`;
}

export function isQuickReplySlotEntry(entry: QuickReplySlotEntry) {
  return Boolean(
    entry.is_widget_slot ||
      entry.meaning.startsWith(QUICK_REPLY_SLOT_LABEL_PREFIX)
  );
}

export function getQuickReplySlotOrder(entry: QuickReplySlotEntry) {
  if (typeof entry.sort_order === "number" && entry.sort_order > 0) {
    return entry.sort_order;
  }

  const match = entry.meaning.match(/(\d+)$/);
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
}

export function getConfiguredQuickReplyEntries<T extends QuickReplySlotEntry>(
  entries: readonly T[],
) {
  return entries
    .filter(isQuickReplySlotEntry)
    .sort((a, b) => getQuickReplySlotOrder(a) - getQuickReplySlotOrder(b));
}

export function buildQuickReplySlots(
  entries: readonly QuickReplySlotEntry[],
  fallbackSlots: readonly string[] = DEFAULT_QUICK_REPLY_SLOTS,
) {
  const configured = getConfiguredQuickReplyEntries(entries)
    .map((entry) => entry.code.trim())
    .filter(Boolean);

  const saved = entries
    .filter((entry) => !isQuickReplySlotEntry(entry))
    .map((entry) => entry.code.trim())
    .filter(Boolean);

  return Array.from(new Set([...configured, ...fallbackSlots, ...saved])).slice(0, 3);
}
