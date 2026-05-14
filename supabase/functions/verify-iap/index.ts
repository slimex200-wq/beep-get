// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.101.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const productToPack = new Map([
  ["beepget.pack.school_desk", "school-desk"],
  ["beepget.pack.cherry_dot", "cherry-dot"],
  ["beepget.pack.photo_booth_blink", "photo-booth-blink"],
  ["beepget.pack.night_signal", "night-signal"],
]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return json({ ok: true });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return json({ error: "IAP verifier is not configured." }, 500);
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
  const platform = body.platform;
  const productId = body.productId;
  const packSlug = body.packSlug ?? productToPack.get(productId);
  if (!["ios", "android"].includes(platform)) {
    return json({ error: "Unsupported store platform." }, 400);
  }
  if (!productToPack.has(productId) || productToPack.get(productId) !== packSlug) {
    return json({ error: "Unknown product mapping." }, 400);
  }

  const mode = Deno.env.get("IAP_VERIFICATION_MODE") ?? "strict";
  let verificationPayload = body.rawPayload ?? body;
  let transactionId = body.transactionId ?? body.purchaseToken;
  let receiptEnvironment = body.environment ?? "internal";

  if (mode !== "passthrough-for-internal-testing" && platform === "ios") {
    const verified = await verifyAppleTransaction(body, productId);
    if (!verified.ok) return json({ error: verified.error }, verified.status ?? 400);
    verificationPayload = verified.payload;
    transactionId = verified.transactionId;
    receiptEnvironment = verified.environment;
  } else if (mode !== "passthrough-for-internal-testing") {
    return json(
      {
        error:
          "Google Play receipt verification is not configured yet. iOS uses App Store Server API when APP_STORE_CONNECT_* secrets are set.",
      },
      501,
    );
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  transactionId = transactionId ?? `${platform}:${productId}:${crypto.randomUUID()}`;

  const { error: receiptError } = await admin.from("purchase_receipts").insert({
    user_id: user.id,
    pack_slug: packSlug,
    platform,
    product_id: productId,
    store_transaction_id: transactionId,
    store_purchase_token: body.purchaseToken ?? null,
    environment: receiptEnvironment,
    raw_payload: verificationPayload,
  });
  if (receiptError && !/duplicate key/i.test(receiptError.message ?? "")) {
    return json({ error: receiptError.message }, 500);
  }

  const { error: entitlementError } = await admin
    .from("identity_pack_entitlements")
    .upsert(
      {
        user_id: user.id,
        pack_slug: packSlug,
        acquired_type: "purchase",
        product_id: productId,
        platform,
        store_transaction_id: transactionId,
        acquired_at: new Date().toISOString(),
      },
      { onConflict: "user_id,pack_slug" },
    );
  if (entitlementError) return json({ error: entitlementError.message }, 500);

  return json({ ok: true, packSlug, productId });
});

async function verifyAppleTransaction(body, expectedProductId) {
  const transactionId = body.transactionId ?? body.purchaseToken;
  if (!transactionId) {
    return { ok: false, status: 400, error: "Apple transactionId is required." };
  }

  const bundleId = Deno.env.get("APP_BUNDLE_ID") ?? "com.hypeboyo.beepget";
  const firstEnvironment = body.environment === "sandbox" ? "sandbox" : "production";
  const first = await fetchAppleTransactionInfo(transactionId, firstEnvironment, bundleId);
  const result =
    first.status === 404 && firstEnvironment === "production"
      ? await fetchAppleTransactionInfo(transactionId, "sandbox", bundleId)
      : first;

  if (!result.ok) {
    return {
      ok: false,
      status: result.status,
      error: result.error ?? "Apple transaction verification failed.",
    };
  }

  const signedTransactionInfo = result.payload?.signedTransactionInfo;
  const transaction = decodeJwsPayload(signedTransactionInfo);
  if (!transaction) {
    return { ok: false, status: 400, error: "Apple transaction payload is invalid." };
  }
  if (transaction.productId !== expectedProductId) {
    return { ok: false, status: 400, error: "Apple productId does not match this pack." };
  }
  if (transaction.bundleId !== bundleId) {
    return { ok: false, status: 400, error: "Apple bundleId does not match this app." };
  }
  if (transaction.revocationDate) {
    return { ok: false, status: 400, error: "Apple transaction has been revoked." };
  }

  return {
    ok: true,
    transactionId: transaction.transactionId ?? transactionId,
    environment: result.environment,
    payload: {
      source: "app_store_server_api",
      environment: result.environment,
      transaction,
      response: result.payload,
    },
  };
}

async function fetchAppleTransactionInfo(transactionId, environment, bundleId) {
  const token = await createAppStoreServerToken(bundleId);
  if (!token.ok) return token;

  const host =
    environment === "sandbox"
      ? "https://api.storekit-sandbox.apple.com"
      : "https://api.storekit.apple.com";
  const response = await fetch(
    `${host}/inApps/v1/transactions/${encodeURIComponent(transactionId)}`,
    {
      headers: {
        Authorization: `Bearer ${token.jwt}`,
        Accept: "application/json",
      },
    },
  );
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      error: payload?.errorMessage ?? payload?.errorCode ?? "Apple transaction lookup failed.",
    };
  }
  return { ok: true, environment, payload };
}

async function createAppStoreServerToken(bundleId) {
  try {
    const issuerId = Deno.env.get("APP_STORE_CONNECT_ISSUER_ID");
    const keyId = Deno.env.get("APP_STORE_CONNECT_KEY_ID");
    const privateKey = Deno.env.get("APP_STORE_CONNECT_PRIVATE_KEY");
    if (!issuerId || !keyId || !privateKey) {
      return {
        ok: false,
        status: 500,
        error:
          "App Store Server API is not configured. Set APP_STORE_CONNECT_ISSUER_ID, APP_STORE_CONNECT_KEY_ID, APP_STORE_CONNECT_PRIVATE_KEY, and APP_BUNDLE_ID.",
      };
    }

    const now = Math.floor(Date.now() / 1000);
    const header = { alg: "ES256", kid: keyId, typ: "JWT" };
    const claims = {
      iss: issuerId,
      iat: now,
      exp: now + 900,
      aud: "appstoreconnect-v1",
      bid: bundleId,
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
      error: err instanceof Error ? err.message : "Failed to create App Store Server API token.",
    };
  }
}

function decodeJwsPayload(jws) {
  if (!jws || typeof jws !== "string") return null;
  const [, payload] = jws.split(".");
  if (!payload) return null;
  try {
    return JSON.parse(new TextDecoder().decode(base64UrlToBytes(payload)));
  } catch {
    return null;
  }
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
  return base64ToBytes(value.replace(/-/g, "+").replace(/_/g, "/"));
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

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
