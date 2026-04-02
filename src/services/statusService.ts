import { supabase } from "@/lib/supabase";

export const STATUS_PRESETS = [
  { icon: "online", label: "온라인" },
  { icon: "study", label: "공부중" },
  { icon: "sleep", label: "수면중" },
  { icon: "move", label: "이동중" },
  { icon: "eat", label: "식사중" },
  { icon: "work", label: "근무중" },
  { icon: "game", label: "게임중" },
  { icon: "away", label: "자리비움" },
] as const;

export async function setMyStatus(
  userId: string,
  statusIcon: string,
  label?: string
) {
  // Upsert: update if exists, insert if not
  const { data: existing } = await supabase
    .from("status_broadcasts")
    .select("id")
    .eq("user_id", userId)
    .single();

  if (existing) {
    const { error } = await supabase
      .from("status_broadcasts")
      .update({ status_icon: statusIcon, label, updated_at: new Date().toISOString() })
      .eq("user_id", userId);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("status_broadcasts")
      .insert({ user_id: userId, status_icon: statusIcon, label });
    if (error) throw error;
  }

  // Also update user's status_icon
  await supabase
    .from("users")
    .update({ status_icon: statusIcon })
    .eq("id", userId);
}

export async function getMyStatus(userId: string) {
  const { data, error } = await supabase
    .from("status_broadcasts")
    .select("*")
    .eq("user_id", userId)
    .single();
  if (error) return null;
  return data;
}

export async function getFriendStatuses(friendIds: string[]) {
  if (friendIds.length === 0) return [];
  const { data, error } = await supabase
    .from("status_broadcasts")
    .select("*")
    .in("user_id", friendIds);
  if (error) throw error;
  return data ?? [];
}
