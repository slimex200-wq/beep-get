# iOS App Store Submission Runbook

Last updated: 2026-06-01

This runbook is for the first iOS-first Beep Get submission. It separates safe repo-local checks from owner-only App Store Connect, EAS, Supabase, and real-device work.

Official references:

- https://developer.apple.com/app-store/review/guidelines/
- https://developer.apple.com/help/app-store-connect/reference/app-information
- https://developer.apple.com/help/app-store-connect/reference/app-information/platform-version-information
- https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy/
- https://developer.apple.com/help/app-store-connect/reference/screenshot-specifications
- https://developer.apple.com/support/offering-account-deletion-in-your-app/
- https://developer.apple.com/documentation/technotes/tn3194-handling-account-deletions-and-revoking-tokens-for-sign-in-with-apple
- https://developer.apple.com/documentation/signinwithapplerestapi/revoke-tokens
- https://developer.apple.com/help/app-store-connect/configure-in-app-purchase-settings/overview-for-configuring-in-app-purchases/
- https://docs.expo.dev/submit/ios/

## 1. Repo-Local Gate

Run these from the repo root:

```powershell
npm.cmd ci
npm.cmd run release:ios:check
npx.cmd --yes expo-doctor
npm.cmd run typecheck
npm.cmd test -- --runInBand
npm.cmd audit --audit-level=high
npx.cmd expo config --type prebuild --json
npx.cmd expo export --platform ios
git diff --check
```

Expected:

- `release:ios:check` passes all repo-local checks and prints remaining external actions.
- `release:ios:submission` is not expected to pass yet; it is the final pre-submit gate after the private evidence file is complete.
- `audit --audit-level=high` exits 0. Moderate Expo-family findings may remain until an SDK upgrade is planned.
- `expo export --platform ios` writes ignored `dist/`.

## 1A. Privacy Manifest / Required Reason API

The app and native extension targets use App Group `UserDefaults(suiteName:)` for widget and notification-service data sharing. Keep these required-reason API declarations in sync:

- `app.json` -> `ios.privacyManifests.NSPrivacyAccessedAPITypes`
- `targets/BeepWidgetExtension/PrivacyInfo.xcprivacy`
- `targets/BeepNotificationService/PrivacyInfo.xcprivacy`

Required declaration for this repo:

- `NSPrivacyAccessedAPICategoryUserDefaults`
- Reason `1C8F.1` for information accessible only to members of the same App Group
- `NSPrivacyTracking=false` and no tracking domains

Re-run `npm.cmd run release:ios:check` after changing any widget, notification-service, or App Group storage code.

## 2. Public URLs

Host these pages on stable HTTPS URLs:

- Privacy policy: `docs/legal/privacy-policy.md`
- Account deletion: `docs/legal/account-deletion.md`
- Support URL: `docs/legal/support.md`

The repo also includes a static public legal bundle that can be uploaded directly to a static HTTPS host:

- Privacy policy HTML: `docs/legal/public/privacy.html`
- Account deletion HTML: `docs/legal/public/account-deletion.html`
- Support HTML: `docs/legal/public/support.html`
- Bundle manifest: `docs/legal/public/legal-pages-manifest.json`

Keep the markdown source and public HTML bundle in sync before submission.

Then set App Store Connect metadata:

- Privacy Policy URL: hosted privacy policy URL.
- Support URL: hosted support page URL.
- Privacy Choices URL: hosted deletion/privacy choices URL, if desired.

Set EAS production env values:

```powershell
npx eas-cli@latest env:create production --name EXPO_PUBLIC_SUPABASE_URL --value "<supabase-url>" --visibility plaintext --non-interactive
npx eas-cli@latest env:create production --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "<supabase-anon-key>" --visibility sensitive --non-interactive
npx eas-cli@latest env:create production --name EXPO_PUBLIC_PRIVACY_URL --value "<privacy-url>" --visibility plaintext --non-interactive
npx eas-cli@latest env:create production --name EXPO_PUBLIC_ACCOUNT_DELETION_URL --value "<deletion-url>" --visibility plaintext --non-interactive
npx eas-cli@latest env:create production --name EXPO_PUBLIC_SUPPORT_URL --value "<support-url>" --visibility plaintext --non-interactive
npx eas-cli@latest env:create production --name EXPO_PUBLIC_ENABLE_GOOGLE_AUTH --value "0" --visibility plaintext --non-interactive
npx eas-cli@latest env:create production --name EXPO_PUBLIC_ENABLE_KAKAO_AUTH --value "0" --visibility plaintext --non-interactive
npx eas-cli@latest env:create production --name EXPO_PUBLIC_ENABLE_IAP_STORE --value "0" --visibility plaintext --non-interactive
```

Keep secondary OAuth and IAP disabled for the first review build unless those paths are fully configured and device-tested.

Set Supabase Edge Function secrets for Sign in with Apple token revocation before enabling the reviewed iOS build:

```powershell
npx supabase secrets set `
  --project-ref dyuzxilukcwiavtvbmci `
  APPLE_TEAM_ID="YR267UY7UX" `
  APPLE_KEY_ID="98ZCRX9Y55" `
  APPLE_PRIVATE_KEY="$(Get-Content -Raw C:\path\to\AuthKey_XXXXXXXXXX.p8)" `
  APPLE_TOKEN_CLIENT_ID="com.hypeboyo.beepget" `
  APPLE_TOKEN_ENCRYPTION_KEY="<long random secret>"
```

Apply the Supabase migration before deploying the functions:

```powershell
npx supabase link --project-ref dyuzxilukcwiavtvbmci
npx supabase db push
```

Deploy both Apple/account deletion functions after the migration and secrets are in place:

```powershell
npx supabase functions deploy store-apple-revocation-token --project-ref dyuzxilukcwiavtvbmci
npx supabase functions deploy delete-account --project-ref dyuzxilukcwiavtvbmci
```

## 3. App Store Connect Metadata

Use these draft values as a starting point:

- App Store metadata: `docs/deploy/ios-app-store-metadata-draft.md`
- Review notes: explain Sign in with Apple, account deletion location, Blink camera purpose, widget behavior, and whether IAP is disabled in the submitted build.
- Demo account: if reviewer cannot complete Apple login, provide a disposable review account or clear instructions.

Use `docs/deploy/ios-app-store-metadata-draft.md` for Name, Subtitle, Description, Promotional Text, Keywords, category, age-rating notes, content-rights notes, and DSA owner confirmation.
Use `docs/deploy/ios-app-privacy-label-draft.md` for App Privacy answers, then verify final answers in App Store Connect.
Use `docs/deploy/ios-review-notes-template.md` for Review Notes.
Use `docs/qa/ios-screenshot-plan.md` for screenshot capture.

## 4. IAP Decision

For first submission, recommended default:

```text
EXPO_PUBLIC_ENABLE_IAP_STORE=0
```

If selling skins at launch:

1. Finish all four non-consumable products from `docs/deploy/ios-auth-storekit.md`.
2. Add price and availability.
3. Add localization/display name/description.
4. Add review screenshot metadata.
5. Confirm App Store Server API secrets in Supabase.
6. Run sandbox purchase QA on iOS.
7. Only then set `EXPO_PUBLIC_ENABLE_IAP_STORE=1` for the reviewed build.

## 5. Build And Submit

Only after sections 1-4 are complete:

```powershell
npm.cmd run build:ios:production -- --non-interactive
npm.cmd run submit:ios:production -- --latest --non-interactive
```

`npm.cmd run submit:ios:production` automatically runs `presubmit:ios:production`, which uses the same submission gate as `release:ios:submission` with `.release/ios-submission-evidence.json`. The submit script should fail before EAS submit if the private evidence file is missing or incomplete.

If running in CI, set `EXPO_TOKEN`. If using an App Store Connect API key, keep the `.p8` path outside git and configure EAS submit according to Expo docs.

## 6. Real iOS / TestFlight QA

Run on at least two accounts/devices:

- Install TestFlight build.
- Sign in with Apple.
- Finish nickname/profile/avatar.
- Add friend by Beep ID.
- Send and receive Beep.
- Capture 2-second Blink, verify 3 teaser frames and playback.
- Receive push notification.
- Add small and medium widgets, verify open-link behavior.
- Capture Blink on device and confirm the iOS build does not request microphone permission.
- Open friend invite/contact-related flows and confirm any Contacts prompt uses the local-only copy from `app.json`.
- Confirm privacy/support/deletion links open.
- Delete only a disposable account through in-app deletion; verify the app returns to signed-out state and the deleted account cannot sign back in.
- For the same disposable Sign in with Apple account, verify Beep Get backend revocation by checking the deletion audit outcome. Submit only after the deletion evidence shows `apple_revoke_status=completed` or an already-revoked Apple equivalent for a fresh TestFlight sign-in. If `apple_revoke_status=failed`, fix the backend issue and retry deletion with the same disposable account instead of submitting.
- If IAP is enabled, buy each skin pack in sandbox and verify entitlement.

Record evidence in `docs/qa/ios-testflight-qa-evidence.md`.

Before submitting, complete the redacted submission evidence packet in that sheet. For the disposable Apple deletion test, keep the `delete-account` response `requestId` and `appleRevokeStatus`, then verify the matching Supabase audit row:

```sql
select
  status,
  apple_revoke_status,
  apple_revoke_error is null as apple_revoke_error_empty,
  completed_at is not null as completed_at_present
from public.account_deletion_requests
where id = '<delete-account requestId>'
limit 1;
```

Required result for a fresh disposable Sign in with Apple TestFlight account:

- `status=completed`
- `apple_revoke_status=completed`, or `already_revoked` only for a documented retry
- `apple_revoke_error_empty=true`
- `completed_at_present=true`

Do not paste token ciphertext, refresh tokens, Apple private keys, encryption keys, full Apple IDs, or account passwords into git, PRs, or review notes.

After completing the redacted evidence packet, initialize the ignored private evidence JSON from the fail-by-default template:

```powershell
npm.cmd run release:ios:evidence:init -- .release/ios-submission-evidence.json
```

Replace every placeholder, `example` URL, all-zero `requestId`, and `todo` flow result with real redacted evidence. Then run:

```powershell
npm.cmd run release:ios:evidence -- .release/ios-submission-evidence.json
npm.cmd run release:ios:submission -- .release/ios-submission-evidence.json
```

This evidence file belongs in ignored `.release/` storage or another private release folder, not in git. The template generator refuses to overwrite an existing file unless `--force` is provided.
Every private evidence JSON must include `evidenceRefs` for build identity, public URLs, EAS env, Supabase deploy/audit, App Store Connect metadata, TestFlight QA, deletion audit proof, and redaction review. Use private screenshot/log/query-result paths or stable release-note IDs; the checker intentionally fails a file that only contains bare booleans.
Every private evidence JSON must also include `appStoreConnect.evidenceRefs` split by `metadata`, `screenshots`, `privacy`, and `reviewNotes`. App Store Connect evidence references should point to private screenshots or release notes proving each section was entered for the submitted build, not just one umbrella metadata capture.
Every private evidence JSON must record build identity: `build.appVersion` must match `app.json` `expo.version`, the App Store Connect build number string must include that app version, and the reviewed EAS build must record the production EAS profile plus `easChannel=production`. Do not reuse evidence from preview/internal builds whose production EAS profile cannot be proven.
Every `IOS-QA-001` through `IOS-QA-016` row must also have a non-empty `testflight.flowEvidenceRefs[flowId]` entry pointing to private per-flow proof. A single umbrella TestFlight note is useful, but it is not enough for the final machine-checkable evidence file.
Every private evidence JSON must also include `testflight.permissionChecks` with `blinkMicrophonePromptAbsent=true`, `contactsPromptLocalOnly=true`, and non-empty private refs for both microphone and contacts prompt evidence. Keep those refs separate from generic Blink/contact-flow proof so App Review permission behavior can be audited directly.
The evidence JSON must also include `easEnv.publicValues` for the Supabase URL, three public policy/support URLs, and release flags. `EXPO_PUBLIC_SUPABASE_URL` must point to `https://dyuzxilukcwiavtvbmci.supabase.co`; each recorded EAS public policy/support value must match the corresponding `publicUrls` entry; and the App Store Connect privacy/support URLs must match the same hosted pages. This catches the common pre-submit mistake where the hosted pages are correct but the reviewed build, backend project, or App Store metadata points somewhere else.
The final `release:ios:submission` command runs the repo-local readiness gate first and then runs the private evidence checker; do not submit the build until that combined gate passes.

Do not submit for review until failures are either fixed or explicitly documented as not applicable to the submitted build.
