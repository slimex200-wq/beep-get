import { supabase } from "@/lib/supabase";
import { BEEP_ID_LENGTH, MAX_BEEP_ID_RETRIES } from "@/lib/constants";
import * as AppleAuthentication from "expo-apple-authentication";
import * as Linking from "expo-linking";

const APPLE_NONCE_LENGTH = 32;
const APPLE_NONCE_CHARSET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-._";
const SHA256_K = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b,
  0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01,
  0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7,
  0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc,
  0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152,
  0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
  0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc,
  0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819,
  0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116, 0x1e376c08,
  0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f,
  0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
  0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];

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
  const rawNonce = createAppleRawNonce();
  const hashedNonce = await sha256Hex(rawNonce);
  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
    nonce: hashedNonce,
  });

  if (!credential.identityToken) {
    throw new Error("Apple sign-in did not return an identity token.");
  }

  const fullName = formatAppleFullName(credential.fullName);
  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: "apple",
    token: credential.identityToken,
    nonce: rawNonce,
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

function createAppleRawNonce(length = APPLE_NONCE_LENGTH) {
  const bytes = new Uint8Array(length);
  const cryptoSource = (
    globalThis as typeof globalThis & {
      crypto?: { getRandomValues?: (array: Uint8Array) => Uint8Array };
    }
  ).crypto;

  if (cryptoSource?.getRandomValues) {
    cryptoSource.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i += 1) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }

  return Array.from(
    bytes,
    (byte) => APPLE_NONCE_CHARSET[byte % APPLE_NONCE_CHARSET.length]
  ).join("");
}

async function sha256Hex(value: string) {
  const subtle = (
    globalThis as typeof globalThis & {
      crypto?: {
        subtle?: {
          digest?: (algorithm: string, data: Uint8Array) => Promise<ArrayBuffer>;
        };
      };
    }
  ).crypto?.subtle;

  if (subtle?.digest && typeof TextEncoder !== "undefined") {
    const hash = await subtle.digest("SHA-256", new TextEncoder().encode(value));
    return bytesToHex(new Uint8Array(hash));
  }

  return sha256HexFallback(value);
}

function sha256HexFallback(value: string) {
  const bytes = utf8Bytes(value);
  const bitLength = bytes.length * 8;
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) bytes.push(0);

  const highLength = Math.floor(bitLength / 0x100000000);
  const lowLength = bitLength >>> 0;
  for (let shift = 24; shift >= 0; shift -= 8) {
    bytes.push((highLength >>> shift) & 0xff);
  }
  for (let shift = 24; shift >= 0; shift -= 8) {
    bytes.push((lowLength >>> shift) & 0xff);
  }

  let h0 = 0x6a09e667;
  let h1 = 0xbb67ae85;
  let h2 = 0x3c6ef372;
  let h3 = 0xa54ff53a;
  let h4 = 0x510e527f;
  let h5 = 0x9b05688c;
  let h6 = 0x1f83d9ab;
  let h7 = 0x5be0cd19;
  const w = new Array<number>(64);

  for (let block = 0; block < bytes.length; block += 64) {
    for (let i = 0; i < 16; i += 1) {
      const offset = block + i * 4;
      w[i] =
        ((bytes[offset] << 24) |
          (bytes[offset + 1] << 16) |
          (bytes[offset + 2] << 8) |
          bytes[offset + 3]) >>>
        0;
    }
    for (let i = 16; i < 64; i += 1) {
      const s0 =
        rotateRight(w[i - 15], 7) ^
        rotateRight(w[i - 15], 18) ^
        (w[i - 15] >>> 3);
      const s1 =
        rotateRight(w[i - 2], 17) ^
        rotateRight(w[i - 2], 19) ^
        (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;
    let f = h5;
    let g = h6;
    let h = h7;

    for (let i = 0; i < 64; i += 1) {
      const s1 =
        rotateRight(e, 6) ^ rotateRight(e, 11) ^ rotateRight(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + s1 + ch + SHA256_K[i] + w[i]) >>> 0;
      const s0 =
        rotateRight(a, 2) ^ rotateRight(a, 13) ^ rotateRight(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (s0 + maj) >>> 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
    h5 = (h5 + f) >>> 0;
    h6 = (h6 + g) >>> 0;
    h7 = (h7 + h) >>> 0;
  }

  return [h0, h1, h2, h3, h4, h5, h6, h7]
    .map((word) => word.toString(16).padStart(8, "0"))
    .join("");
}

function utf8Bytes(value: string) {
  const bytes: number[] = [];
  for (let i = 0; i < value.length; i += 1) {
    let codePoint = value.charCodeAt(i);
    if (
      codePoint >= 0xd800 &&
      codePoint <= 0xdbff &&
      i + 1 < value.length
    ) {
      const next = value.charCodeAt(i + 1);
      if (next >= 0xdc00 && next <= 0xdfff) {
        codePoint = 0x10000 + ((codePoint - 0xd800) << 10) + (next - 0xdc00);
        i += 1;
      }
    }

    if (codePoint < 0x80) {
      bytes.push(codePoint);
    } else if (codePoint < 0x800) {
      bytes.push(0xc0 | (codePoint >> 6), 0x80 | (codePoint & 0x3f));
    } else if (codePoint < 0x10000) {
      bytes.push(
        0xe0 | (codePoint >> 12),
        0x80 | ((codePoint >> 6) & 0x3f),
        0x80 | (codePoint & 0x3f)
      );
    } else {
      bytes.push(
        0xf0 | (codePoint >> 18),
        0x80 | ((codePoint >> 12) & 0x3f),
        0x80 | ((codePoint >> 6) & 0x3f),
        0x80 | (codePoint & 0x3f)
      );
    }
  }
  return bytes;
}

function rotateRight(value: number, bits: number) {
  return (value >>> bits) | (value << (32 - bits));
}

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
    ""
  );
}
