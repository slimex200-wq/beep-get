import { supabase } from "@/lib/supabase";

type ProfileStatusRow = {
  id: string;
  status_icon: string;
  updated_at?: string | null;
};

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
  void label;

  const { error } = await supabase
    .from("profiles")
    .update({ status_icon: statusIcon })
    .eq("id", userId);
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
