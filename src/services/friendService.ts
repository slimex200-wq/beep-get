import { supabase } from "@/lib/supabase";
import { isValidBeepId } from "@/services/authService";

export async function findUserByBeepId(beepId: string) {
  if (!isValidBeepId(beepId)) return null;
  const { data, error } = await supabase
    .from("users")
    .select("id, beep_id, nickname")
    .eq("beep_id", beepId)
    .single();
  if (error) return null;
  return data;
}

export async function addFriend(userId: string, friendId: string, nickname?: string) {
  if (userId === friendId) throw new Error("자기 자신을 친구로 추가할 수 없습니다");

  const { error } = await supabase.from("friendships").insert({
    user_id: userId,
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
    .from("friendships")
    .delete()
    .eq("user_id", userId)
    .eq("friend_id", friendId);
  if (error) throw error;
}

export async function getFriends(userId: string) {
  const { data, error } = await supabase
    .from("friendships")
    .select("*, friend:users!friendships_friend_id_fkey(id, beep_id, nickname, status_icon)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function updateFriendNickname(
  userId: string,
  friendId: string,
  nickname: string
) {
  const { error } = await supabase
    .from("friendships")
    .update({ nickname })
    .eq("user_id", userId)
    .eq("friend_id", friendId);
  if (error) throw error;
}

export async function updateVibrationPattern(
  userId: string,
  friendId: string,
  pattern: string
) {
  const { error } = await supabase
    .from("friendships")
    .update({ vibration_pattern: pattern })
    .eq("user_id", userId)
    .eq("friend_id", friendId);
  if (error) throw error;
}
