import type { LegacyMessage } from "@/services/messageService";
import { formatSlipTime } from "@/lib/slipUiModels";

export type FriendCircuitStatus = "BEEP" | "BLINK" | "quiet";

export type FriendSignalSummary = {
  readonly badgeText: FriendCircuitStatus;
  readonly circuitStatus: FriendCircuitStatus;
  readonly rowStatus: string;
};

const quietSummary: FriendSignalSummary = {
  badgeText: "quiet",
  circuitStatus: "quiet",
  rowStatus: "No signals yet",
};

export function buildFriendSignalSummaries(
  messages: readonly LegacyMessage[],
): Map<string, FriendSignalSummary> {
  const summaries = new Map<string, FriendSignalSummary>();
  messages.forEach((message) => {
    if (summaries.has(message.from_user)) return;
    const isBlink = message.kind === "blink" || Boolean(message.media);
    const badgeText = isBlink ? "BLINK" : "BEEP";
    const kind = isBlink ? "Received Blink" : "Last Beep";
    summaries.set(message.from_user, {
      badgeText,
      circuitStatus: badgeText,
      rowStatus: `${kind} ${message.number_code} - ${formatSlipTime(message.created_at)}`,
    });
  });
  return summaries;
}

export function getFriendSignalSummary(
  summaries: ReadonlyMap<string, FriendSignalSummary>,
  friendId: string,
): FriendSignalSummary {
  return summaries.get(friendId) ?? quietSummary;
}
