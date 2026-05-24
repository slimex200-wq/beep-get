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
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return json({ error: "Push function is not configured." }, 500);
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
  if (!body.signalId) return json({ error: "signalId is required." }, 400);

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: signal, error: signalError } = await admin
    .from("signals")
    .select("id, sender_id, receiver_id, kind, code, memo")
    .eq("id", body.signalId)
    .single();
  if (signalError || !signal) return json({ error: signalError?.message ?? "Signal not found." }, 404);
  if (signal.sender_id !== user.id) return json({ error: "Only the sender can notify this signal." }, 403);

  const { data: tokens, error: tokenError } = await admin
    .from("push_tokens")
    .select("expo_push_token")
    .eq("user_id", signal.receiver_id)
    .eq("enabled", true);
  if (tokenError) return json({ error: tokenError.message }, 500);

  const pushTokens = [...new Set((tokens ?? []).map((row) => row.expo_push_token).filter(Boolean))];
  if (pushTokens.length === 0) {
    await admin.from("notification_deliveries").insert({
      signal_id: signal.id,
      receiver_id: signal.receiver_id,
      status: "skipped",
      response: { reason: "no_push_tokens" },
    });
    return json({ ok: true, sent: 0, skipped: true });
  }

  // Dedupe (B2): bulk insert 'queued' rows for every (signal_id, token).
  // Partial unique index notification_deliveries_signal_token_active_idx
  // guarantees at most one queued/sent row per (signal_id, expo_push_token);
  // any concurrent invocation trips 23505 and short-circuits without
  // re-pushing. failed/skipped rows are excluded from the index so retries
  // remain possible.
  const { error: reserveError } = await admin
    .from("notification_deliveries")
    .insert(
      pushTokens.map((expoPushToken) => ({
        signal_id: signal.id,
        receiver_id: signal.receiver_id,
        expo_push_token: expoPushToken,
        status: "queued",
        response: {},
      })),
    );
  if (reserveError) {
    if (reserveError.code === "23505") {
      return json({ ok: true, sent: 0, alreadyDelivered: true });
    }
    return json({ error: reserveError.message }, 500);
  }

  const messages = pushTokens.map((to) => ({
    to,
    sound: "default",
    title: signal.kind === "blink" ? "Blink arrived" : "Beep arrived",
    body: signal.code ? `NO. ${signal.code}` : "Open Beep Get",
    data: { signalId: signal.id, kind: signal.kind },
  }));

  const response = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "Accept-Encoding": "gzip, deflate",
    },
    body: JSON.stringify(messages),
  });
  const payload = await response.json().catch(() => ({ status: response.status }));
  const status = response.ok ? "sent" : "failed";

  // Update the previously reserved 'queued' rows in place rather than
  // inserting again - the partial unique index forbids two queued/sent
  // rows for the same (signal_id, expo_push_token).
  await admin
    .from("notification_deliveries")
    .update({
      status,
      response: payload,
      sent_at: response.ok ? new Date().toISOString() : null,
    })
    .eq("signal_id", signal.id)
    .eq("status", "queued");

  return json({ ok: response.ok, sent: response.ok ? pushTokens.length : 0, response: payload }, response.ok ? 200 : 502);
});

