import { supabase } from "@/lib/supabase";
import type { UserProfile } from "@/services/authService";

export type IconRarity = "common" | "rare" | "epic" | "legendary";

export type DropConditionType = "streak" | "friends" | "messages_sent";

export interface DropCondition {
  type: DropConditionType;
  days?: number;
  count?: number;
}

export type CollectionIcon = {
  id: string;
  slug: string;
  name: string;
  image_url: string | null;
  rarity: IconRarity;
  drop_condition: DropCondition | null;
  is_default: boolean;
  status_icon_value: string;
};

export type UserCollectionIcon = {
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
  const { data, error } = await supabase
    .from("icons")
    .select("id, slug, name, image_url, rarity, drop_condition, is_default, status_icon_value")
    .order("rarity")
    .order("name");
  if (error) throw error;
  return (data ?? []).map(normalizeIcon);
}

export async function getUserIcons(userId: string): Promise<UserCollectionIcon[]> {
  const { data, error } = await supabase
    .from("user_icons")
    .select("user_id, icon_id, acquired_at, icon:icons(id, slug, name, image_url, rarity, drop_condition, is_default, status_icon_value)")
    .eq("user_id", userId);
  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    user_id: row.user_id,
    icon_id: row.icon_id,
    acquired_at: row.acquired_at,
    icon: normalizeIcon(row.icon),
  }));
}

export async function grantIcon(slug: string): Promise<void> {
  const { error } = await supabase.rpc("grant_icon", { p_slug: slug });
  if (error) throw error;
}

export async function equipStatusIcon(slug: string): Promise<UserProfile> {
  const { data, error } = await supabase.rpc("equip_status_icon", { p_slug: slug });
  if (error) throw error;
  return data as UserProfile;
}

function normalizeIcon(row: any): CollectionIcon {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    image_url: row.image_url ?? null,
    rarity: row.rarity as IconRarity,
    drop_condition: row.drop_condition ?? null,
    is_default: Boolean(row.is_default),
    status_icon_value: row.status_icon_value,
  };
}
