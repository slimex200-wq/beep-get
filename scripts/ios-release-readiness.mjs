import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const checks = [];
const externalActions = [
  "Publish privacy/account deletion/support pages to stable HTTPS URLs.",
  "Set EAS production env values, including public Supabase keys and policy/support URLs.",
  "Complete App Store Connect metadata, screenshots, privacy answers, support URL, and review notes.",
  "Deploy and verify Sign in with Apple token revocation on TestFlight with disposable accounts.",
  "Finish IAP product metadata and sandbox QA before enabling EXPO_PUBLIC_ENABLE_IAP_STORE=1.",
  "Run real iOS/TestFlight QA for Apple login, Blink camera/media, push, widget, and disposable deletion.",
];

const app = readJson("app.json").expo;
const eas = readJson("eas.json");
const pkg = readJson("package.json");
const gitignore = readText(".gitignore");
const supabaseConfig = readText("supabase/config.toml");
const envExample = readText(".env.example");
const githubCi = readText(".github/workflows/ci.yml");
const settings = readText("src/screens/SettingsScreen.tsx");
const platformAuth = readText("src/lib/platformAuth.ts");
const authService = readText("src/services/authService.ts");
const myScreen = readText("src/screens/MyScreen.tsx");
const accountService = readText("src/services/accountService.ts");
const contactService = readText("src/services/contactService.ts");
const purchaseService = readText("src/services/purchaseService.ts");
const deleteAccountFunction = readOptionalText("supabase/functions/delete-account/index.ts");
const storeAppleRevocationFunction = readOptionalText("supabase/functions/store-apple-revocation-token/index.ts");
const appleTokensMigration = readOptionalText("supabase/migrations/20260601120000_apple_auth_tokens.sql");
const submissionEvidenceScript = readOptionalText("scripts/ios-submission-evidence-check.mjs");
const submissionEvidenceTemplateScript = readOptionalText("scripts/create-ios-submission-evidence-template.mjs");
const submissionGateScript = readOptionalText("scripts/ios-submission-gate.mjs");
const readinessDoc = readText("docs/qa/ios-first-release-readiness-2026-06-01.md");
const authStoreKitDoc = readText("docs/deploy/ios-auth-storekit.md");
const appStoreRunbook = readText("docs/deploy/ios-app-store-submission-runbook.md");
const appStoreMetadataDraft = readText("docs/deploy/ios-app-store-metadata-draft.md");
const privacyLabelDraft = readText("docs/deploy/ios-app-privacy-label-draft.md");
const privacyPolicy = readText("docs/legal/privacy-policy.md");
const accountDeletionDoc = readText("docs/legal/account-deletion.md");
const publicLegalManifest = readJson("docs/legal/public/legal-pages-manifest.json");
const publicPrivacyPage = readText("docs/legal/public/privacy.html");
const publicAccountDeletionPage = readText("docs/legal/public/account-deletion.html");
const publicSupportPage = readText("docs/legal/public/support.html");
const reviewNotesTemplate = readText("docs/deploy/ios-review-notes-template.md");
const screenshotPlan = readText("docs/qa/ios-screenshot-plan.md");
const testflightEvidence = readText("docs/qa/ios-testflight-qa-evidence.md");
const widgetPrivacyManifest = readOptionalText("targets/BeepWidgetExtension/PrivacyInfo.xcprivacy");
const notificationPrivacyManifest = readOptionalText("targets/BeepNotificationService/PrivacyInfo.xcprivacy");
const accessedApiTypes = app.ios?.privacyManifests?.NSPrivacyAccessedAPITypes ?? [];
const hasUserDefaultsAppGroupReason = accessedApiTypes.some(
  (entry) =>
    entry.NSPrivacyAccessedAPIType === "NSPrivacyAccessedAPICategoryUserDefaults" &&
    (entry.NSPrivacyAccessedAPITypeReasons ?? []).includes("1C8F.1"),
);
const metadataName = markdownTableValue(appStoreMetadataDraft, "Name");
const metadataSubtitle = markdownTableValue(appStoreMetadataDraft, "Subtitle");
const metadataPromo = markdownTableValue(appStoreMetadataDraft, "Promotional text");
const metadataKeywords = markdownTableValue(appStoreMetadataDraft, "Keywords");
const metadataDescription = fencedSection(appStoreMetadataDraft, "Description Draft");
const cameraPluginOptions = pluginOptions("expo-camera");
const contactsPluginOptions = pluginOptions("expo-contacts");

check("iOS bundle identifier is com.hypeboyo.beepget", app.ios?.bundleIdentifier === "com.hypeboyo.beepget");
check("iOS Sign in with Apple capability is enabled", app.ios?.usesAppleSignIn === true);
check(
  "iOS app group entitlement is configured",
  (app.ios?.entitlements?.["com.apple.security.application-groups"] ?? []).includes("group.com.beepget.shared"),
);
check("Non-exempt encryption flag is explicitly false", app.ios?.infoPlist?.ITSAppUsesNonExemptEncryption === false);
check("iOS privacy manifest declares UserDefaults App Group reason", hasUserDefaultsAppGroupReason);
check("iOS privacy manifest declares no tracking", app.ios?.privacyManifests?.NSPrivacyTracking === false);
check(
  "iOS privacy manifest has no tracking domains",
  (app.ios?.privacyManifests?.NSPrivacyTrackingDomains ?? []).length === 0,
);
check("Production EAS iOS submit app id is configured", eas.submit?.production?.ios?.ascAppId === "6769032098");
check("Production EAS channel is production", eas.build?.production?.channel === "production");
check("iOS production build script exists", pkg.scripts?.["build:ios:production"]?.includes("eas-cli"));
check("iOS production submit script exists", pkg.scripts?.["submit:ios:production"]?.includes("eas-cli"));
check("CI validate runs repo-local iOS release readiness gate", githubCi.includes("npm run release:ios:check"));
check("iOS production submit is guarded by submission gate", pkg.scripts?.["presubmit:ios:production"] === "node scripts/ios-submission-gate.mjs");
check("iOS submission evidence script exists", pkg.scripts?.["release:ios:evidence"] === "node scripts/ios-submission-evidence-check.mjs");
check("iOS submission evidence template script exists", pkg.scripts?.["release:ios:evidence:init"] === "node scripts/create-ios-submission-evidence-template.mjs");
check("iOS submission gate script exists", pkg.scripts?.["release:ios:submission"] === "node scripts/ios-submission-gate.mjs");
check("Private release evidence folder is ignored", gitignore.includes(".release/"));
check("Expo camera permission explains 2 second Blink capture", cameraPluginOptions.cameraPermission?.includes("2 second Blink"));
check("Expo camera microphone permission is disabled for muted Blink", cameraPluginOptions.microphonePermission === false);
check("Android audio recording permission is disabled", cameraPluginOptions.recordAudioAndroid === false);
check("Contacts permission states local-only use", contactsPluginOptions.contactsPermission?.includes("read contacts locally"));
check("Contact discovery reads phone numbers locally", contactService.includes("Contacts.getContactsAsync"));
check("Contact discovery has no Supabase import", !contactService.includes("@/lib/supabase"));
check("Contact discovery performs no remote Supabase call", !/\bsupabase\.(from|rpc|functions|storage|auth)\b/.test(contactService));
check("Contact discovery currently returns no uploaded matches", contactService.includes("return []"));

[
  "EXPO_PUBLIC_SUPABASE_URL",
  "EXPO_PUBLIC_SUPABASE_ANON_KEY",
  "EXPO_PUBLIC_PRIVACY_URL",
  "EXPO_PUBLIC_ACCOUNT_DELETION_URL",
  "EXPO_PUBLIC_SUPPORT_URL",
  "EXPO_PUBLIC_ENABLE_GOOGLE_AUTH=0",
  "EXPO_PUBLIC_ENABLE_KAKAO_AUTH=0",
  "EXPO_PUBLIC_ENABLE_IAP_STORE=0",
].forEach((token) => check(`.env.example includes ${token}`, envExample.includes(token)));

[
  "docs/legal/privacy-policy.md",
  "docs/legal/account-deletion.md",
  "docs/legal/support.md",
  "docs/legal/public/README.md",
  "docs/legal/public/legal-pages-manifest.json",
  "docs/legal/public/privacy.html",
  "docs/legal/public/account-deletion.html",
  "docs/legal/public/support.html",
  "docs/deploy/ios-auth-storekit.md",
  "docs/deploy/ios-app-store-metadata-draft.md",
  "docs/deploy/ios-app-privacy-label-draft.md",
  "docs/deploy/ios-app-store-submission-runbook.md",
  "docs/deploy/ios-review-notes-template.md",
  "docs/qa/ios-first-release-readiness-2026-06-01.md",
  "docs/qa/ios-screenshot-plan.md",
  "docs/qa/ios-testflight-qa-evidence.md",
  "scripts/create-ios-submission-evidence-template.mjs",
  "scripts/ios-submission-gate.mjs",
  "scripts/ios-submission-evidence-check.mjs",
  "supabase/functions/store-apple-revocation-token/index.ts",
  "supabase/migrations/20260601120000_apple_auth_tokens.sql",
  "targets/BeepWidgetExtension/PrivacyInfo.xcprivacy",
  "targets/BeepNotificationService/PrivacyInfo.xcprivacy",
].forEach((file) => check(`${file} exists`, fs.existsSync(path.join(root, file))));

check("Public legal manifest names privacy markdown source", publicLegalManifest.sourceFiles?.privacy === "docs/legal/privacy-policy.md");
check("Public legal manifest names account deletion markdown source", publicLegalManifest.sourceFiles?.accountDeletion === "docs/legal/account-deletion.md");
check("Public legal manifest names support markdown source", publicLegalManifest.sourceFiles?.support === "docs/legal/support.md");
check("Public legal manifest maps privacy HTML", publicLegalManifest.publicFiles?.privacy === "privacy.html");
check("Public legal manifest maps account deletion HTML", publicLegalManifest.publicFiles?.accountDeletion === "account-deletion.html");
check("Public legal manifest maps support HTML", publicLegalManifest.publicFiles?.support === "support.html");
[
  "EXPO_PUBLIC_PRIVACY_URL",
  "EXPO_PUBLIC_ACCOUNT_DELETION_URL",
  "EXPO_PUBLIC_SUPPORT_URL",
].forEach((name) => check(`Public legal manifest requires ${name}`, (publicLegalManifest.requiredEasEnv ?? []).includes(name)));
check("Public privacy HTML has App Store privacy title", publicPrivacyPage.includes("<title>Beep Get Privacy Policy</title>"));
check("Public privacy HTML discloses local-only contacts", publicPrivacyPage.includes("does not upload contact phone numbers"));
check("Public privacy HTML discloses Apple revocation token material", publicPrivacyPage.includes("encrypted Sign in with Apple refresh-token material"));
check("Public account deletion HTML has App Store deletion title", publicAccountDeletionPage.includes("<title>Beep Get Account Deletion</title>"));
check("Public account deletion HTML describes in-app deletion", publicAccountDeletionPage.includes("Tap Delete Account"));
check("Public account deletion HTML describes Apple token revocation", publicAccountDeletionPage.includes("Sign in with Apple token revocation"));
check("Public support HTML has App Store support title", publicSupportPage.includes("<title>Beep Get Support</title>"));
check("Public support HTML warns against secret sharing", publicSupportPage.includes("Do not send passwords") && publicSupportPage.includes("service-role keys"));

[
  ["Widget extension privacy manifest", widgetPrivacyManifest],
  ["Notification service privacy manifest", notificationPrivacyManifest],
].forEach(([label, source]) => {
  check(`${label} declares UserDefaults required reason API`, source.includes("NSPrivacyAccessedAPICategoryUserDefaults"));
  check(`${label} declares App Group reason 1C8F.1`, source.includes("1C8F.1"));
  check(`${label} declares no tracking`, source.includes("<key>NSPrivacyTracking</key>") && source.includes("<false/>"));
});

check("App Store metadata draft name matches app config", metadataName === app.name);
check("App Store metadata draft name is within 30 characters", metadataName.length > 1 && metadataName.length <= 30);
check(
  "App Store metadata draft subtitle is within 30 characters",
  metadataSubtitle.length > 0 && metadataSubtitle.length <= 30,
);
check(
  "App Store metadata draft promotional text is within 170 characters",
  metadataPromo.length > 0 && metadataPromo.length <= 170,
);
check(
  "App Store metadata draft keywords are within 100 bytes",
  metadataKeywords.length > 0 && Buffer.byteLength(metadataKeywords, "utf8") <= 100,
);
check(
  "App Store metadata draft description is within 4000 characters",
  metadataDescription.length > 200 && metadataDescription.length <= 4000,
);
[
  "Primary category",
  "Age rating",
  "Content rights",
  "DSA trader status",
  "Review notes",
  "Screenshots",
  "App privacy",
].forEach((token) => check(`App Store metadata draft includes ${token}`, appStoreMetadataDraft.includes(token)));

check("Settings fail closed when policy URLs are missing", settings.includes("Link unavailable"));
check(
  "Settings read policy/support URLs through release flags",
  settings.includes("privacyPolicyUrl") && settings.includes("accountDeletionUrl") && settings.includes("supportUrl"),
);
check("Settings exposes in-app account deletion", settings.includes("Delete Account") && settings.includes("deleteAccount"));
check("Settings explains destructive account deletion scope", settings.includes("relationships, Beeps, Blinks, and private Blink media"));
check("Native Apple login uses expo-apple-authentication", authService.includes('from "expo-apple-authentication"'));
check("Native Apple login uses Supabase signInWithIdToken", authService.includes("signInWithIdToken"));
check("Native Apple login requires authorizationCode", authService.includes("credential.authorizationCode"));
check("Native Apple login stores server-side revocation token", authService.includes("store-apple-revocation-token"));
check("Account deletion client calls delete-account Edge Function", accountService.includes('functions.invoke("delete-account"'));
check("Account deletion client uses POST", accountService.includes('method: "POST"'));
check("Account deletion client sends explicit confirmation", accountService.includes("ACCOUNT_DELETION_CONFIRMATION"));
check("Delete account Edge Function requires POST", deleteAccountFunction.includes('req.method !== "POST"'));
check("Delete account Edge Function requires confirmation", deleteAccountFunction.includes('confirmation = "DELETE_ACCOUNT"'));
check("Delete account Edge Function requires bearer authentication", deleteAccountFunction.includes("Missing bearer token"));
check("Delete account Edge Function removes private Blink storage", deleteAccountFunction.includes("removeExactMedia") && deleteAccountFunction.includes("removeUserStoragePrefixes"));
check("Delete account Edge Function deletes Supabase Auth user", deleteAccountFunction.includes("admin.auth.admin.deleteUser"));
check("Delete account Edge Function retains only hashed audit identity", deleteAccountFunction.includes("user_id_hash") && deleteAccountFunction.includes("user_id: null"));
check("Delete account Edge Function attempts Apple revoke before user deletion", deleteAccountFunction.indexOf("revokeAppleTokenIfPresent") > -1 && deleteAccountFunction.indexOf("revokeAppleTokenIfPresent") < deleteAccountFunction.indexOf("admin.auth.admin.deleteUser"));
check("Delete account Edge Function calls Apple revoke endpoint", deleteAccountFunction.includes("https://appleid.apple.com/auth/revoke"));
check("Delete account Edge Function handles missing Apple token idempotently", deleteAccountFunction.includes('status: "not_available"'));
check("Delete account Edge Function records Apple revoke audit status", deleteAccountFunction.includes("apple_revoke_status") && deleteAccountFunction.includes("apple_revoke_error"));
check("Delete account Edge Function blocks deletion when stored Apple revoke fails", deleteAccountFunction.includes('appleRevoke.status === "failed"') && deleteAccountFunction.includes("Apple token revocation failed"));
check("Store Apple revocation function requires POST", storeAppleRevocationFunction.includes('req.method !== "POST"'));
check("Store Apple revocation function requires bearer authentication", storeAppleRevocationFunction.includes("Missing bearer token"));
check("Store Apple revocation function requires authorizationCode", storeAppleRevocationFunction.includes("authorizationCode"));
check("Store Apple revocation function exchanges code server-side", storeAppleRevocationFunction.includes("https://appleid.apple.com/auth/token"));
check("Store Apple revocation function requires refresh token for later deletion", storeAppleRevocationFunction.includes("payload.refresh_token") && storeAppleRevocationFunction.includes("no refresh token"));
check("Store Apple revocation function has no access-token fallback", !storeAppleRevocationFunction.includes("payload.access_token") && !storeAppleRevocationFunction.includes('tokenType: "access_token"'));
check("Store Apple revocation function encrypts token material", storeAppleRevocationFunction.includes("AES-GCM") && storeAppleRevocationFunction.includes("APPLE_TOKEN_ENCRYPTION_KEY"));
check("Store Apple revocation function stores encrypted token fields only", storeAppleRevocationFunction.includes("token_ciphertext") && storeAppleRevocationFunction.includes("token_iv"));
check("Store Apple revocation function returns no token metadata", !storeAppleRevocationFunction.includes("return json({ ok: true, tokenType"));
check("Supabase config protects store-apple-revocation-token with JWT verification", supabaseConfig.includes("[functions.store-apple-revocation-token]") && supabaseConfig.includes("verify_jwt = true"));
check("Apple token migration creates encrypted token table", appleTokensMigration.includes("create table if not exists public.apple_auth_tokens") && appleTokensMigration.includes("token_ciphertext") && appleTokensMigration.includes("token_iv"));
check("Apple token migration links token rows to auth users", appleTokensMigration.includes("user_id uuid primary key references auth.users(id) on delete cascade"));
check("Apple token migration enables RLS", appleTokensMigration.includes("alter table public.apple_auth_tokens enable row level security"));
check("Apple token migration revokes client table privileges", appleTokensMigration.includes("revoke all privileges on table public.apple_auth_tokens from anon") && appleTokensMigration.includes("revoke all privileges on table public.apple_auth_tokens from authenticated"));
check("Apple token migration constrains token type to refresh_token only", appleTokensMigration.includes("token_type = 'refresh_token'") && !appleTokensMigration.includes("'access_token'"));
check("Apple token migration constrains revoke audit status", appleTokensMigration.includes("account_deletion_requests_apple_revoke_status") && appleTokensMigration.includes("'already_revoked'"));
check("Apple token migration avoids plaintext authorization-code storage", !/authorization_code\s+text/i.test(appleTokensMigration));
check("Apple token migration avoids plaintext refresh-token storage", !/refresh_token\s+text/i.test(appleTokensMigration));
check("Apple deletion/revocation support is documented", authStoreKitDoc.includes("Sign in with Apple Account Deletion / Token Revocation"));
check("Apple deletion/revocation doc cites account deletion guidance", authStoreKitDoc.includes("https://developer.apple.com/support/offering-account-deletion-in-your-app/"));
check("Apple deletion/revocation doc cites TN3194", authStoreKitDoc.includes("https://developer.apple.com/documentation/technotes/tn3194-handling-account-deletions-and-revoking-tokens-for-sign-in-with-apple"));
check("Apple deletion/revocation doc cites revoke endpoint", authStoreKitDoc.includes("https://developer.apple.com/documentation/signinwithapplerestapi/revoke-tokens"));
check("Apple deletion/revocation doc names authorization code", authStoreKitDoc.includes("Apple authorization code"));
check("Apple deletion/revocation doc names refresh token", authStoreKitDoc.includes("Apple refresh token"));
check("Apple deletion/revocation doc rejects access-token fallback", authStoreKitDoc.includes("does not fall back to an Apple access token"));
check(
  "Apple deletion/revocation doc requires backend deployment and TestFlight proof",
  authStoreKitDoc.includes("store-apple-revocation-token") &&
    authStoreKitDoc.includes("apple_revoke_status=completed") &&
    authStoreKitDoc.includes("npx supabase db push") &&
    authStoreKitDoc.includes("revocation fails, deletion stops"),
);
check("iOS secondary OAuth providers are gated", platformAuth.includes("isGoogleAuthEnabled") && platformAuth.includes("isKakaoAuthEnabled"));
check("Identity-pack purchase surface is gated", myScreen.includes("isIdentityPackStoreEnabled") && myScreen.includes("purchaseIdentityPack"));
check("Dead policy URL fallback is absent", !searchRepo(["src", ".env.example", "__tests__"], "hypeboyo.com/beep-get/privacy"));
check("Dead deletion URL fallback is absent", !searchRepo(["src", ".env.example", "__tests__"], "hypeboyo.com/beep-get/delete-account"));
check("Unreviewed skin store wording is absent from app/test source", !searchRepo(["src", "__tests__"], "Skin Pack Store"));

[
  "beepget.pack.school_desk",
  "beepget.pack.cherry_dot",
  "beepget.pack.photo_booth_blink",
  "beepget.pack.night_signal",
].forEach((productId) => check(`StoreKit product id mapped: ${productId}`, purchaseService.includes(productId)));

check("Submission evidence script checks all TestFlight rows", submissionEvidenceScript.includes("Array.from({ length: 16 }") && submissionEvidenceScript.includes("requiredFlowIds"));
check("Submission evidence script checks redaction", submissionEvidenceScript.includes("scanForSecretLeaks") && submissionEvidenceScript.includes("confirmedNoSecrets"));
check("Submission evidence script checks deletion audit outcome", submissionEvidenceScript.includes("appleRevokeStatus") && submissionEvidenceScript.includes("appleRevokeErrorEmpty"));
check("Submission evidence script rejects reserved placeholder URLs", submissionEvidenceScript.includes("isReservedHostname") && submissionEvidenceScript.includes(".example"));
check("Submission evidence script rejects all-zero request IDs", submissionEvidenceScript.includes("Deletion audit requestId is UUID-like") && submissionEvidenceScript.includes("!/^0{8}"));
check("Submission evidence script checks build identity", submissionEvidenceScript.includes("Build app version matches app config") && submissionEvidenceScript.includes("Build uses production EAS profile") && submissionEvidenceScript.includes("Build uses production EAS channel"));
check("Submission evidence script requires secondary OAuth QA when enabled", submissionEvidenceScript.includes("secondaryOAuthQA") && submissionEvidenceScript.includes("Google auth QA passed when enabled"));
check("Submission evidence script requires evidence references", submissionEvidenceScript.includes("requiredEvidenceRefGroups") && submissionEvidenceScript.includes('"build"') && submissionEvidenceScript.includes('"redaction"') && submissionEvidenceScript.includes("Evidence references include ${group}"));
check("Submission evidence script requires every TestFlight flow evidence reference", submissionEvidenceScript.includes("flowEvidenceRefs") && submissionEvidenceScript.includes("TestFlight flow evidence references include ${flowId}"));
check("Submission evidence script requires permission prompt evidence", submissionEvidenceScript.includes("TestFlight Blink did not request microphone permission") && submissionEvidenceScript.includes("TestFlight Contacts prompt shows local-only copy"));
check("Submission evidence script requires App Store Connect section evidence references", submissionEvidenceScript.includes("requiredAppStoreConnectEvidenceRefs") && submissionEvidenceScript.includes("App Store Connect evidence references include ${field}"));
check("Submission evidence script pins Supabase project URL", submissionEvidenceScript.includes("Build backend project is beep-get-prod") && submissionEvidenceScript.includes("EAS public Supabase URL matches backend project"));
check("Submission evidence script matches EAS public URL values", submissionEvidenceScript.includes("EAS public privacy URL matches evidence URL") && submissionEvidenceScript.includes("EXPO_PUBLIC_ACCOUNT_DELETION_URL"));
check("Submission evidence script matches EAS release flags", submissionEvidenceScript.includes("EAS Google auth flag matches build release flag") && submissionEvidenceScript.includes("EAS IAP store flag matches build release flag"));
check("Submission evidence script matches App Store Connect public URLs", submissionEvidenceScript.includes("App Store Connect privacy policy URL matches public URL") && submissionEvidenceScript.includes("App Store Connect support URL matches public URL"));
check("Submission evidence template generator writes ignored release template", submissionEvidenceTemplateScript.includes(".release/ios-submission-evidence.template.json"));
check("Submission evidence template generator refuses overwrite unless forced", submissionEvidenceTemplateScript.includes("--force") && submissionEvidenceTemplateScript.includes("Refusing to overwrite"));
check("Submission evidence template generator includes all TestFlight rows", submissionEvidenceTemplateScript.includes("Array.from({ length: 16 }") && submissionEvidenceTemplateScript.includes("IOS-QA-016"));
check("Submission evidence template generator includes per-flow evidence references", submissionEvidenceTemplateScript.includes("flowEvidenceRefs") && submissionEvidenceTemplateScript.includes("TODO-${flowId}-evidence.md"));
check("Submission evidence template generator includes permission checks", submissionEvidenceTemplateScript.includes("permissionChecks") && submissionEvidenceTemplateScript.includes("blinkMicrophonePromptAbsent"));
check("Submission evidence template generator includes App Store Connect section refs", submissionEvidenceTemplateScript.includes("TODO-app-store-connect-screenshots.png") && submissionEvidenceTemplateScript.includes("TODO-app-store-connect-review-notes.png"));
check("Submission evidence template generator records Apple secret names only", submissionEvidenceTemplateScript.includes("appleRevocationSecretNamesPresent") && submissionEvidenceTemplateScript.includes('"APPLE_PRIVATE_KEY"'));
check("Submission evidence template generator records EAS public values", submissionEvidenceTemplateScript.includes("publicValues") && submissionEvidenceTemplateScript.includes("EXPO_PUBLIC_SUPABASE_URL") && submissionEvidenceTemplateScript.includes("EXPO_PUBLIC_PRIVACY_URL"));
check("Submission evidence template generator includes build identity", submissionEvidenceTemplateScript.includes("appVersion") && submissionEvidenceTemplateScript.includes("easBuildProfile") && submissionEvidenceTemplateScript.includes("easChannel"));
check("Submission evidence template generator is fail-by-default", submissionEvidenceTemplateScript.includes("your-domain.example") && submissionEvidenceTemplateScript.includes("confirmedNoSecrets: false"));
check("Submission gate runs repo-local release readiness first", submissionGateScript.includes("scripts/ios-release-readiness.mjs") && submissionGateScript.includes("repo-local iOS release readiness"));
check("Submission gate requires private evidence file", submissionGateScript.includes(".release/ios-submission-evidence.json") && submissionGateScript.includes("missing private evidence file"));
check("Submission gate runs private evidence checker", submissionGateScript.includes("scripts/ios-submission-evidence-check.mjs") && submissionGateScript.includes("private redacted iOS submission evidence"));

[
  "https://developer.apple.com/app-store/review/guidelines/",
  "https://developer.apple.com/support/offering-account-deletion-in-your-app/",
  "https://developer.apple.com/documentation/technotes/tn3194-handling-account-deletions-and-revoking-tokens-for-sign-in-with-apple",
  "https://developer.apple.com/documentation/signinwithapplerestapi/revoke-tokens",
  "https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy/",
  "https://developer.apple.com/help/app-store-connect/configure-in-app-purchase-settings/overview-for-configuring-in-app-purchases/",
  "https://docs.expo.dev/submit/ios/",
].forEach((url) => check(`Readiness doc cites ${url}`, readinessDoc.includes(url)));

[
  "https://developer.apple.com/help/app-store-connect/reference/app-information",
  "https://developer.apple.com/help/app-store-connect/reference/app-information/platform-version-information",
  "https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy/",
  "https://developer.apple.com/help/app-store-connect/reference/screenshot-specifications",
  "https://developer.apple.com/documentation/technotes/tn3194-handling-account-deletions-and-revoking-tokens-for-sign-in-with-apple",
  "https://developer.apple.com/documentation/signinwithapplerestapi/revoke-tokens",
  "https://docs.expo.dev/submit/ios/",
].forEach((url) => check(`Submission runbook cites ${url}`, appStoreRunbook.includes(url)));

[
  "APPLE_TOKEN_ENCRYPTION_KEY",
  "npx supabase db push",
  "store-apple-revocation-token",
  "apple_revoke_status=completed",
  "apple_revoke_status=failed",
].forEach((token) => check(`Submission runbook includes Apple revocation deployment token: ${token}`, appStoreRunbook.includes(token)));
[
  "docs/legal/public/privacy.html",
  "docs/legal/public/account-deletion.html",
  "docs/legal/public/support.html",
].forEach((token) => check(`Submission runbook includes public legal bundle file: ${token}`, appStoreRunbook.includes(token)));
check(
  "Submission runbook documents npm submit guard",
  appStoreRunbook.includes("presubmit:ios:production") && appStoreRunbook.includes("fail before EAS submit"),
);

[
  "Contact Info / Name",
  "Contact Info / Email Address",
  "User Content / Photos or Videos",
  "Purchases",
  "No",
  "NSPrivacyAccessedAPICategoryUserDefaults",
  "1C8F.1",
  "read contacts locally",
  "does not upload contact phone numbers",
  "encrypted Sign in with Apple refresh-token material",
  "Apple authorization revocation",
].forEach((token) => check(`Privacy label draft includes ${token}`, privacyLabelDraft.includes(token)));

[
  "encrypted Sign in with Apple refresh-token material",
  "revoke Sign in with Apple authorization during deletion",
  "encrypted Apple revocation token material",
].forEach((token) => check(`Privacy policy includes ${token}`, privacyPolicy.includes(token)));

[
  "encrypted Sign in with Apple revocation token material",
  "attempts Sign in with Apple token revocation",
].forEach((token) => check(`Account deletion doc includes ${token}`, accountDeletionDoc.includes(token)));

[
  "NSPrivacyAccessedAPICategoryUserDefaults",
  "1C8F.1",
  "targets/BeepWidgetExtension/PrivacyInfo.xcprivacy",
  "targets/BeepNotificationService/PrivacyInfo.xcprivacy",
].forEach((token) => check(`Submission runbook includes ${token}`, appStoreRunbook.includes(token)));

[
  "Sign in with Apple",
  "Delete Account",
  "EXPO_PUBLIC_ENABLE_IAP_STORE=0",
  "microphone permission is disabled",
  "contacts are read locally",
  "encrypted Apple revocation token material",
  "docs/deploy/ios-app-store-metadata-draft.md",
].forEach((token) => check(`Review notes template includes ${token}`, reviewNotesTemplate.includes(token)));

[
  "Auth / Sign in with Apple screen",
  "Today screen",
  "https://developer.apple.com/help/app-store-connect/reference/screenshot-specifications",
].forEach((token) => check(`Screenshot plan includes ${token}`, screenshotPlan.includes(token)));

[
  "IOS-QA-001",
  "IOS-QA-015",
  "IOS-QA-016",
  "Redacted Submission Evidence Packet",
  "Machine-Checkable Evidence File",
  "npm.cmd run release:ios:evidence",
  "npm.cmd run release:ios:evidence:init",
  "npm.cmd run release:ios:submission",
  ".release/ios-submission-evidence.json",
  "reserved domains",
  "all-zero sample `requestId`",
  "evidenceRefs",
  "flowEvidenceRefs",
  "permissionChecks",
  "blinkMicrophonePromptAbsent",
  "contactsPromptLocalOnly",
  "App Store Connect evidence references",
  "metadata",
  "screenshots",
  "reviewNotes",
  "requestId",
  "appleRevokeStatus",
  "apple_revoke_error is null",
  "token_ciphertext",
  "Sign in with Apple token revocation/account-deletion evidence",
  "apple_revoke_status=completed",
  "beepget.pack.school_desk",
  "publicValues",
  "App Store Connect",
].forEach((token) => check(`TestFlight evidence sheet includes ${token}`, testflightEvidence.includes(token)));

[
  "redacted submission evidence packet",
  "delete-account requestId",
  "appleRevokeStatus",
  "apple_revoke_error_empty=true",
  "Do not paste token ciphertext",
  "npm.cmd run release:ios:evidence",
  "npm.cmd run release:ios:evidence:init",
  "npm.cmd run release:ios:submission",
  ".release/ios-submission-evidence.json",
  "evidenceRefs",
  "bare booleans",
  "publicValues",
  "match the corresponding",
  "permissionChecks",
  "appStoreConnect.evidenceRefs",
  "build.appVersion",
  "production EAS profile",
  "easChannel",
].forEach((token) => check(`Submission runbook includes redacted evidence instruction: ${token}`, appStoreRunbook.includes(token)));

const failures = checks.filter((item) => !item.ok);
if (failures.length > 0) {
  console.error("iOS release readiness check failed:");
  failures.forEach((item) => console.error(`- ${item.label}`));
  process.exit(1);
}

console.log(`iOS release readiness repo-local checks passed (${checks.length}/${checks.length}).`);
console.log("External release actions still required:");
externalActions.forEach((item) => console.log(`- ${item}`));

function check(label, ok) {
  checks.push({ label, ok: Boolean(ok) });
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function readText(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function readOptionalText(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) return "";
  return fs.readFileSync(fullPath, "utf8");
}

function pluginOptions(pluginName) {
  const entry = (app.plugins ?? []).find((item) => {
    if (typeof item === "string") return item === pluginName;
    return Array.isArray(item) && item[0] === pluginName;
  });
  return Array.isArray(entry) ? entry[1] ?? {} : {};
}

function markdownTableValue(source, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = source.match(new RegExp(`^\\|\\s*${escaped}\\s*\\|\\s*([^|]+?)\\s*\\|\\s*$`, "m"));
  return match?.[1]?.trim() ?? "";
}

function fencedSection(source, heading) {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = source.match(new RegExp(`## ${escaped}\\s+\\\`\\\`\\\`text\\s+([\\s\\S]*?)\\s+\\\`\\\`\\\``, "m"));
  return match?.[1]?.trim() ?? "";
}

function searchRepo(paths, needle) {
  return paths.some((entry) => searchPath(path.join(root, entry), needle));
}

function searchPath(target, needle) {
  if (!fs.existsSync(target)) return false;
  const stat = fs.statSync(target);
  if (stat.isFile()) return fs.readFileSync(target, "utf8").includes(needle);
  return fs
    .readdirSync(target, { withFileTypes: true })
    .filter((entry) => entry.name !== "node_modules")
    .some((entry) => searchPath(path.join(target, entry.name), needle));
}
