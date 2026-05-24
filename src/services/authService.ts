import { supabase } from "@/lib/supabase";
import { BEEP_ID_LENGTH, MAX_BEEP_ID_RETRIES } from "@/lib/constants";
import * as AppleAuthentication from "expo-apple-authentication";
import * as Linking from "expo-linking";

export type UserProfile = {
  id: string;
  beep_id: string;
  nickname: string;
  status_icon: string;
  active_skin_id: string | null;
};

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
  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
  });

  if (!credential.identityToken) {
    throw new Error("Apple sign-in did not return an identity token.");
  }

  const fullName = formatAppleFullName(credential.fullName);
  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: "apple",
    token: credential.identityToken,
  });
  if (error) throw error;
  if (fullName) {
    // Apple full_name metadata is a best-effort enrichment - the user can
    // still set their nickname in onboarding. Don't block sign-in on failure.
    await supabase.auth.updateUser({
      data: {
        full_name: fullName,
        name: fullName,
      },
    });
  }
  return data;
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

export async function createUserProfile(
  userId: string,
  nickname: string
): Promise<UserProfile> {
  for (let attempt = 0; attempt < MAX_BEEP_ID_RETRIES; attempt++) {
    const beepId = generateBeepId();
    const { data, error } = await supabase.rpc("create_profile", {
      p_nickname: nickname,
      p_beep_id: beepId,
    });
    if (!error) {
      return readProfile(data) ?? getUserProfile(userId);
    }
    if (error.code !== "23505") throw error;
  }
  throw new Error("beep_id 생성 실패: 최대 재시도 횟수 초과");
}

export async function getUserProfile(userId: string): Promise<UserProfile> {
  const { data, error } = await supabase.rpc("get_own_profile");
  if (error) throw error;

  const profile = readProfile(data);
  if (!profile || profile.id !== userId) {
    throw new Error("Profile not found");
  }
  if (!profile.nickname.trim()) {
    throw new Error("Profile incomplete");
  }
  return profile;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

function readProfile(data: unknown): UserProfile | null {
  if (data && typeof data === "object") {
    const row = data as Partial<UserProfile>;
    if (typeof row.beep_id === "string") {
      return {
        id: typeof row.id === "string" ? row.id : "",
        beep_id: row.beep_id,
        nickname: typeof row.nickname === "string" ? row.nickname : "",
        status_icon:
          typeof row.status_icon === "string" ? row.status_icon : "online",
        active_skin_id:
          typeof row.active_skin_id === "string" ? row.active_skin_id : null,
      };
    }
  }

  return null;
}

function readQueryParam(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function formatAppleFullName(
  fullName: AppleAuthentication.AppleAuthenticationFullName | null
) {
  if (!fullName) return null;
  const value = [
    fullName.givenName,
    fullName.middleName,
    fullName.familyName,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();
  return value || null;
}
