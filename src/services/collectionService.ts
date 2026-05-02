export interface DropCondition {
  type: "streak" | "friends" | "messages_sent";
  days?: number;
  count?: number;
}

export type CollectionIcon = {
  id: string;
  name: string;
  image_url: string;
  rarity: string;
  drop_condition: unknown;
  season_id: string | null;
};

export type UserCollectionIcon = {
  id: string;
  user_id: string;
  icon_id: string;
  acquired_at: string;
  icon: CollectionIcon;
};

export function checkDropCondition(
  condition: DropCondition,
  stats: { streakDays: number; friendCount: number; messagesSent: number }
): boolean {
  switch (condition.type) {
    case "streak":
      return stats.streakDays >= (condition.days ?? 0);
    case "friends":
      return stats.friendCount >= (condition.count ?? 0);
    case "messages_sent":
      return stats.messagesSent >= (condition.count ?? 0);
    default:
      return false;
  }
}

export function getRarityLabel(rarity: string): string {
  const labels: Record<string, string> = {
    common: "커먼",
    rare: "레어",
    epic: "에픽",
    legendary: "레전더리",
  };
  return labels[rarity] ?? rarity;
}

export function getRarityColor(rarity: string): string {
  const colors: Record<string, string> = {
    common: "#8A8A9A",
    rare: "#4A90D9",
    epic: "#A855F7",
    legendary: "#FFD600",
  };
  return colors[rarity] ?? "#8A8A9A";
}

export async function getAllIcons(): Promise<CollectionIcon[]> {
  return [];
}

export async function getUserIcons(userId: string): Promise<UserCollectionIcon[]> {
  void userId;
  return [];
}

export async function grantIcon(userId: string, iconId: string) {
  void userId;
  void iconId;
}
