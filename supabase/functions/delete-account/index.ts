// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.101.1";

// Web origins that are allowed to call this Edge Function. Mobile clients
// ignore CORS entirely, so leaving this empty keeps mobile working while
// blocking arbitrary web pages from invoking the function with a leaked
// Bearer token (security-auditor P1).
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

const confirmation = "DELETE_ACCOUNT";
const mediaBuckets = ["blink-originals", "blink-thumbs"];

Deno.serve(async (req) => {
  const cors = buildCorsHeaders(req);
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...cors, "Content-Type": "application/json" },
    });

  if (req.method === "OPTIONS") {
    return json({ ok: true });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return json({ error: "Delete account function is not configured." }, 500);
  }

  const body = await req.json().catch(() => ({}));
  if (body?.confirmation !== confirmation) {
    return json({ error: "Deletion confirmation is invalid." }, 400);
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
  if (userError || !user) {
    return json({ error: "Not authenticated." }, 401);
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const userIdHash = await sha256(user.id);
  const { data: deletionRequest, error: requestError } = await admin
    .from("account_deletion_requests")
    .insert({
      user_id: user.id,
      user_id_hash: userIdHash,
      status: "processing",
    })
    .select("id")
    .single();

  if (requestError) {
    return json({ error: requestError.message }, 500);
  }

  const requestId = deletionRequest.id;
  try {
    const appleRevoke = await revokeAppleTokenIfPresent(admin, user.id);
    await admin
      .from("account_deletion_requests")
      .update({
        apple_revoke_status: appleRevoke.status,
        apple_revoke_error: appleRevoke.error ?? null,
      })
      .eq("id", requestId);
    if (appleRevoke.status === "failed") {
      throw new Error(appleRevoke.error ?? "Apple token revocation failed.");
    }

    const exactMedia = await collectSignalMedia(admin, user.id);
    await removeExactMedia(admin, exactMedia);
    await removeUserStoragePrefixes(admin, user.id);

    const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
    if (deleteError) throw deleteError;

    await admin
      .from("account_deletion_requests")
      .update({
        user_id: null,
        status: "completed",
        completed_at: new Date().toISOString(),
        error_message: null,
      })
      .eq("id", requestId);

    return json({ deleted: true, requestId, appleRevokeStatus: appleRevoke.status });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Account deletion failed.";
    await admin
      .from("account_deletion_requests")
      .update({ status: "failed", error_message: message })
      .eq("id", requestId);
    return json({ error: message, requestId }, 500);
  }
});

async function revokeAppleTokenIfPresent(admin, userId) {
  const { data: tokenRow, error: tokenError } = await admin
    .from("apple_auth_tokens")
    .select("client_id, token_type, token_ciphertext, token_iv")
    .eq("user_id", userId)
    .maybeSingle();

  if (tokenError) {
    return { status: "failed", error: tokenError.message };
  }
  if (!tokenRow) {
    return { status: "not_available" };
  }

  const encryptionSecret = Deno.env.get("APPLE_TOKEN_ENCRYPTION_KEY");
  if (!encryptionSecret) {
    return { status: "failed", error: "APPLE_TOKEN_ENCRYPTION_KEY is not configured." };
  }

  const token = await decryptToken(
    tokenRow.token_ciphertext,
    tokenRow.token_iv,
    encryptionSecret,
  );
  const revoke = await revokeAppleToken(tokenRow.client_id, tokenRow.token_type, token);
  if (revoke.status === "completed" || revoke.status === "already_revoked") {
    await admin.from("apple_auth_tokens").delete().eq("user_id", userId);
  }
  return revoke;
}

async function revokeAppleToken(clientId, tokenType, token) {
  try {
    const clientSecret = await createAppleClientSecret(clientId);
    if (!clientSecret.ok) return { status: "failed", error: clientSecret.error };

    const response = await fetch("https://appleid.apple.com/auth/revoke", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret.jwt,
        token,
        token_type_hint: tokenType,
      }),
    });
    if (response.ok) return { status: "completed" };

    const payload = await response.json().catch(() => ({}));
    const appleError = payload?.error ?? payload?.error_description ?? "";
    if (/invalid_(grant|token)/i.test(appleError)) {
      return { status: "already_revoked", error: appleError };
    }

    return {
      status: "failed",
      error: appleError || `Apple revoke failed with HTTP ${response.status}.`,
    };
  } catch (err) {
    return {
      status: "failed",
      error: err instanceof Error ? err.message : "Apple token revoke failed.",
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
      error: err instanceof Error ? err.message : "Failed to create Apple client secret.",
    };
  }
}

async function decryptToken(ciphertext, iv, secret) {
  const key = await deriveAesKey(secret);
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: base64UrlToBytes(iv) },
    key,
    base64UrlToBytes(ciphertext),
  );
  return new TextDecoder().decode(decrypted);
}

async function deriveAesKey(secret) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(secret));
  return crypto.subtle.importKey("raw", digest, { name: "AES-GCM" }, false, [
    "encrypt",
    "decrypt",
  ]);
}

async function collectSignalMedia(admin, userId) {
  const { data: signals, error: signalsError } = await admin
    .from("signals")
    .select("id")
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);

  if (signalsError) throw signalsError;

  const signalIds = (signals ?? []).map((signal) => signal.id).filter(Boolean);
  if (signalIds.length === 0) return [];

  const { data: mediaRows, error: mediaError } = await admin
    .from("signal_media")
    .select("bucket, object_key, thumbnail_key, strip_keys")
    .in("signal_id", signalIds);

  if (mediaError) throw mediaError;
  return mediaRows ?? [];
}

async function removeExactMedia(admin, mediaRows) {
  const pathsByBucket = new Map();
  for (const media of mediaRows) {
    addPath(pathsByBucket, media.bucket ?? "blink-originals", media.object_key);
    addPath(pathsByBucket, "blink-thumbs", media.thumbnail_key);
    for (const key of media.strip_keys ?? []) {
      addPath(pathsByBucket, "blink-thumbs", key);
    }
  }

  for (const [bucket, paths] of pathsByBucket) {
    await removePaths(admin, bucket, [...paths]);
  }
}

async function removeUserStoragePrefixes(admin, userId) {
  for (const bucket of mediaBuckets) {
    const paths = await listAllStoragePaths(admin, bucket, userId);
    await removePaths(admin, bucket, paths);
  }
}

async function listAllStoragePaths(admin, bucket, prefix) {
  const { data, error } = await admin.storage.from(bucket).list(prefix, {
    limit: 1000,
    sortBy: { column: "name", order: "asc" },
  });
  if (error) throw error;

  const paths = [];
  for (const item of data ?? []) {
    const path = `${prefix}/${item.name}`;
    if (item.id || item.metadata) {
      paths.push(path);
    } else {
      paths.push(...(await listAllStoragePaths(admin, bucket, path)));
    }
  }
  return paths;
}

async function removePaths(admin, bucket, paths) {
  const uniquePaths = [...new Set(paths.filter(Boolean))];
  for (let index = 0; index < uniquePaths.length; index += 100) {
    const chunk = uniquePaths.slice(index, index + 100);
    if (chunk.length === 0) continue;
    const { error } = await admin.storage.from(bucket).remove(chunk);
    if (error) throw error;
  }
}

function addPath(pathsByBucket, bucket, path) {
  if (!bucket || !path) return;
  if (!pathsByBucket.has(bucket)) pathsByBucket.set(bucket, new Set());
  pathsByBucket.get(bucket).add(path);
}

async function sha256(value) {
  const bytes = new TextEncoder().encode(value);
  const hashBuffer = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(hashBuffer)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
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

function base64UrlToBytes(value) {
  return new Uint8Array(base64ToBytes(value.replace(/-/g, "+").replace(/_/g, "/")));
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

