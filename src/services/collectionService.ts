import { supabase } from "@/lib/supabase";

export interface DropCondition {
  type: "streak" | "friends" | "messages_sent";
  days?: number;
  count?: number;
}

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

export async function getAllIcons() {
  const { data, error } = await supabase
    .from("icons")
    .select("*")
    .order("rarity", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getUserIcons(userId: string) {
  const { data, error } = await supabase
    .from("user_icons")
    .select("*, icon:icons(*)")
    .eq("user_id", userId);
  if (error) throw error;
  return data ?? [];
}

export async function grantIcon(userId: string, iconId: string) {
  const { error } = await supabase.from("user_icons").insert({
    user_id: userId,
    icon_id: iconId,
  });
  if (error) {
    if (error.code === "23505") return; // Already owned
    throw error;
  }
}
