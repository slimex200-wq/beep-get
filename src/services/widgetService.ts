import { updateWidgetData, reloadWidgets } from "../../modules/beep-widget";
import type { WidgetData, WidgetMessage, RecentSender } from "../../modules/beep-widget";
import { WIDGET_MAX_RECENT_SENDERS } from "@/lib/constants";

interface Message {
  id: string;
  from_user: string;
  number_code: string;
  is_read: boolean;
  created_at: string;
  from_user_profile?: { nickname: string; beep_id: string };
}

interface Friend {
  friend_id: string;
  friend: {
    id: string;
    beep_id: string;
    nickname: string;
    status_icon: string;
  };
}

export function buildWidgetData(
  received: Message[],
  friends: Friend[]
): WidgetData {
  const latestMessage: WidgetMessage | null =
    received.length > 0
      ? {
          code: received[0].number_code,
          senderNickname: received[0].from_user_profile?.nickname ?? "???",
          senderBeepId: received[0].from_user_profile?.beep_id ?? "",
          messageId: received[0].id,
          receivedAt: received[0].created_at,
          isRead: received[0].is_read,
        }
      : null;

  // Extract unique recent senders (up to WIDGET_MAX_RECENT_SENDERS)
  const seen = new Set<string>();
  const recentSenders: RecentSender[] = [];

  for (const msg of received) {
    if (recentSenders.length >= WIDGET_MAX_RECENT_SENDERS) break;
    const senderId = msg.from_user;
    if (seen.has(senderId)) continue;
    seen.add(senderId);

    const friend = friends.find((f) => f.friend_id === senderId);
    recentSenders.push({
      nickname: msg.from_user_profile?.nickname ?? "???",
      beepId: msg.from_user_profile?.beep_id ?? "",
      lastCode: msg.number_code,
      statusIcon: friend?.friend?.status_icon ?? "online",
    });
  }

  return { latestMessage, recentSenders };
}

export function syncWidgetData(received: Message[], friends: Friend[]): void {
  try {
    const data = buildWidgetData(received, friends);
    updateWidgetData(data);
  } catch {
    // Native module not available (e.g. web, test)
  }
}

export function triggerWidgetReload(): void {
  try {
    reloadWidgets();
  } catch {
    // Native module not available
  }
}
