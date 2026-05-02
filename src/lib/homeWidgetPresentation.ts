export type WidgetPresentationMessage = {
  created_at: string;
  from_user_profile?: {
    nickname?: string | null;
  } | null;
};

export function getWidgetSenderName(message: WidgetPresentationMessage) {
  return message.from_user_profile?.nickname?.trim() || "UNKNOWN";
}

export function formatWidgetIndex(totalMessages: number) {
  return String(Math.max(1, Math.min(99, totalMessages + 2))).padStart(2, "0");
}

export function formatWidgetTimeParts(dateStr: string) {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return { hour: "--", minute: "--" };
  return {
    hour: date.getHours().toString().padStart(2, "0"),
    minute: date.getMinutes().toString().padStart(2, "0"),
  };
}
