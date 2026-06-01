# iOS-First Release Readiness - 2026-06-01

## Verdict

Repo-local iOS release work is in progress. The native Expo/EAS configuration is mostly ready, but App Store submission is not yet 100% ready until external policy URLs, App Store metadata, StoreKit product metadata, production EAS env values, and real-device QA are completed.

This pass changed the app to fail closed for the first iOS review build:

- No dead privacy/account-deletion fallback URLs are opened.
- iOS login shows native Sign in with Apple by default; Google/Kakao require explicit public release flags.
- Paid identity-pack UI keeps preview/entitlement structure, but prices and purchase attempts require `EXPO_PUBLIC_ENABLE_IAP_STORE=1`.
- Blink is configured as muted video capture; microphone permission is disabled in the Expo camera plugin.
- Contact discovery is configured as local-only for the first iOS review build; contact phone numbers are not uploaded for matching.
- Sign in with Apple account deletion now has backend revocation support in local code; Supabase deployment and disposable TestFlight proof are still required before review.

## Current Local Evidence

- Branch: `codex/ios-release-readiness`
- Base: `origin/master` at `10e7f8d`
- iOS bundle ID: `com.hypeboyo.beepget`
- App Store Connect app ID: `6769032098`
- App Group: `group.com.beepget.shared`
- EAS project ID: `2c41736e-942b-4593-8fcd-53373d03ee53`
- Repo-local readiness gate: `npm.cmd run release:ios:check` passed 277/277 checks.
- CI coverage: GitHub Actions `validate` now runs `npm run release:ios:check` after typecheck and before Jest, so PRs cannot skip the repo-local iOS release gate.
- Public legal pages bundle: `docs/legal/public/privacy.html`, `docs/legal/public/account-deletion.html`, `docs/legal/public/support.html`, and `docs/legal/public/legal-pages-manifest.json` are ready to upload to a stable HTTPS host; hosting and final URLs remain external.
- Submission evidence checker: `npm.cmd run release:ios:evidence -- .release/ios-submission-evidence.json` is available for the private, redacted TestFlight/App Store/Supabase evidence packet after external QA is complete; initialize it with `npm.cmd run release:ios:evidence:init -- .release/ios-submission-evidence.json` so the starting file fails until placeholders are replaced. The checker now requires build identity to match the repo app version and production EAS profile/channel, EAS public Supabase URL to point to `https://dyuzxilukcwiavtvbmci.supabase.co`, EAS public policy URL/flag values to match the public URL block and submitted-build release flags, App Store Connect privacy/support URLs to match the same hosted pages, split App Store Connect section refs for metadata/screenshots/privacy/review notes, every `IOS-QA-001` through `IOS-QA-016` pass row to have its own private `flowEvidenceRefs` entry, and separate `testflight.permissionChecks` refs proving Blink did not request microphone permission and Contacts showed local-only copy. The final pre-submit command is `npm.cmd run release:ios:submission -- .release/ios-submission-evidence.json`, which runs repo-local readiness and private evidence checks together and fails until that private evidence exists. `npm.cmd run submit:ios:production` also runs the same gate first through `presubmit:ios:production`.
- Fresh local baseline: `npm.cmd run typecheck` passed, `npm.cmd test -- --runInBand` passed 58 suites / 360 tests, `npx.cmd --yes expo-doctor` passed 18/18, and `npm.cmd audit --audit-level=high` exited 0 with 21 moderate transitive findings still documented.
- Local bundle smoke: `npx.cmd expo export --platform ios` passed and wrote ignored `dist/`.
- Submission operator runbook: `docs/deploy/ios-app-store-submission-runbook.md`
- App Store metadata draft: `docs/deploy/ios-app-store-metadata-draft.md`
- App Privacy draft: `docs/deploy/ios-app-privacy-label-draft.md`
- Review notes template: `docs/deploy/ios-review-notes-template.md`
- Screenshot plan: `docs/qa/ios-screenshot-plan.md`
- TestFlight QA evidence sheet: `docs/qa/ios-testflight-qa-evidence.md`

## Store Review Gates

| Gate | Status | Owner | Evidence / Action |
| --- | --- | --- | --- |
| App config | Passing local audit | Repo | `app.json` has iOS bundle ID, Apple Team ID, app group, Apple Sign-In, widget and notification extension targets. |
| Privacy manifest / required-reason API | Passing local audit | Repo | App and extension manifests declare `NSPrivacyAccessedAPICategoryUserDefaults` reason `1C8F.1` for App Group `UserDefaults`; tracking is false. |
| Camera/microphone permissions | Passing local audit, device QA pending | Repo/App owner | Camera copy explains 2-second Blink capture; microphone permission and Android audio recording are disabled for muted Blink. Confirm on real iOS that no microphone prompt appears. |
| Contacts privacy posture | Passing local audit, device QA pending | Repo/App owner | Contacts permission copy says local read; `contactService` has no Supabase import/call and returns no remote matches. Confirm the real iOS prompt copy on device. |
| EAS submit config | Passing local audit | Repo | `eas.json` has production iOS `ascAppId=6769032098`; `package.json` now has iOS production build/submit scripts. |
| CI release gate | Passing local audit | Repo | GitHub Actions `validate` runs `npm run release:ios:check`, and the release gate checks that this CI step remains present. |
| Private submission evidence consistency | Passing local audit, external evidence pending | Repo/App owner | `release:ios:evidence` rejects wrong app version/build identity, non-production EAS profile/channel, wrong EAS Supabase project URL, mismatched EAS public policy URL values, App Store Connect privacy/support URLs, missing per-section App Store Connect evidence refs, release flag drift, TestFlight rows marked pass without per-flow evidence refs, and missing permission prompt evidence refs; the private evidence file still requires real external QA data. |
| App Store metadata draft | Passing local audit, owner confirmation pending | Repo/App owner | `docs/deploy/ios-app-store-metadata-draft.md` has name, subtitle, promotional text, description, keywords, category, content-rights, age-rating, DSA, review-notes, screenshot, and privacy-answer fields; final entry still happens in App Store Connect. |
| Privacy policy URL | Blocked externally | App/site owner | Publish `docs/legal/privacy-policy.md` to a public HTTPS URL and set `EXPO_PUBLIC_PRIVACY_URL` in EAS production. |
| Account deletion URL | Blocked externally | App/site owner | Publish `docs/legal/account-deletion.md` or equivalent request page and set `EXPO_PUBLIC_ACCOUNT_DELETION_URL`; in-app deletion already exists. |
| Support URL | Blocked externally | App/site owner | Publish `docs/legal/support.md`, enter it as the App Store Connect Support URL, and set `EXPO_PUBLIC_SUPPORT_URL`; the app setting link now fails closed if missing. |
| In-app account deletion | Passing local audit, disposable-device QA pending | Repo/App owner | Settings exposes Delete Account, client calls `delete-account` with POST + confirmation, Edge Function requires bearer auth, removes Blink storage, deletes Supabase Auth user, and leaves only hashed deletion audit identity. Test only with disposable accounts. |
| Sign in with Apple token revocation | Local implementation added, external proof pending | App owner/backend owner | Native Apple login requires `authorizationCode`, stores encrypted Apple refresh-token material through `store-apple-revocation-token`, and `delete-account` attempts Apple `/auth/revoke` before Supabase Auth deletion. Access-token fallback is intentionally rejected because account deletion can happen after access-token expiry. Stored-token revocation failures stop deletion so the same encrypted token can be retried. Deploy functions/secrets and prove `apple_revoke_status=completed` with a disposable TestFlight account before review. |
| Apple login | Repo ready, device QA pending | App owner | iOS default login surface is Apple-only unless flags enable secondary OAuth. Real iOS sign-in still needs device/TestFlight QA. |
| Google/Kakao login | Gated for iOS review | App owner | `EXPO_PUBLIC_ENABLE_GOOGLE_AUTH=1` or `EXPO_PUBLIC_ENABLE_KAKAO_AUTH=1` must only be set after provider dashboards are proven. |
| Identity-pack sales | Gated for iOS review | App owner | `EXPO_PUBLIC_ENABLE_IAP_STORE=1` must only be set after App Store products have price, availability, localization, review screenshots, and purchase QA. |
| StoreKit product IDs | Repo mapped, metadata pending | App Store Connect owner | Product IDs are mapped in `src/services/purchaseService.ts`; App Store Connect products are still draft/pending metadata per `docs/deploy/ios-auth-storekit.md`. |
| Production EAS env | Needs confirmation | App owner | Set/verify `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, policy URLs, and release flags in EAS `production`. |
| Real iOS device QA | Pending | App owner | Required for Apple login, camera Blink, push, widget placement, StoreKit sandbox if enabled, and account deletion on disposable account. |

## Release Flags

Default values are conservative for first iOS review:

```text
EXPO_PUBLIC_ENABLE_GOOGLE_AUTH=0
EXPO_PUBLIC_ENABLE_KAKAO_AUTH=0
EXPO_PUBLIC_ENABLE_IAP_STORE=0
```

Enable these only after the matching external provider/store path is complete and has passed real-device QA.

## UltraQA Scenario Matrix

| ID | Scenario | Safe command / harness | Expected result |
| --- | --- | --- | --- |
| UQA-IOS-001 | Local release baseline | `npx.cmd --yes expo-doctor`; `npm.cmd run typecheck`; `npm.cmd test -- --runInBand`; `npx.cmd expo config --type prebuild --json` | All pass or failures are fixed before submission. |
| UQA-IOS-002 | iOS App Store config drift | Node assert for `app.json.expo.ios.bundleIdentifier`, `usesAppleSignIn`, and `eas.json.submit.production.ios.ascAppId` | Exit 0 and no remote mutation. |
| UQA-IOS-002A | Repo-local release gate | `npm.cmd run release:ios:check` | Local app/eas/env/docs/code checks pass and external owner actions are printed without reading secrets. |
| UQA-IOS-002B | Required-reason API drift | `npm.cmd run release:ios:check` plus Expo config assertion | `app.json` and both native target privacy manifests declare UserDefaults App Group reason `1C8F.1` and no tracking. |
| UQA-IOS-002C | App Store metadata drift | `npm.cmd run release:ios:check` | Metadata draft exists and validates basic App Store field limits for name, subtitle, promotional text, description, and keywords. |
| UQA-IOS-002D | Muted Blink permission drift | `npm.cmd run release:ios:check` | Camera permission copy exists, `microphonePermission=false`, and `recordAudioAndroid=false`; final no-microphone-prompt check remains real-device QA. |
| UQA-IOS-002E | Contacts privacy drift | `npm.cmd run release:ios:check`; focused contact service tests | Contacts prompt states local-only use, contact service has no Supabase import/call, and valid phone numbers still return no uploaded matches. |
| UQA-IOS-002F | Support URL drift | `npm.cmd run release:ios:check`; focused release flag tests | `EXPO_PUBLIC_SUPPORT_URL` is documented, Settings opens it through release flags, and missing support URL fails closed. |
| UQA-IOS-002G | In-app account deletion drift | `npm.cmd run release:ios:check`; focused account-service tests | Settings exposes deletion, client calls `delete-account` with POST + confirmation, Edge Function requires bearer auth and deletes user/media; real deletion QA must use a disposable account. |
| UQA-IOS-002H | Sign in with Apple token revocation drift | `npm.cmd run release:ios:check`; focused auth/account tests | Native Apple login requires authorization-code capture, server-side token exchange/encryption exists, and `delete-account` attempts Apple `/auth/revoke`; final proof still requires deployed Supabase functions and disposable TestFlight QA. |
| UQA-IOS-003 | Missing public Supabase env | Run Supabase client tests with empty `EXPO_PUBLIC_SUPABASE_URL` and anon key | App/test path fails closed without production writes. |
| UQA-IOS-004 | Missing policy URLs | Release flag tests and Settings source check | No hard-coded dead URL fallback is present. |
| UQA-IOS-005 | Unproven secondary OAuth | Platform auth tests | iOS provider list is Apple-only by default. |
| UQA-IOS-006 | StoreKit not ready | Skin card/My source tests | Locked packs show preview state unless `EXPO_PUBLIC_ENABLE_IAP_STORE=1`. |
| UQA-IOS-007 | Production-write scripts without creds | Run Apple/Supabase setup scripts with required env blank | Non-zero fail-fast before reading private key or writing remote state. |
| UQA-IOS-008 | Hostile user fields | Focused store/screen tests with long or instruction-like user strings | Render/store as inert app data only. |
| UQA-IOS-009 | Dirty worktree protection | Capture `git status --short` before/after verification | Verification does not create or hide repo changes. |
| UQA-IOS-010 | Windows iOS limitation | `npx.cmd expo prebuild --platform ios --no-install` | Any Windows native-sync limitation is recorded as platform blocked, not treated as app ready. |

## Official Requirements Checked

- Apple App Review Guidelines: final builds must be complete, functional, and include review info for login where needed. See https://developer.apple.com/app-store/review/guidelines/
- Apple account deletion support: apps with account creation must let users initiate deletion. See https://developer.apple.com/support/offering-account-deletion-in-your-app/
- Apple Sign in with Apple deletion/revocation: apps using Sign in with Apple should revoke user tokens with Apple's REST API. Beep Get now captures the Apple authorization code for server-side exchange and deletion-time revoke; real success must be verified after Supabase deployment. See https://developer.apple.com/documentation/technotes/tn3194-handling-account-deletions-and-revoking-tokens-for-sign-in-with-apple and https://developer.apple.com/documentation/signinwithapplerestapi/revoke-tokens
- Apple app privacy details: privacy policy URL and accurate privacy answers are required in App Store Connect. See https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy/
- Apple required-reason API reporting: `UserDefaults` access must be declared in a privacy manifest with a relevant reason; Beep Get uses App Group reason `1C8F.1`. See https://developer.apple.com/documentation/bundleresources/app-privacy-configuration/nsprivacyaccessedapitypes/nsprivacyaccessedapitypereasons
- Apple app information: privacy policy URL, age rating, content rights, support URL, and other app metadata must be completed in App Store Connect. See https://developer.apple.com/help/app-store-connect/reference/app-information
- Apple screenshot specifications: upload one to ten accepted-format screenshots for the required iPhone display class. See https://developer.apple.com/help/app-store-connect/reference/screenshot-specifications
- Apple IAP setup: digital goods must use IAP and first IAP must be submitted with an app version when applicable. See https://developer.apple.com/help/app-store-connect/configure-in-app-purchase-settings/overview-for-configuring-in-app-purchases/
- Expo EAS submit: production iOS build/submit requires iOS bundle ID, submit profile, Apple/App Store Connect credentials, and production env values. See https://docs.expo.dev/submit/ios/

## Remaining External Checklist

1. Publish the privacy policy, deletion page, and support page to stable public HTTPS URLs.
2. Set EAS production env:
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
   - `EXPO_PUBLIC_PRIVACY_URL`
   - `EXPO_PUBLIC_ACCOUNT_DELETION_URL`
   - `EXPO_PUBLIC_SUPPORT_URL`
   - release flags, keeping secondary OAuth/IAP disabled unless proven.
3. In App Store Connect, finish app metadata, support URL, screenshots, privacy nutrition labels, review notes, and demo account instructions if required.
4. If selling skins at launch, finish all four IAP products and set `EXPO_PUBLIC_ENABLE_IAP_STORE=1` only for the QA/review build after sandbox purchase passes.
5. Link Supabase, run `npx supabase db push`, deploy `store-apple-revocation-token` and `delete-account`, set Apple revocation secrets in Supabase, then prove `apple_revoke_status=completed` on a disposable TestFlight account.
6. Run TestFlight or EAS internal device QA on two accounts:
   - Apple login and profile creation.
   - Add friend by Beep ID.
   - Send/receive Beep.
   - Capture/send/read Blink with 3-frame teaser and playback.
   - Confirm Blink capture does not request microphone permission.
   - Confirm Contacts prompt copy, and verify no contact upload/matching behavior is exposed in the submitted build.
   - Push notifications.
   - Widget small/medium placement and open-link behavior.
   - Account deletion with disposable account.
   - Apple token-revocation/account-deletion evidence for that disposable account, with no secrets committed.
