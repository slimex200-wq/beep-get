import type { Signal } from "@/data/mockSignals";
import type { LegacyMessage } from "@/services/messageService";
import { normalizeAvatarUri } from "@/lib/avatarSource";

export type SlipSignal = Signal;

export type RelationshipFriend = {
  id: string;
  user_id: string;
  friend_id: string;
  nickname: string | null;
  vibration_pattern: string | null;
  friend: {
    id: string;
    beep_id: string;
    nickname: string;
    status_icon: string;
    avatar_url?: string | null;
  };
};

export type SlipFriend = {
  id: string;
  no: string;
  name: string;
  relation: string;
  presets: string[];
  avatarUri?: string;
  isClose?: boolean;
};

export function messageToSlipSignal(
  message: LegacyMessage,
  options: { now?: Date; index?: number } = {}
): SlipSignal {
  const now = options.now ?? new Date();
  const expired =
    !message.is_saved && new Date(message.expires_at).getTime() <= now.getTime();
  const hasBlink = message.kind === "blink" || Boolean(message.media);
  const memo = message.memo?.trim();
  const blinkNote = hasBlink ? "Blink received" : "CODE-ONLY BEEP";
  const avatarUri = normalizeAvatarUri(message.from_user_profile?.avatar_url);

  return {
    id: message.id,
    code: message.number_code,
    sender: message.from_user_profile?.nickname?.trim() || "UNKNOWN",
    senderNo: senderNoFromBeepId(message.from_user_profile?.beep_id, options.index),
    time: formatSlipTime(message.created_at),
    note: memo ? `${blinkNote} / ${memo}` : blinkNote,
    ...(avatarUri ? { avatarUri } : {}),
    hasBlink,
    status: expired ? "expired" : message.is_saved ? "saved" : message.is_read ? "read" : "new",
  };
}

export function relationshipToSlipFriend(
  relationship: RelationshipFriend,
  index: number
): SlipFriend {
  const avatarUri = normalizeAvatarUri(relationship.friend.avatar_url);

  return {
    id: relationship.friend_id,
    no: senderNoFromBeepId(relationship.friend.beep_id, index),
    name: relationship.nickname?.trim() || relationship.friend.nickname || "UNKNOWN",
    relation: relationship.vibration_pattern || relationship.friend.status_icon || "close circuit",
    presets: ["8282", "486", "1004"],
    ...(avatarUri ? { avatarUri } : {}),
    isClose: index === 0 || relationship.friend.status_icon === "online",
  };
}

export function formatSlipTime(dateStr: string): string {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "--:--";
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(
    2,
    "0"
  )}`;
}

function senderNoFromBeepId(beepId?: string | null, index = 0): string {
  const digits = beepId?.replace(/\D/g, "");
  if (digits && digits.length >= 2) return digits.slice(-2);
  return String(index + 1).padStart(2, "0");
}
