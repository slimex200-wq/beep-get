import { execFileSync } from "node:child_process";

const projectRef = process.env.PROJECT_REF ?? "dyuzxilukcwiavtvbmci";
const accessToken = required("SUPABASE_ACCESS_TOKEN");
const clientId =
  process.env.APPLE_CLIENT_ID ??
  process.env.APPLE_PROVIDER_CLIENT_IDS ??
  "com.hypeboyo.beepget.signin,com.hypeboyo.beepget";
const clientSecret =
  process.env.APPLE_CLIENT_SECRET ?? run("node", ["scripts/apple-client-secret.mjs"]).trim();

const body = JSON.stringify({
  external_apple_enabled: true,
  external_apple_client_id: clientId,
  external_apple_secret: clientSecret,
});

const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/config/auth`, {
  method: "PATCH",
  headers: {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  },
  body,
});

const payload = await response.json().catch(() => ({}));
if (!response.ok) {
  console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

console.log(`Enabled Supabase Apple provider for ${projectRef} with client_id ${clientId}.`);

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function run(command, args) {
  return execFileSync(command, args, { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] });
}
