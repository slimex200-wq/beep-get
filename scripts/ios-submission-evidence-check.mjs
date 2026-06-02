import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const evidencePath = process.argv[2];
const checks = [];
const appConfig = readJson("app.json").expo;
const requiredEnvNames = [
  "EXPO_PUBLIC_SUPABASE_URL",
  "EXPO_PUBLIC_SUPABASE_ANON_KEY",
  "EXPO_PUBLIC_PRIVACY_URL",
  "EXPO_PUBLIC_ACCOUNT_DELETION_URL",
  "EXPO_PUBLIC_SUPPORT_URL",
  "EXPO_PUBLIC_ENABLE_GOOGLE_AUTH",
  "EXPO_PUBLIC_ENABLE_KAKAO_AUTH",
  "EXPO_PUBLIC_ENABLE_IAP_STORE",
];
const requiredFunctions = ["store-apple-revocation-token", "delete-account"];
const requiredAppleSecretNames = [
  "APPLE_TEAM_ID",
  "APPLE_KEY_ID",
  "APPLE_PRIVATE_KEY",
  "APPLE_TOKEN_CLIENT_ID",
  "APPLE_TOKEN_ENCRYPTION_KEY",
];
const requiredFlowIds = Array.from({ length: 16 }, (_, index) =>
  `IOS-QA-${String(index + 1).padStart(3, "0")}`,
);
const skinProductIds = [
  "beepget.pack.school_desk",
  "beepget.pack.cherry_dot",
  "beepget.pack.photo_booth_blink",
  "beepget.pack.night_signal",
];
const requiredEvidenceRefGroups = [
  "build",
  "publicUrls",
  "easEnv",
  "supabase",
  "appStoreConnect",
  "testflight",
  "deletionAudit",
  "redaction",
];
const requiredAppStoreConnectEvidenceRefs = [
  "metadata",
  "screenshots",
  "privacy",
  "reviewNotes",
];

if (!evidencePath || evidencePath === "--help" || evidencePath === "-h") {
  printUsage();
  process.exit(evidencePath ? 0 : 1);
}

const fullPath = path.resolve(root, evidencePath);
let source = "";
let evidence;
try {
  source = fs.readFileSync(fullPath, "utf8");
  evidence = JSON.parse(source);
} catch (err) {
  console.error(
    `Could not read iOS submission evidence JSON: ${err instanceof Error ? err.message : err}`,
  );
  printUsage();
  process.exit(1);
}

scanForSecretLeaks(evidence, source).forEach((label) => check(label, false));

check("Build has EAS build URL", isHttpsUrl(evidence.build?.easBuildUrl));
check("Build has App Store Connect build number", isFilled(evidence.build?.appStoreConnectBuildNumber));
check("Build app version matches app config", evidence.build?.appVersion === appConfig.version);
check(
  "Build App Store Connect build number includes app version",
  typeof evidence.build?.appStoreConnectBuildNumber === "string" &&
    evidence.build.appStoreConnectBuildNumber.includes(appConfig.version),
);
check("Build names TestFlight group", isFilled(evidence.build?.testFlightGroup));
check("Build names backend project", isFilled(evidence.build?.backendProject));
check("Build backend project is beep-get-prod", evidence.build?.backendProject === "dyuzxilukcwiavtvbmci");
check("Build uses production EAS profile", evidence.build?.easBuildProfile === "production");
check("Build uses production EAS channel", evidence.build?.easChannel === "production");
check(
  "Build records tester devices and iOS versions",
  nonEmptyArray(evidence.build?.testerDevices) && nonEmptyArray(evidence.build?.iosVersions),
);
requiredEvidenceRefGroups.forEach((group) =>
  check(`Evidence references include ${group}`, nonEmptyArray(evidence.evidenceRefs?.[group])),
);

check("Public privacy URL is HTTPS", isHttpsUrl(evidence.publicUrls?.privacyUrl));
check("Public account deletion URL is HTTPS", isHttpsUrl(evidence.publicUrls?.accountDeletionUrl));
check("Public support URL is HTTPS", isHttpsUrl(evidence.publicUrls?.supportUrl));

const easEnvNames = evidence.easEnv?.namesPresent ?? [];
requiredEnvNames.forEach((name) => check(`EAS production env includes ${name}`, easEnvNames.includes(name)));
const easPublicValues = evidence.easEnv?.publicValues ?? {};
check(
  "EAS public Supabase URL matches backend project",
  easPublicValues.EXPO_PUBLIC_SUPABASE_URL === "https://dyuzxilukcwiavtvbmci.supabase.co",
);
check(
  "EAS public privacy URL matches evidence URL",
  easPublicValues.EXPO_PUBLIC_PRIVACY_URL === evidence.publicUrls?.privacyUrl &&
    isHttpsUrl(easPublicValues.EXPO_PUBLIC_PRIVACY_URL),
);
check(
  "EAS public account deletion URL matches evidence URL",
  easPublicValues.EXPO_PUBLIC_ACCOUNT_DELETION_URL === evidence.publicUrls?.accountDeletionUrl &&
    isHttpsUrl(easPublicValues.EXPO_PUBLIC_ACCOUNT_DELETION_URL),
);
check(
  "EAS public support URL matches evidence URL",
  easPublicValues.EXPO_PUBLIC_SUPPORT_URL === evidence.publicUrls?.supportUrl &&
    isHttpsUrl(easPublicValues.EXPO_PUBLIC_SUPPORT_URL),
);
const releaseFlags = evidence.build?.releaseFlags ?? evidence.easEnv?.releaseFlags ?? {};
check("Google auth remains explicitly flagged", ["0", "1"].includes(releaseFlags.EXPO_PUBLIC_ENABLE_GOOGLE_AUTH));
check("Kakao auth remains explicitly flagged", ["0", "1"].includes(releaseFlags.EXPO_PUBLIC_ENABLE_KAKAO_AUTH));
check("IAP store remains explicitly flagged", ["0", "1"].includes(releaseFlags.EXPO_PUBLIC_ENABLE_IAP_STORE));
check(
  "EAS Google auth flag matches build release flag",
  easPublicValues.EXPO_PUBLIC_ENABLE_GOOGLE_AUTH === releaseFlags.EXPO_PUBLIC_ENABLE_GOOGLE_AUTH,
);
check(
  "EAS Kakao auth flag matches build release flag",
  easPublicValues.EXPO_PUBLIC_ENABLE_KAKAO_AUTH === releaseFlags.EXPO_PUBLIC_ENABLE_KAKAO_AUTH,
);
check(
  "EAS IAP store flag matches build release flag",
  easPublicValues.EXPO_PUBLIC_ENABLE_IAP_STORE === releaseFlags.EXPO_PUBLIC_ENABLE_IAP_STORE,
);
if (releaseFlags.EXPO_PUBLIC_ENABLE_GOOGLE_AUTH === "1") {
  check("Google auth QA passed when enabled", evidence.secondaryOAuthQA?.google === "pass");
  check("Evidence references include secondaryOAuth", nonEmptyArray(evidence.evidenceRefs?.secondaryOAuth));
}
if (releaseFlags.EXPO_PUBLIC_ENABLE_KAKAO_AUTH === "1") {
  check("Kakao auth QA passed when enabled", evidence.secondaryOAuthQA?.kakao === "pass");
  check("Evidence references include secondaryOAuth", nonEmptyArray(evidence.evidenceRefs?.secondaryOAuth));
}

check(
  "Supabase Apple token migration is applied",
  evidence.supabase?.migrationApplied === "20260601120000_apple_auth_tokens.sql",
);
const deployedFunctions = evidence.supabase?.functionsDeployed ?? [];
requiredFunctions.forEach((name) => check(`Supabase function deployed: ${name}`, deployedFunctions.includes(name)));
const presentSecretNames = evidence.supabase?.appleRevocationSecretNamesPresent ?? [];
requiredAppleSecretNames.forEach((name) =>
  check(`Supabase Apple revocation secret name present: ${name}`, presentSecretNames.includes(name)),
);

[
  "metadataEntered",
  "screenshotsEntered",
  "privacyAnswersEntered",
  "reviewNotesEntered",
].forEach((field) => check(`App Store Connect ${field}`, evidence.appStoreConnect?.[field] === true));
requiredAppStoreConnectEvidenceRefs.forEach((field) =>
  check(
    `App Store Connect evidence references include ${field}`,
    nonEmptyArray(evidence.appStoreConnect?.evidenceRefs?.[field]),
  ),
);
check(
  "App Store Connect privacy policy URL matches public URL",
  evidence.appStoreConnect?.privacyPolicyUrl === evidence.publicUrls?.privacyUrl &&
    isHttpsUrl(evidence.appStoreConnect?.privacyPolicyUrl),
);
check(
  "App Store Connect support URL matches public URL",
  evidence.appStoreConnect?.supportUrl === evidence.publicUrls?.supportUrl &&
    isHttpsUrl(evidence.appStoreConnect?.supportUrl),
);

check("TestFlight used two accounts", evidence.testflight?.twoAccounts === true);
const flows = evidence.testflight?.flows ?? {};
const flowEvidenceRefs = evidence.testflight?.flowEvidenceRefs ?? {};
requiredFlowIds.forEach((flowId) => check(`TestFlight flow passed: ${flowId}`, flows[flowId] === "pass"));
requiredFlowIds.forEach((flowId) =>
  check(`TestFlight flow evidence references include ${flowId}`, nonEmptyArray(flowEvidenceRefs[flowId])),
);
const permissionChecks = evidence.testflight?.permissionChecks ?? {};
check("TestFlight Blink did not request microphone permission", permissionChecks.blinkMicrophonePromptAbsent === true);
check("TestFlight Contacts prompt shows local-only copy", permissionChecks.contactsPromptLocalOnly === true);
check(
  "TestFlight permission evidence references include microphone",
  nonEmptyArray(permissionChecks.evidenceRefs?.microphone),
);
check(
  "TestFlight permission evidence references include contacts",
  nonEmptyArray(permissionChecks.evidenceRefs?.contacts),
);

check("Deletion audit requestId is UUID-like", isUuid(evidence.deletionAudit?.requestId));
check("Deletion audit status completed", evidence.deletionAudit?.status === "completed");
check(
  "Deletion audit Apple revoke status acceptable",
  ["completed", "already_revoked"].includes(evidence.deletionAudit?.appleRevokeStatus),
);
if (evidence.deletionAudit?.appleRevokeStatus === "already_revoked") {
  check(
    "Already-revoked Apple status has retry justification",
    isFilled(evidence.deletionAudit?.retryJustification),
  );
}
check("Deletion audit Apple revoke error is empty", evidence.deletionAudit?.appleRevokeErrorEmpty === true);
check("Deletion audit completed_at is present", evidence.deletionAudit?.completedAtPresent === true);

const iapEnabled = evidence.iap?.enabled === true;
if (iapEnabled) {
  check("IAP release flag is enabled when IAP evidence is enabled", releaseFlags.EXPO_PUBLIC_ENABLE_IAP_STORE === "1");
  check("Evidence references include iap", nonEmptyArray(evidence.evidenceRefs?.iap));
  const productResults = evidence.iap?.products ?? {};
  skinProductIds.forEach((productId) =>
    check(`IAP product passed: ${productId}`, productResults[productId] === "pass"),
  );
} else {
  check("IAP release flag is disabled when IAP evidence is not applicable", releaseFlags.EXPO_PUBLIC_ENABLE_IAP_STORE === "0");
}

check("Redaction confirmed", evidence.redaction?.confirmedNoSecrets === true);

const failures = checks.filter((item) => !item.ok);
if (failures.length > 0) {
  console.error("iOS submission evidence check failed:");
  failures.forEach((item) => console.error(`- ${item.label}`));
  process.exit(1);
}

console.log(`iOS submission evidence checks passed (${checks.length}/${checks.length}).`);

function check(label, ok) {
  checks.push({ label, ok: Boolean(ok) });
}

function printUsage() {
  console.error("Usage: npm.cmd run release:ios:evidence -- <redacted-evidence.json>");
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function isFilled(value) {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    !/[<>]/.test(value) &&
    !/\b(todo|tbd|placeholder|redacted)\b/i.test(value) &&
    !/example\.(com|org|net)/i.test(value)
  );
}

function isHttpsUrl(value) {
  if (!isFilled(value)) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !isReservedHostname(url.hostname);
  } catch {
    return false;
  }
}

function nonEmptyArray(value) {
  return Array.isArray(value) && value.length > 0 && value.every((item) => isFilled(item));
}

function isUuid(value) {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value) &&
    !/^0{8}-0{4}-[1-5]0{3}-[89ab]0{3}-0{12}$/i.test(value)
  );
}

function scanForSecretLeaks(value, source) {
  const failures = [];
  const sourcePatterns = [
    [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, "Evidence JSON includes a private key block"],
    [/"?APPLE_PRIVATE_KEY"?\s*[:=]\s*["'][^"'<]{8,}/, "Evidence JSON appears to include APPLE_PRIVATE_KEY value"],
    [/"?APPLE_TOKEN_ENCRYPTION_KEY"?\s*[:=]\s*["'][^"'<]{8,}/, "Evidence JSON appears to include APPLE_TOKEN_ENCRYPTION_KEY value"],
    [/"?(refresh_token|access_token|token_ciphertext|token_iv)"?\s*[:=]\s*["'][^"'<]{6,}/i, "Evidence JSON appears to include raw token material"],
  ];
  sourcePatterns.forEach(([pattern, label]) => {
    if (pattern.test(source)) failures.push(label);
  });

  walk(value, [], (entryPath, key, entryValue) => {
    if (/password|privateKey|tokenCiphertext|tokenIv|refreshToken|accessToken|APPLE_PRIVATE_KEY|APPLE_TOKEN_ENCRYPTION_KEY/i.test(key)) {
      failures.push(`Evidence JSON uses forbidden secret-like key: ${entryPath.concat(key).join(".")}`);
    }
    if (
      typeof entryValue === "string" &&
      /-----BEGIN|refresh_token=|access_token=|token_ciphertext=|token_iv=/i.test(entryValue)
    ) {
      failures.push(`Evidence JSON includes secret-like value at ${entryPath.concat(key).join(".")}`);
    }
  });
  return failures;
}

function isReservedHostname(hostname) {
  const normalized = hostname.toLowerCase();
  return (
    normalized === "localhost" ||
    normalized.endsWith(".localhost") ||
    normalized.endsWith(".example") ||
    normalized.endsWith(".test") ||
    normalized.endsWith(".invalid")
  );
}

function walk(value, pathParts, visit) {
  if (!value || typeof value !== "object") return;
  Object.entries(value).forEach(([key, entryValue]) => {
    visit(pathParts, key, entryValue);
    if (entryValue && typeof entryValue === "object") walk(entryValue, pathParts.concat(key), visit);
  });
}
