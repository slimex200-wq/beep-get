import crypto from "node:crypto";
import fs from "node:fs";

const teamId = required("APPLE_TEAM_ID");
const configuredClientIds =
  process.env.APPLE_CLIENT_ID ??
  process.env.APPLE_PROVIDER_CLIENT_IDS ??
  process.env.APPLE_SERVICES_ID ??
  "com.hypeboyo.beepget.signin";
const clientSecretSubject =
  process.env.APPLE_CLIENT_SECRET_SUB ??
  process.env.APPLE_SERVICES_ID ??
  configuredClientIds.split(",")[0].trim();
const keyId = required("APPLE_KEY_ID");
const privateKeyPath = required("APPLE_PRIVATE_KEY_PATH");
const privateKey = fs.readFileSync(privateKeyPath, "utf8");
const now = Math.floor(Date.now() / 1000);

const header = { alg: "ES256", kid: keyId };
const payload = {
  iss: teamId,
  iat: now,
  exp: now + 60 * 60 * 24 * 180,
  aud: "https://appleid.apple.com",
  sub: clientSecretSubject,
};

const signingInput = `${base64UrlJson(header)}.${base64UrlJson(payload)}`;
const signature = crypto.sign("sha256", Buffer.from(signingInput), {
  key: privateKey,
  dsaEncoding: "ieee-p1363",
});
process.stdout.write(`${signingInput}.${base64Url(signature)}\n`);

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function base64UrlJson(value) {
  return base64Url(Buffer.from(JSON.stringify(value)));
}

function base64Url(value) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}
