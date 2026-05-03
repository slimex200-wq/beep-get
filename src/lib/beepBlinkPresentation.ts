import {
  BLINK_MAX_DURATION_MS,
  WIDGET_MAX_QUICK_REPLY_CODES,
} from "@/lib/beepBlinkLimits";
import { buildWidgetActionUrls, type WidgetActionUrls } from "@/lib/widgetActions";

export type SignalKind = "beep" | "blink";
export type SignalStatus = "sent" | "delivered" | "read" | "dismissed";
export type SignalMediaStatus =
  | "pending_upload"
  | "uploaded"
  | "processed"
  | "failed"
  | "expired"
  | "deleted";

export type SignalPresentationInput = {
  id: string;
  kind: SignalKind;
  code: string;
  memo?: string | null;
  status: SignalStatus;
  isSaved: boolean;
  createdAt: string;
  expiresAt: string;
  sender?: {
    nickname?: string | null;
    beepId?: string | null;
  } | null;
  media?: {
    durationMs: number;
    status: SignalMediaStatus;
    thumbnailUri?: string | null;
    stripFrameUris?: string[] | null;
    playbackUri?: string | null;
  } | null;
};

export type SignalTeaser = {
  durationMs: number;
  thumbnailUri?: string;
  stripFrameUris: string[];
};

export type SignalAvailability = "active" | "saved" | "expired";

export type SignalPresentation = {
  id: string;
  kind: SignalKind;
  title: "Incoming Beep" | "Incoming Blink";
  code: string;
  memo: string | null;
  status: SignalStatus;
  isSaved: boolean;
  availability: SignalAvailability;
  senderName: string;
  senderBeepId: string;
  createdAt: string;
  expiresAt: string;
  teaser: SignalTeaser | null;
};

export type WidgetSignalPayload = {
  signalId: string;
  kind: SignalKind;
  code: string;
  senderNickname: string;
  senderBeepId: string;
  receivedAt: string;
  isRead: boolean;
  teaser?: SignalTeaser;
  actions: WidgetActionUrls;
};

export function buildSignalPresentation(
  signal: SignalPresentationInput,
  options: { now?: Date } = {}
): SignalPresentation {
  const now = options.now ?? new Date();
  const expiresAt = new Date(signal.expiresAt);
  const isExpired = !signal.isSaved && expiresAt.getTime() <= now.getTime();
  const availability: SignalAvailability = signal.isSaved
    ? "saved"
    : isExpired
      ? "expired"
      : "active";

  return {
    id: signal.id,
    kind: signal.kind,
    title: signal.kind === "blink" ? "Incoming Blink" : "Incoming Beep",
    code: signal.code,
    memo: signal.memo?.trim() || null,
    status: signal.status,
    isSaved: signal.isSaved,
    availability,
    senderName: signal.sender?.nickname?.trim() || "UNKNOWN",
    senderBeepId: signal.sender?.beepId?.trim() || "",
    createdAt: signal.createdAt,
    expiresAt: signal.expiresAt,
    teaser:
      signal.kind === "blink" && !isExpired
        ? buildTeaser(signal.media)
        : null,
  };
}

export function buildWidgetSignalPayload(
  presentation: SignalPresentation,
  options: { quickReplyCodes?: string[] } = {}
): WidgetSignalPayload {
  return {
    signalId: presentation.id,
    kind: presentation.kind,
    code: presentation.code,
    senderNickname: presentation.senderName,
    senderBeepId: presentation.senderBeepId,
    receivedAt: presentation.createdAt,
    isRead: presentation.status === "read",
    ...(presentation.teaser ? { teaser: presentation.teaser } : {}),
    actions: buildWidgetActionUrls(
      presentation.id,
      (options.quickReplyCodes ?? []).slice(0, WIDGET_MAX_QUICK_REPLY_CODES)
    ),
  };
}

function buildTeaser(
  media: SignalPresentationInput["media"]
): SignalTeaser | null {
  if (!media) return null;
  if (media.status === "expired" || media.status === "deleted" || media.status === "failed") {
    return null;
  }

  const durationMs = Math.min(media.durationMs, BLINK_MAX_DURATION_MS);
  return {
    durationMs,
    ...(media.thumbnailUri ? { thumbnailUri: media.thumbnailUri } : {}),
    stripFrameUris: (media.stripFrameUris ?? []).slice(0, 3),
  };
}
