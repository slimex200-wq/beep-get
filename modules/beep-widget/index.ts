import BeepWidgetModule from "./src/BeepWidgetModule";

export interface WidgetMessage {
  code: string;
  senderNickname: string;
  senderBeepId: string;
  messageId: string;
  receivedAt: string;
  isRead: boolean;
  actions?: WidgetActionUrls;
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
  BeepWidgetModule.updateWidgetData(JSON.stringify(data));
}

export function reloadWidgets(): void {
  BeepWidgetModule.reloadWidgets();
}

export async function getWidgetData(): Promise<WidgetData | null> {
  const raw = await BeepWidgetModule.getWidgetData();
  if (!raw) return null;
  return JSON.parse(raw);
}
