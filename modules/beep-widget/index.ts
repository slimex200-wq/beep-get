import { getBeepWidgetModule } from "./src/BeepWidgetModule";

export interface WidgetMessage {
  kind?: "beep" | "blink";
  code: string;
  senderNickname: string;
  senderBeepId: string;
  messageId: string;
  receivedAt: string;
  isRead: boolean;
  teaser?: WidgetSignalTeaser;
  actions?: WidgetActionUrls;
}

export interface WidgetSignalTeaser {
  durationMs: number;
  thumbnailUri?: string;
  stripFrameUris: string[];
}

export interface WidgetActionLink {
  code: string;
  url: string;
}

export interface WidgetActionUrls {
  openReplyRoomUrl: string;
  confirmUrl: string;
  saveUrl: string;
  quickReplyUrls: WidgetActionLink[];
}

export interface RecentSender {
  nickname: string;
  beepId: string;
  lastCode: string;
  statusIcon: string;
}

export interface WidgetData {
  latestMessage: WidgetMessage | null;
  recentSenders: RecentSender[];
}

export function updateWidgetData(data: WidgetData): void {
  const module = getBeepWidgetModule();
  if (!module) return;
  module.updateWidgetData(JSON.stringify(data));
}

export function reloadWidgets(): void {
  const module = getBeepWidgetModule();
  if (!module) return;
  module.reloadWidgets();
}

export async function getWidgetData(): Promise<WidgetData | null> {
  const module = getBeepWidgetModule();
  if (!module) return null;
  const raw = await module.getWidgetData();
  if (!raw) return null;
  return JSON.parse(raw);
}
