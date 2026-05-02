import { supabase } from "@/lib/supabase";
import { isValidBeepId } from "@/services/authService";

type RelationshipRow = {
  id: string;
  owner_id: string;
  friend_id: string;
  nickname: string | null;
  vibration_pattern: string | null;
  created_at: string;
  friend: {
    id: string;
    beep_id: string;
    nickname: string;
    status_icon: string;
  };
};

export async function findUserByBeepId(beepId: string) {
  if (!isValidBeepId(beepId)) return null;
  const { data, error } = await supabase.rpc("find_profile_by_beep_id", {
    target_beep_id: beepId,
  });
  if (error || !data || data.length === 0) return null;
  return data[0];
}

export async function addFriend(userId: string, friendId: string, nickname?: string) {
  if (userId === friendId) throw new Error("자기 자신을 친구로 추가할 수 없습니다");

  const { error } = await supabase.from("relationships").insert({
    owner_id: userId,
    friend_id: friendId,
    nickname: nickname || null,
  });

  if (error) {
    if (error.code === "23505") throw new Error("이미 친구입니다");
    throw error;
  }
}

export async function removeFriend(userId: string, friendId: string) {
  const { error } = await supabase
    .from("relationships")
    .delete()
    .eq("owner_id", userId)
    .eq("friend_id", friendId);
  if (error) throw error;
}

export async function getFriends(userId: string) {
  const { data, error } = await supabase
    .from("relationships")
    .select("*, friend:profiles!relationships_friend_id_fkey(id, beep_id, nickname, status_icon)")
    .eq("owner_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return ((data ?? []) as RelationshipRow[]).map(mapRelationshipToFriendship);
}

export async function updateFriendNickname(
  userId: string,
  friendId: string,
  nickname: string
) {
  const { error } = await supabase
    .from("relationships")
    .update({ nickname })
    .eq("owner_id", userId)
    .eq("friend_id", friendId);
  if (error) throw error;
}

export async function updateVibrationPattern(
  userId: string,
  friendId: string,
  pattern: string
) {
  const { error } = await supabase
    .from("relationships")
    .update({ vibration_pattern: pattern })
    .eq("owner_id", userId)
    .eq("friend_id", friendId);
  if (error) throw error;
}

function mapRelationshipToFriendship(row: RelationshipRow) {
  return {
    ...row,
    user_id: row.owner_id,
  };
}
