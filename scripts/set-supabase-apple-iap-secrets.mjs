import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";

const projectRef = process.env.PROJECT_REF ?? "dyuzxilukcwiavtvbmci";
const issuerId = required("APP_STORE_CONNECT_ISSUER_ID");
const keyId = required("APP_STORE_CONNECT_KEY_ID");
const privateKey =
  process.env.APP_STORE_CONNECT_PRIVATE_KEY ??
  fs.readFileSync(required("APP_STORE_CONNECT_PRIVATE_KEY_PATH"), "utf8");
const bundleId = process.env.APP_BUNDLE_ID ?? "com.hypeboyo.beepget";
const envFile = path.join(os.tmpdir(), `beep-get-supabase-secrets-${randomUUID()}.env`);

try {
  fs.writeFileSync(
    envFile,
    [
      `APP_STORE_CONNECT_ISSUER_ID=${quoteEnv(issuerId)}`,
      `APP_STORE_CONNECT_KEY_ID=${quoteEnv(keyId)}`,
      `APP_STORE_CONNECT_PRIVATE_KEY=${quoteEnv(privateKey.replace(/\r?\n/g, "\\n"))}`,
      `APP_BUNDLE_ID=${quoteEnv(bundleId)}`,
      "",
    ].join("\n"),
    { encoding: "utf8", mode: 0o600 },
  );

  const args = [
    "supabase",
    "secrets",
    "set",
    "--project-ref",
    projectRef,
    "--env-file",
    envFile,
  ];

  if (process.platform === "win32") {
    execFileSync(`npx.cmd ${args.map(windowsShellQuote).join(" ")}`, {
      stdio: "inherit",
      shell: true,
    });
  } else {
    execFileSync("npx", args, { stdio: "inherit" });
  }
} finally {
  fs.rmSync(envFile, { force: true });
}

console.log(`Set App Store Server API secrets for ${projectRef}.`);

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function quoteEnv(value) {
  return JSON.stringify(String(value));
}

function windowsShellQuote(value) {
  return `"${String(value).replace(/"/g, '\\"')}"`;
}
