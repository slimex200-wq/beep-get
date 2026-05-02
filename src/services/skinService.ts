import { supabase } from "@/lib/supabase";

export async function getAllSkins() {
  const { data, error } = await supabase
    .from("skins")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getUserSkins(userId: string) {
  const { data, error } = await supabase
    .from("user_skins")
    .select("*, skin:skins(*)")
    .eq("user_id", userId);
  if (error) throw error;
  return data ?? [];
}

export async function purchaseSkin(userId: string, skinId: string) {
  const { error } = await supabase.from("user_skins").insert({
    user_id: userId,
    skin_id: skinId,
    acquired_type: "purchase",
  });
  if (error) {
    if (error.code === "23505") throw new Error("이미 보유한 스킨입니다");
    throw error;
  }
}

export async function setActiveSkin(userId: string, skinId: string) {
  const { error } = await supabase
    .from("profiles")
    .update({ active_skin_id: skinId })
    .eq("id", userId);
  if (error) throw error;
}

export async function getActiveSkinSlug(userId: string): Promise<string> {
  const { data, error } = await supabase
    .from("profiles")
    .select("active_skin_id, active_skin:skins!profiles_active_skin_id_fkey(slug)")
    .eq("id", userId)
    .single();
  if (error || !data?.active_skin) return "swiss-paper";
  return (data.active_skin as any).slug ?? "swiss-paper";
}
