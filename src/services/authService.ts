import { supabase } from "@/lib/supabase";
import { BEEP_ID_LENGTH, MAX_BEEP_ID_RETRIES } from "@/lib/constants";

export function generateBeepId(): string {
  const first = Math.floor(Math.random() * 9) + 1; // 1-9
  const rest = Array.from({ length: BEEP_ID_LENGTH - 1 }, () =>
    Math.floor(Math.random() * 10)
  ).join("");
  return `${first}${rest}`;
}

export function isValidBeepId(id: string): boolean {
  return new RegExp(`^\\d{${BEEP_ID_LENGTH}}$`).test(id);
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
  });
  if (error) throw error;
  return data;
}

export async function signInWithApple() {
  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: "apple",
    token: "", // Apple Sign In token from native
  });
  if (error) throw error;
  return data;
}

export async function createUserProfile(userId: string, nickname: string) {
  let beepId = "";
  for (let attempt = 0; attempt < MAX_BEEP_ID_RETRIES; attempt++) {
    beepId = generateBeepId();
    const { error } = await supabase.from("users").insert({
      id: userId,
      beep_id: beepId,
      nickname,
    });
    if (!error) {
      // Grant default free skin
      const { data: freeSkin } = await supabase
        .from("skins")
        .select("id")
        .eq("is_free", true)
        .single();
      if (freeSkin) {
        await supabase.from("user_skins").insert({
          user_id: userId,
          skin_id: freeSkin.id,
          acquired_type: "default",
        });
        await supabase
          .from("users")
          .update({ active_skin_id: freeSkin.id })
          .eq("id", userId);
      }
      return beepId;
    }
    if (error.code !== "23505") throw error; // 23505 = unique violation → retry
  }
  throw new Error("beep_id 생성 실패: 최대 재시도 횟수 초과");
}

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
