import { supabase } from "@/lib/supabase";
import {
  DEFAULT_IDENTITY_PACK_SLUG,
  getIdentitySlugForSkin,
} from "@/design/identityPacks";

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

export async function setActiveIdentityPack(packSlug: string) {
  const { error } = await supabase.rpc("set_active_identity_pack", {
    p_pack_slug: packSlug,
  });
  if (error) throw error;
}

export async function getActiveIdentityPackSlug(
  userId: string
): Promise<string> {
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "active_identity_pack, active_skin:skins!profiles_active_skin_id_fkey(slug)"
    )
    .eq("id", userId)
    .single();
  if (error || !data) return DEFAULT_IDENTITY_PACK_SLUG;
  if (typeof data.active_identity_pack === "string" && data.active_identity_pack) {
    return data.active_identity_pack;
  }
  // Fall back to deriving the identity pack from the legacy palette skin so
  // profiles set before active_identity_pack existed still resolve a pack.
  const paletteSlug = (data.active_skin as any)?.slug;
  if (typeof paletteSlug === "string" && paletteSlug) {
    return getIdentitySlugForSkin(paletteSlug);
  }
  return DEFAULT_IDENTITY_PACK_SLUG;
}
