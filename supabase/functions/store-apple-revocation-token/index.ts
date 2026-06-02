// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.101.1";

const ALLOWED_ORIGINS = new Set<string>([
  // "https://beep-get.com",
]);

function buildCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin");
  const allow = origin && ALLOWED_ORIGINS.has(origin) ? origin : "";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

Deno.serve(async (req) => {
  const cors = buildCorsHeaders(req);
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...cors, "Content-Type": "application/json" },
    });

  if (req.method === "OPTIONS") return json({ ok: true });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const encryptionSecret = Deno.env.get("APPLE_TOKEN_ENCRYPTION_KEY");
  if (!supabaseUrl || !anonKey || !serviceRoleKey || !encryptionSecret) {
    return json({ error: "Apple revocation token function is not configured." }, 500);
  }

  const authorization = req.headers.get("authorization") ?? "";
  if (!authorization.toLowerCase().startsWith("bearer ")) {
    return json({ error: "Missing bearer token." }, 401);
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();
  if (userError || !user) return json({ error: "Not authenticated." }, 401);

  const body = await req.json().catch(() => ({}));
  const authorizationCode = body?.authorizationCode;
  if (typeof authorizationCode !== "string" || authorizationCode.trim().length < 8) {
    return json({ error: "Apple authorization code is required." }, 400);
  }

  const appleToken = await exchangeAuthorizationCode(authorizationCode);
  if (!appleToken.ok) return json({ error: appleToken.error }, appleToken.status ?? 500);

  const encrypted = await encryptToken(appleToken.token, encryptionSecret);
  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { error: upsertError } = await admin.from("apple_auth_tokens").upsert(
    {
      user_id: user.id,
      client_id: appleToken.clientId,
      token_type: appleToken.tokenType,
      token_ciphertext: encrypted.ciphertext,
      token_iv: encrypted.iv,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
  if (upsertError) return json({ error: upsertError.message }, 500);

  return json({ ok: true });
});

async function exchangeAuthorizationCode(authorizationCode) {
  try {
    const clientId = Deno.env.get("APPLE_TOKEN_CLIENT_ID") ?? Deno.env.get("APP_BUNDLE_ID");
    if (!clientId) {
      return { ok: false, status: 500, error: "APPLE_TOKEN_CLIENT_ID is not configured." };
    }
    const clientSecret = await createAppleClientSecret(clientId);
    if (!clientSecret.ok) return clientSecret;

    const response = await fetch("https://appleid.apple.com/auth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret.jwt,
        code: authorizationCode,
        grant_type: "authorization_code",
      }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        error: payload?.error_description ?? payload?.error ?? "Apple token exchange failed.",
      };
    }

    if (typeof payload.refresh_token === "string" && payload.refresh_token) {
      return { ok: true, clientId, tokenType: "refresh_token", token: payload.refresh_token };
    }
    return {
      ok: false,
      status: 502,
      error: "Apple token exchange returned no refresh token for account deletion revocation.",
    };
  } catch (err) {
    return {
      ok: false,
      status: 500,
      error: err instanceof Error ? err.message : "Apple token exchange failed.",
    };
  }
}

async function createAppleClientSecret(clientId) {
  try {
    const teamId = Deno.env.get("APPLE_TEAM_ID");
    const keyId = Deno.env.get("APPLE_KEY_ID");
    const privateKey = Deno.env.get("APPLE_PRIVATE_KEY");
    if (!teamId || !keyId || !privateKey) {
      return {
        ok: false,
        status: 500,
        error: "Apple client secret is not configured.",
      };
    }

    const now = Math.floor(Date.now() / 1000);
    const header = { alg: "ES256", kid: keyId, typ: "JWT" };
    const claims = {
      iss: teamId,
      iat: now,
      exp: now + 900,
      aud: "https://appleid.apple.com",
      sub: clientId,
    };
    const signingInput = `${base64UrlJson(header)}.${base64UrlJson(claims)}`;
    const key = await crypto.subtle.importKey(
      "pkcs8",
      pemToPkcs8(privateKey),
      { name: "ECDSA", namedCurve: "P-256" },
      false,
      ["sign"],
    );
    const signature = await crypto.subtle.sign(
      { name: "ECDSA", hash: "SHA-256" },
      key,
      new TextEncoder().encode(signingInput),
    );
    return { ok: true, jwt: `${signingInput}.${base64UrlBytes(new Uint8Array(signature))}` };
  } catch (err) {
    return {
      ok: false,
      status: 500,
      error: err instanceof Error ? err.message : "Failed to create Apple client secret.",
    };
  }
}

async function encryptToken(token, secret) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveAesKey(secret);
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(token),
  );
  return {
    ciphertext: base64UrlBytes(new Uint8Array(ciphertext)),
    iv: base64UrlBytes(iv),
  };
}

async function deriveAesKey(secret) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(secret));
  return crypto.subtle.importKey("raw", digest, { name: "AES-GCM" }, false, [
    "encrypt",
    "decrypt",
  ]);
}

function pemToPkcs8(value) {
  const normalized = value.replace(/\\n/g, "\n");
  const body = normalized
    .replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "")
    .replace(/\s+/g, "");
  return base64ToBytes(body);
}

function base64UrlJson(value) {
  return base64UrlBytes(new TextEncoder().encode(JSON.stringify(value)));
}

function base64UrlBytes(bytes) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64ToBytes(value) {
  const padded = value.padEnd(value.length + ((4 - (value.length % 4)) % 4), "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes.buffer;
}
