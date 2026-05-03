import { WIDGET_MAX_QUICK_REPLY_CODES } from "@/lib/beepBlinkLimits";

export type WidgetActionLink = {
  code: string;
  url: string;
};

export type WidgetActionUrls = {
  openReplyRoomUrl: string;
  confirmUrl: string;
  saveUrl: string;
  quickReplyUrls: WidgetActionLink[];
};

export type WidgetAction =
  | { type: "confirm"; signalId: string }
  | { type: "save"; signalId: string }
  | { type: "quickReply"; signalId: string; code: string };

const DEFAULT_QUICK_REPLY_CODES = ["8282"] as const;

export function buildWidgetActionUrls(
  signalId: string,
  quickReplyCodes: readonly string[] = DEFAULT_QUICK_REPLY_CODES
): WidgetActionUrls {
  const encodedSignalId = encodeURIComponent(signalId);
  const quickReplyUrls = quickReplyCodes
    .filter((code) => /^\d+$/.test(code))
    .slice(0, WIDGET_MAX_QUICK_REPLY_CODES)
    .map((code) => ({
      code,
      url: `beepget://signal/${encodedSignalId}/quick-reply/${encodeURIComponent(code)}`,
    }));

  return {
    openReplyRoomUrl: `beepget://reply/${encodedSignalId}`,
    confirmUrl: `beepget://signal/${encodedSignalId}/confirm`,
    saveUrl: `beepget://signal/${encodedSignalId}/save`,
    quickReplyUrls,
  };
}

export function buildQuickReplyActionKey(signalId: string, code: string): string {
  return `quick-reply:${signalId}:${code}`;
}

export function parseWidgetActionUrl(url: string): WidgetAction | null {
  const normalized = url.trim();

  const confirm = normalized.match(/^beepget:\/\/signal\/([^/?#]+)\/confirm(?:[?#].*)?$/);
  if (confirm) {
    return { type: "confirm", signalId: decodeURIComponent(confirm[1]) };
  }

  const save = normalized.match(/^beepget:\/\/signal\/([^/?#]+)\/save(?:[?#].*)?$/);
  if (save) {
    return { type: "save", signalId: decodeURIComponent(save[1]) };
  }

  const quickReply = normalized.match(
    /^beepget:\/\/signal\/([^/?#]+)\/quick-reply\/([^/?#]+)(?:[?#].*)?$/
  );
  if (quickReply) {
    return {
      type: "quickReply",
      signalId: decodeURIComponent(quickReply[1]),
      code: decodeURIComponent(quickReply[2]),
    };
  }

  return null;
}
