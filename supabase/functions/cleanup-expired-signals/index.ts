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
    "Access-Control-Allow-Headers": "authorization, x-cleanup-secret, x-client-info, apikey, content-type",
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

  const expectedSecret = Deno.env.get("CLEANUP_SHARED_SECRET");
  if (!expectedSecret || req.headers.get("x-cleanup-secret") !== expectedSecret) {
    return json({ error: "Cleanup secret is invalid." }, 401);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    return json({ error: "Cleanup function is not configured." }, 500);
  }

  const body = await req.json().catch(() => ({}));
  const limit = Math.min(Math.max(Number(body.limit ?? 100), 1), 500);
  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: expiredMedia, error } = await admin.rpc("expire_unsaved_blink_media", {
    p_limit: limit,
  });
  if (error) return json({ error: error.message }, 500);

  const pathsByBucket = new Map();
  for (const media of expiredMedia ?? []) {
    addPath(pathsByBucket, media.bucket ?? "blink-originals", media.object_key);
    addPath(pathsByBucket, "blink-thumbs", media.thumbnail_key);
    for (const key of media.strip_keys ?? []) addPath(pathsByBucket, "blink-thumbs", key);
  }

  const removed = {};
  for (const [bucket, paths] of pathsByBucket) {
    removed[bucket] = await removePaths(admin, bucket, [...paths]);
  }

  return json({ ok: true, expired: expiredMedia?.length ?? 0, removed });
});

async function removePaths(admin, bucket, paths) {
  const uniquePaths = [...new Set(paths.filter(Boolean))];
  let count = 0;
  for (let index = 0; index < uniquePaths.length; index += 100) {
    const chunk = uniquePaths.slice(index, index + 100);
    const { error } = await admin.storage.from(bucket).remove(chunk);
    if (error) throw error;
    count += chunk.length;
  }
  return count;
}

function addPath(pathsByBucket, bucket, path) {
  if (!bucket || !path) return;
  if (!pathsByBucket.has(bucket)) pathsByBucket.set(bucket, new Set());
  pathsByBucket.get(bucket).add(path);
}

