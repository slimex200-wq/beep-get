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
  if (mode !== "passthrough-for-internal-testing") {
    return json(
      {
        error:
          "Store receipt verification is not configured. Set IAP_VERIFICATION_MODE only for internal TestFlight/Play tests, then replace this branch with App Store / Play receipt validation before launch.",
      },
      501,
    );
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const transactionId =
    body.transactionId ?? body.purchaseToken ?? `${platform}:${productId}:${crypto.randomUUID()}`;

  const { error: receiptError } = await admin.from("purchase_receipts").insert({
    user_id: user.id,
    pack_slug: packSlug,
    platform,
    product_id: productId,
    store_transaction_id: transactionId,
    store_purchase_token: body.purchaseToken ?? null,
    environment: body.environment ?? "internal",
    raw_payload: body.rawPayload ?? body,
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

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
