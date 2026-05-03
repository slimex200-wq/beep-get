import { updateWidgetData, reloadWidgets } from "../../modules/beep-widget";
import type {
  WidgetData,
  WidgetMessage,
  WidgetSignalTeaser,
  RecentSender,
} from "../../modules/beep-widget";
import { WIDGET_MAX_RECENT_SENDERS } from "@/lib/constants";
import { BLINK_MAX_DURATION_MS } from "@/lib/beepBlinkLimits";
import { buildWidgetActionUrls } from "@/lib/widgetActions";

interface Message {
  id: string;
  from_user: string;
  kind?: "beep" | "blink";
  number_code: string;
  is_read: boolean;
  created_at: string;
  from_user_profile?: { nickname: string | null; beep_id: string | null } | null;
  media?: {
    durationMs?: number | null;
    status?: string | null;
    thumbnailUri?: string | null;
    stripFrameUris?: string[] | null;
  } | null;
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
  const latest = received[0];
  const latestTeaser = latest ? buildWidgetTeaser(latest) : undefined;
  const latestMessage: WidgetMessage | null =
    latest
      ? {
          code: latest.number_code,
          senderNickname: latest.from_user_profile?.nickname ?? "???",
          senderBeepId: latest.from_user_profile?.beep_id ?? "",
          messageId: latest.id,
          receivedAt: latest.created_at,
          isRead: latest.is_read,
          kind: latest.kind ?? "beep",
          ...(latestTeaser ? { teaser: latestTeaser } : {}),
          actions: buildWidgetActionUrls(latest.id),
        }
      : null;

  const friendMap = new Map(friends.map((f) => [f.friend_id, f]));

  // Extract unique recent senders (up to WIDGET_MAX_RECENT_SENDERS)
  const seen = new Set<string>();
  const recentSenders: RecentSender[] = [];

  for (const msg of received) {
    if (recentSenders.length >= WIDGET_MAX_RECENT_SENDERS) break;
    const senderId = msg.from_user;
    if (seen.has(senderId)) continue;
    seen.add(senderId);

    const friend = friendMap.get(senderId);
    recentSenders.push({
      nickname: msg.from_user_profile?.nickname ?? "???",
      beepId: msg.from_user_profile?.beep_id ?? "",
      lastCode: msg.number_code,
      statusIcon: friend?.friend?.status_icon ?? "online",
    });
  }

  return { latestMessage, recentSenders };
}

function buildWidgetTeaser(message: Message): WidgetSignalTeaser | undefined {
  if (message.kind !== "blink") return undefined;
  if (
    message.media?.status === "expired" ||
    message.media?.status === "deleted" ||
    message.media?.status === "failed"
  ) {
    return undefined;
  }

  const stripFrameUris = (message.media?.stripFrameUris ?? [])
    .filter((uri): uri is string => Boolean(uri))
    .slice(0, 3);
  const thumbnailUri = message.media?.thumbnailUri?.trim();
  if (!thumbnailUri && stripFrameUris.length === 0) return undefined;

  return {
    durationMs: Math.min(message.media?.durationMs ?? BLINK_MAX_DURATION_MS, BLINK_MAX_DURATION_MS),
    ...(thumbnailUri ? { thumbnailUri } : {}),
    stripFrameUris,
  };
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
