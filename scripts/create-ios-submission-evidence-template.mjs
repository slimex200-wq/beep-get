import fs from "node:fs";
import path from "node:path";

const defaultOutputPath = ".release/ios-submission-evidence.template.json";
const args = process.argv.slice(2);
const force = args.includes("--force");
const positionalArgs = args.filter((arg) => arg !== "--force");

if (positionalArgs.length > 1 || positionalArgs.some((arg) => arg.startsWith("--"))) {
  printUsage();
  process.exit(1);
}

const outputPath = positionalArgs[0] ?? defaultOutputPath;
const resolvedOutputPath = path.resolve(process.cwd(), outputPath);
const flowIds = Array.from({ length: 16 }, (_, index) =>
  `IOS-QA-${String(index + 1).padStart(3, "0")}`,
);

const template = {
  build: {
    easBuildUrl: "https://expo.dev/accounts/hypeboyo/projects/beep-get/builds/<real-build-id>",
    appVersion: "1.0.0",
    appStoreConnectBuildNumber: "1.0.0 (TODO App Store Connect build number)",
    easBuildProfile: "production",
    easChannel: "production",
    testFlightGroup: "TODO TestFlight group",
    testerDevices: ["TODO iPhone model and device label"],
    iosVersions: ["TODO iOS version"],
    backendProject: "dyuzxilukcwiavtvbmci",
    releaseFlags: {
      EXPO_PUBLIC_ENABLE_GOOGLE_AUTH: "0",
      EXPO_PUBLIC_ENABLE_KAKAO_AUTH: "0",
      EXPO_PUBLIC_ENABLE_IAP_STORE: "0",
    },
  },
  publicUrls: {
    privacyUrl: "https://your-domain.example/privacy",
    accountDeletionUrl: "https://your-domain.example/account-deletion",
    supportUrl: "https://your-domain.example/support",
  },
  evidenceRefs: {
    build: ["private-release/TODO-testflight-build-summary.png"],
    publicUrls: ["private-release/TODO-public-url-checks.png"],
    easEnv: ["private-release/TODO-eas-env-names.txt"],
    supabase: ["private-release/TODO-supabase-functions-and-audit.txt"],
    appStoreConnect: ["private-release/TODO-app-store-connect-metadata.png"],
    testflight: ["private-release/TODO-testflight-two-account-flow.md"],
    deletionAudit: ["private-release/TODO-deletion-audit-query-result.txt"],
    redaction: ["private-release/TODO-redaction-review.md"],
  },
  easEnv: {
    namesPresent: [
      "EXPO_PUBLIC_SUPABASE_URL",
      "EXPO_PUBLIC_SUPABASE_ANON_KEY",
      "EXPO_PUBLIC_PRIVACY_URL",
      "EXPO_PUBLIC_ACCOUNT_DELETION_URL",
      "EXPO_PUBLIC_SUPPORT_URL",
      "EXPO_PUBLIC_ENABLE_GOOGLE_AUTH",
      "EXPO_PUBLIC_ENABLE_KAKAO_AUTH",
      "EXPO_PUBLIC_ENABLE_IAP_STORE",
    ],
    publicValues: {
      EXPO_PUBLIC_SUPABASE_URL: "https://dyuzxilukcwiavtvbmci.supabase.co",
      EXPO_PUBLIC_PRIVACY_URL: "https://your-domain.example/privacy",
      EXPO_PUBLIC_ACCOUNT_DELETION_URL: "https://your-domain.example/account-deletion",
      EXPO_PUBLIC_SUPPORT_URL: "https://your-domain.example/support",
      EXPO_PUBLIC_ENABLE_GOOGLE_AUTH: "0",
      EXPO_PUBLIC_ENABLE_KAKAO_AUTH: "0",
      EXPO_PUBLIC_ENABLE_IAP_STORE: "0",
    },
  },
  supabase: {
    migrationApplied: "20260601120000_apple_auth_tokens.sql",
    functionsDeployed: ["store-apple-revocation-token", "delete-account"],
    appleRevocationSecretNamesPresent: [
      "APPLE_TEAM_ID",
      "APPLE_KEY_ID",
      "APPLE_PRIVATE_KEY",
      "APPLE_TOKEN_CLIENT_ID",
      "APPLE_TOKEN_ENCRYPTION_KEY",
    ],
  },
  appStoreConnect: {
    metadataEntered: false,
    screenshotsEntered: false,
    privacyAnswersEntered: false,
    reviewNotesEntered: false,
    evidenceRefs: {
      metadata: ["private-release/TODO-app-store-connect-metadata.png"],
      screenshots: ["private-release/TODO-app-store-connect-screenshots.png"],
      privacy: ["private-release/TODO-app-store-connect-privacy-answers.png"],
      reviewNotes: ["private-release/TODO-app-store-connect-review-notes.png"],
    },
    privacyPolicyUrl: "https://your-domain.example/privacy",
    supportUrl: "https://your-domain.example/support",
  },
  testflight: {
    twoAccounts: false,
    flows: Object.fromEntries(flowIds.map((flowId) => [flowId, "todo"])),
    flowEvidenceRefs: Object.fromEntries(
      flowIds.map((flowId) => [flowId, [`private-release/TODO-${flowId}-evidence.md`]]),
    ),
    permissionChecks: {
      blinkMicrophonePromptAbsent: false,
      contactsPromptLocalOnly: false,
      evidenceRefs: {
        microphone: ["private-release/TODO-microphone-permission-check.md"],
        contacts: ["private-release/TODO-contacts-permission-copy.png"],
      },
    },
  },
  deletionAudit: {
    requestId: "00000000-0000-4000-8000-000000000000",
    status: "todo",
    appleRevokeStatus: "todo",
    appleRevokeErrorEmpty: false,
    completedAtPresent: false,
  },
  iap: {
    enabled: false,
  },
  redaction: {
    confirmedNoSecrets: false,
  },
  operatorNotes: [
    "This template is fail-by-default. Replace every TODO, example URL, and all-zero requestId with real redacted evidence before submission.",
    "Keep build.appVersion equal to app.json expo.version and record the production EAS profile/channel for the reviewed build.",
    "Includes IOS-QA-001 through IOS-QA-016; mark each flow pass only after real TestFlight evidence exists and each flowEvidenceRefs entry points to private evidence.",
    "Set testflight.permissionChecks only after the reviewed iOS build proves Blink does not request microphone permission and Contacts copy says local-only.",
    "Fill appStoreConnect.evidenceRefs with separate private proof for metadata, screenshots, privacy answers, and review notes.",
    "Record secret names only. Do not paste Apple private keys, encryption keys, token material, full Apple IDs, or account passwords.",
    "Run: npm.cmd run release:ios:evidence -- .release/ios-submission-evidence.json",
  ],
};

if (fs.existsSync(resolvedOutputPath) && !force) {
  console.error(`Refusing to overwrite existing evidence template: ${outputPath}`);
  console.error("Re-run with --force if you intentionally want to regenerate it.");
  process.exit(1);
}

fs.mkdirSync(path.dirname(resolvedOutputPath), { recursive: true });
fs.writeFileSync(resolvedOutputPath, `${JSON.stringify(template, null, 2)}\n`, "utf8");

console.log(`Created fail-by-default iOS submission evidence template at ${outputPath}`);
console.log("Replace placeholders with real redacted evidence, then run:");
console.log("npm.cmd run release:ios:evidence -- .release/ios-submission-evidence.json");

function printUsage() {
  console.error(
    `Usage: npm.cmd run release:ios:evidence:init -- [${defaultOutputPath}] [--force]`,
  );
}
