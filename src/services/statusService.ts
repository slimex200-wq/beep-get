import { supabase } from "@/lib/supabase";

type ProfileStatusRow = {
  id: string;
  status_icon: string;
  updated_at?: string | null;
};

export const STATUS_PRESETS = [
  { icon: "online", label: "온라인" },
  { icon: "busy", label: "바쁨" },
  { icon: "focus", label: "집중" },
  { icon: "away", label: "자리비움" },
  { icon: "sleeping", label: "수면중" },
] as const;

export async function setMyStatus(
  userId: string,
  statusIcon: string,
  label?: string
) {
  void userId;
  void label;

  const { error } = await supabase.rpc("equip_status_icon", { p_slug: statusIcon });
  if (error) throw error;
}

export async function getMyStatus(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, status_icon, updated_at")
    .eq("id", userId)
    .single();
  if (error) return null;
  return mapProfileStatus(data as ProfileStatusRow);
}

export async function getFriendStatuses(friendIds: string[]) {
  if (friendIds.length === 0) return [];
  const { data, error } = await supabase
    .from("profiles")
    .select("id, status_icon, updated_at")
    .in("id", friendIds);
  if (error) throw error;
  return ((data ?? []) as ProfileStatusRow[]).map(mapProfileStatus);
}

function mapProfileStatus(profile: ProfileStatusRow) {
  return {
    user_id: profile.id,
    status_icon: profile.status_icon,
    label: null,
    updated_at: profile.updated_at ?? new Date().toISOString(),
  };
}
