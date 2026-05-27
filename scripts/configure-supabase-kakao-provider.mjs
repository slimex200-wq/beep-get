const projectRef = process.env.PROJECT_REF ?? "dyuzxilukcwiavtvbmci";
const accessToken = required("SUPABASE_ACCESS_TOKEN");
const clientId = required("KAKAO_CLIENT_ID");
const clientSecret = required("KAKAO_CLIENT_SECRET");

const body = JSON.stringify({
  external_kakao_enabled: true,
  external_kakao_client_id: clientId,
  external_kakao_secret: clientSecret,
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

console.log(`Enabled Supabase Kakao provider for ${projectRef}.`);

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}
