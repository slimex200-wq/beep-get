import { supabase } from "@/lib/supabase";
import { BEEP_ID_LENGTH, MAX_BEEP_ID_RETRIES } from "@/lib/constants";
import * as Linking from "expo-linking";

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
  return signInWithOAuthProvider("google");
}

export async function signInWithApple() {
  return signInWithOAuthProvider("apple");
}

export async function exchangeOAuthCodeFromUrl(url: string): Promise<boolean> {
  const parsed = Linking.parse(url);
  const error =
    readQueryParam(parsed.queryParams?.error_description) ??
    readQueryParam(parsed.queryParams?.error);
  if (error) throw new Error(error);

  const code = readQueryParam(parsed.queryParams?.code);
  if (!code) return false;

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) throw exchangeError;
  return true;
}

async function signInWithOAuthProvider(provider: "google" | "apple") {
  const redirectTo = Linking.createURL("auth/callback");
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });
  if (error) throw error;
  if (data?.url) {
    await Linking.openURL(data.url);
  }
  return data;
}

export async function createUserProfile(userId: string, nickname: string) {
  void userId;

  for (let attempt = 0; attempt < MAX_BEEP_ID_RETRIES; attempt++) {
    const beepId = generateBeepId();
    const { data, error } = await supabase.rpc("create_profile", {
      p_nickname: nickname,
      p_beep_id: beepId,
    });
    if (!error) return readBeepId(data) ?? beepId;
    if (error.code !== "23505") throw error;
  }
  throw new Error("beep_id 생성 실패: 최대 재시도 횟수 초과");
}

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
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

function readBeepId(data: unknown): string | null {
  if (typeof data === "string") return data;
  if (data && typeof data === "object" && "beep_id" in data) {
    const beepId = (data as { beep_id?: unknown }).beep_id;
    return typeof beepId === "string" ? beepId : null;
  }
  return null;
}

function readQueryParam(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}
