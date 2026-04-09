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
  const { error } = await supabase
    .from("status_broadcasts")
    .upsert(
      {
        user_id: userId,
        status_icon: statusIcon,
        label: label ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
  if (error) throw error;

  const { error: userError } = await supabase
    .from("users")
    .update({ status_icon: statusIcon })
    .eq("id", userId);
  if (userError) throw userError;
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
