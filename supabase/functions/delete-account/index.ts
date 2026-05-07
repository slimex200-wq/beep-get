// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.101.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const confirmation = "DELETE_ACCOUNT";
const mediaBuckets = ["blink-originals", "blink-thumbs"];

Deno.serve(async (req) => {
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

    return json({ deleted: true, requestId });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Account deletion failed.";
    await admin
      .from("account_deletion_requests")
      .update({ status: "failed", error_message: message })
      .eq("id", requestId);
    return json({ error: message, requestId }, 500);
  }
});

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

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}
