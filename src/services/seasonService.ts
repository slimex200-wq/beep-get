import { supabase } from "@/lib/supabase";

export async function getCurrentSeason() {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("seasons")
    .select("*")
    .lte("starts_at", now)
    .gte("ends_at", now)
    .single();
  if (error) return null;
  return data;
}

export async function getSeasonIcons(seasonId: string) {
  const { data, error } = await supabase
    .from("icons")
    .select("*")
    .eq("season_id", seasonId)
    .order("rarity", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getSeasonSkins(seasonId: string) {
  const { data, error } = await supabase
    .from("skins")
    .select("*")
    .eq("season_id", seasonId);
  if (error) throw error;
  return data ?? [];
}
