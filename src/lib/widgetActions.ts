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
    .map((code) => code.trim())
    .filter(Boolean)
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

export function buildQuickReplyClientActionId(signalId: string, code: string): string {
  const hex = [
    fnv1aHex(`${signalId}:${code}`, 0x811c9dc5),
    fnv1aHex(`${code}:${signalId}`, 0x9e3779b9),
    fnv1aHex(`quick:${signalId}:${code}`, 0x85ebca6b),
    fnv1aHex(`reply:${code}:${signalId}`, 0xc2b2ae35),
  ].join("");
  const versioned = `${hex.slice(0, 12)}5${hex.slice(13)}`;
  const variantNibble = ((parseInt(versioned[16], 16) & 0x3) | 0x8).toString(16);
  const uuidHex = `${versioned.slice(0, 16)}${variantNibble}${versioned.slice(17, 32)}`;

  return [
    uuidHex.slice(0, 8),
    uuidHex.slice(8, 12),
    uuidHex.slice(12, 16),
    uuidHex.slice(16, 20),
    uuidHex.slice(20, 32),
  ].join("-");
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

function fnv1aHex(input: string, seed: number): string {
  let hash = seed >>> 0;
  for (let index = 0; index < input.length; index++) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}
