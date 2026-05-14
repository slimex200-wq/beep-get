import { execFileSync } from "node:child_process";
import fs from "node:fs";

const projectRef = process.env.PROJECT_REF ?? "dyuzxilukcwiavtvbmci";
const issuerId = required("APP_STORE_CONNECT_ISSUER_ID");
const keyId = required("APP_STORE_CONNECT_KEY_ID");
const privateKey =
  process.env.APP_STORE_CONNECT_PRIVATE_KEY ??
  fs.readFileSync(required("APP_STORE_CONNECT_PRIVATE_KEY_PATH"), "utf8");
const bundleId = process.env.APP_BUNDLE_ID ?? "com.hypeboyo.beepget";

execFileSync(
  "npx.cmd",
  [
    "supabase",
    "secrets",
    "set",
    "--project-ref",
    projectRef,
    `APP_STORE_CONNECT_ISSUER_ID=${issuerId}`,
    `APP_STORE_CONNECT_KEY_ID=${keyId}`,
    `APP_STORE_CONNECT_PRIVATE_KEY=${privateKey}`,
    `APP_BUNDLE_ID=${bundleId}`,
  ],
  { stdio: "inherit" },
);

console.log(`Set App Store Server API secrets for ${projectRef}.`);

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}
