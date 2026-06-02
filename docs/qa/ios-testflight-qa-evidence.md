# iOS TestFlight QA Evidence Sheet

Last updated: 2026-06-01

Fill this out during real iOS QA. Do not commit real account passwords, private keys, full Apple IDs, or production secrets.

## Build

```text
EAS build URL:
IPA artifact URL:
App Store Connect build number:
App version:
EAS build profile:
EAS channel:
TestFlight group:
Tester devices:
iOS versions:
Backend project:
Release flags:
```

## Required Two-Account Flow

| ID | Flow | Account A | Account B | Result | Evidence |
| --- | --- | --- | --- | --- | --- |
| IOS-QA-001 | Install TestFlight build |  |  |  |  |
| IOS-QA-002 | Sign in with Apple |  |  |  |  |
| IOS-QA-003 | Finish nickname/profile/avatar |  |  |  |  |
| IOS-QA-004 | Open privacy/support/deletion links |  |  |  |  |
| IOS-QA-005 | Add friend by Beep ID |  |  |  |  |
| IOS-QA-006 | Send Beep |  |  |  |  |
| IOS-QA-007 | Receive Beep |  |  |  |  |
| IOS-QA-008 | Reply with quick slot |  |  |  |  |
| IOS-QA-009 | Capture 2-second Blink |  |  |  |  |
| IOS-QA-010 | Send Blink with three teaser frames |  |  |  |  |
| IOS-QA-011 | Receive/play Blink |  |  |  |  |
| IOS-QA-012 | Receive push notification |  |  |  |  |
| IOS-QA-013 | Add small widget and open app link |  |  |  |  |
| IOS-QA-014 | Add medium widget and open app link |  |  |  |  |
| IOS-QA-015 | Delete disposable account in app |  |  |  |  |
| IOS-QA-016 | Sign in with Apple token revocation/account-deletion evidence (`apple_revoke_status=completed`) |  |  |  |  |

## Redacted Submission Evidence Packet

Complete this packet before App Store submission. Keep screenshots/logs in a private release folder, not in git, unless they are fully redacted.

| Gate | Required sanitized evidence | Result |
| --- | --- | --- |
| Public URLs | HTTPS privacy, support, and account-deletion URLs open without auth and match App Store Connect plus EAS production env values. |  |
| EAS production env | `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_PRIVACY_URL`, `EXPO_PUBLIC_ACCOUNT_DELETION_URL`, `EXPO_PUBLIC_SUPPORT_URL`, and release flags are present. Record variable names, public URL values, and intended flag values only; do not record secret values. |  |
| Supabase migration/functions | `20260601120000_apple_auth_tokens.sql` is applied, `store-apple-revocation-token` and `delete-account` are deployed, and required Apple revocation secret names are present. Do not paste private key, encryption key, token ciphertext, or refresh token values. |  |
| App Store Connect metadata | Name, subtitle, description, keywords, screenshots, support URL, privacy answers, review notes, and Sign in with Apple/account deletion notes are entered for the submitted build. Record separate private refs under `appStoreConnect.evidenceRefs` for metadata, screenshots, privacy, and review notes. |  |
| TestFlight two-account QA | Rows `IOS-QA-001` through `IOS-QA-016` are marked pass with build number, device/iOS versions, and redacted screenshots or notes. Each row must also have a matching `flowEvidenceRefs` entry in the private evidence JSON. |  |
| Permission prompts | Blink capture shows no microphone permission prompt in the reviewed iOS build, and any Contacts prompt shows the local-only copy from `app.json`. Record separate private refs under `testflight.permissionChecks.evidenceRefs`. |  |
| Disposable deletion audit | The in-app deletion response recorded a `requestId` and `appleRevokeStatus`. Supabase audit query shows `status=completed`, `apple_revoke_status=completed` or `already_revoked`, `apple_revoke_error is null`, and `completed_at is not null`. |  |
| IAP, if enabled | Each enabled product has sandbox purchase, entitlement, restore, and reopen evidence. If `EXPO_PUBLIC_ENABLE_IAP_STORE=0`, mark this not applicable. |  |

Safe Supabase audit query after deleting the disposable TestFlight account:

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

Expected result for a fresh Sign in with Apple TestFlight account:

```text
status=completed
apple_revoke_status=completed
apple_revoke_error_empty=true
completed_at_present=true
```

`apple_revoke_status=already_revoked` is acceptable only when the disposable account was already revoked by Apple during a retry. `apple_revoke_status=failed` or `not_available` blocks App Store submission for this build.

Never paste `token_ciphertext`, `token_iv`, `APPLE_PRIVATE_KEY`, `APPLE_TOKEN_ENCRYPTION_KEY`, refresh tokens, full Apple IDs, access tokens, or account passwords into this evidence sheet.

## Machine-Checkable Evidence File

After the packet above is complete, create a private untracked JSON file from the fail-by-default template:

```powershell
npm.cmd run release:ios:evidence:init -- .release/ios-submission-evidence.json
```

Then replace every placeholder, `example` URL, all-zero `requestId`, and `todo` flow result with real redacted evidence before running:

```powershell
npm.cmd run release:ios:evidence -- .release/ios-submission-evidence.json
npm.cmd run release:ios:submission -- .release/ios-submission-evidence.json
```

Use this shape. The template generator writes the same structure, starts in a failing state on purpose, and refuses to overwrite an existing evidence file unless `--force` is provided. The final submission gate runs both repo-local readiness and private evidence checks, so it should only pass after real external QA is complete. Keep the file out of git:

```json
{
  "build": {
    "easBuildUrl": "https://expo.dev/accounts/hypeboyo/projects/beep-get/builds/<real-build-id>",
    "appVersion": "1.0.0",
    "appStoreConnectBuildNumber": "1.0.0 (redacted)",
    "easBuildProfile": "production",
    "easChannel": "production",
    "testFlightGroup": "Internal QA",
    "testerDevices": ["iPhone model and device label"],
    "iosVersions": ["iOS version"],
    "backendProject": "dyuzxilukcwiavtvbmci",
    "releaseFlags": {
      "EXPO_PUBLIC_ENABLE_GOOGLE_AUTH": "0",
      "EXPO_PUBLIC_ENABLE_KAKAO_AUTH": "0",
      "EXPO_PUBLIC_ENABLE_IAP_STORE": "0"
    }
  },
  "publicUrls": {
    "privacyUrl": "https://slimex200-wq.github.io/beep-get/privacy.html",
    "accountDeletionUrl": "https://slimex200-wq.github.io/beep-get/account-deletion.html",
    "supportUrl": "https://slimex200-wq.github.io/beep-get/support.html"
  },
  "evidenceRefs": {
    "build": ["private-release/testflight-build-summary.png"],
    "publicUrls": ["private-release/public-url-checks.png"],
    "easEnv": ["private-release/eas-env-names.txt"],
    "supabase": ["private-release/supabase-functions-and-audit.txt"],
    "appStoreConnect": ["private-release/app-store-connect-metadata.png"],
    "testflight": ["private-release/testflight-two-account-flow.md"],
    "deletionAudit": ["private-release/deletion-audit-query-result.txt"],
    "redaction": ["private-release/redaction-review.md"]
  },
  "easEnv": {
    "namesPresent": [
      "EXPO_PUBLIC_SUPABASE_URL",
      "EXPO_PUBLIC_SUPABASE_ANON_KEY",
      "EXPO_PUBLIC_PRIVACY_URL",
      "EXPO_PUBLIC_ACCOUNT_DELETION_URL",
      "EXPO_PUBLIC_SUPPORT_URL",
      "EXPO_PUBLIC_ENABLE_GOOGLE_AUTH",
      "EXPO_PUBLIC_ENABLE_KAKAO_AUTH",
      "EXPO_PUBLIC_ENABLE_IAP_STORE"
    ],
    "publicValues": {
      "EXPO_PUBLIC_SUPABASE_URL": "https://dyuzxilukcwiavtvbmci.supabase.co",
      "EXPO_PUBLIC_PRIVACY_URL": "https://slimex200-wq.github.io/beep-get/privacy.html",
      "EXPO_PUBLIC_ACCOUNT_DELETION_URL": "https://slimex200-wq.github.io/beep-get/account-deletion.html",
      "EXPO_PUBLIC_SUPPORT_URL": "https://slimex200-wq.github.io/beep-get/support.html",
      "EXPO_PUBLIC_ENABLE_GOOGLE_AUTH": "0",
      "EXPO_PUBLIC_ENABLE_KAKAO_AUTH": "0",
      "EXPO_PUBLIC_ENABLE_IAP_STORE": "0"
    }
  },
  "supabase": {
    "migrationApplied": "20260601120000_apple_auth_tokens.sql",
    "functionsDeployed": ["store-apple-revocation-token", "delete-account"],
    "appleRevocationSecretNamesPresent": [
      "APPLE_TEAM_ID",
      "APPLE_KEY_ID",
      "APPLE_PRIVATE_KEY",
      "APPLE_TOKEN_CLIENT_ID",
      "APPLE_TOKEN_ENCRYPTION_KEY"
    ]
  },
  "appStoreConnect": {
    "metadataEntered": true,
    "screenshotsEntered": true,
    "privacyAnswersEntered": true,
    "reviewNotesEntered": true,
    "evidenceRefs": {
      "metadata": ["private-release/app-store-connect-metadata.png"],
      "screenshots": ["private-release/app-store-connect-screenshots.png"],
      "privacy": ["private-release/app-store-connect-privacy-answers.png"],
      "reviewNotes": ["private-release/app-store-connect-review-notes.png"]
    },
    "privacyPolicyUrl": "https://slimex200-wq.github.io/beep-get/privacy.html",
    "supportUrl": "https://slimex200-wq.github.io/beep-get/support.html"
  },
  "testflight": {
    "twoAccounts": true,
    "flows": {
      "IOS-QA-001": "pass",
      "IOS-QA-002": "pass",
      "IOS-QA-003": "pass",
      "IOS-QA-004": "pass",
      "IOS-QA-005": "pass",
      "IOS-QA-006": "pass",
      "IOS-QA-007": "pass",
      "IOS-QA-008": "pass",
      "IOS-QA-009": "pass",
      "IOS-QA-010": "pass",
      "IOS-QA-011": "pass",
      "IOS-QA-012": "pass",
      "IOS-QA-013": "pass",
      "IOS-QA-014": "pass",
      "IOS-QA-015": "pass",
      "IOS-QA-016": "pass"
    },
    "flowEvidenceRefs": {
      "IOS-QA-001": ["private-release/ios-qa-001-install.md"],
      "IOS-QA-002": ["private-release/ios-qa-002-apple-login.png"],
      "IOS-QA-003": ["private-release/ios-qa-003-profile.png"],
      "IOS-QA-004": ["private-release/ios-qa-004-links.md"],
      "IOS-QA-005": ["private-release/ios-qa-005-friend.png"],
      "IOS-QA-006": ["private-release/ios-qa-006-send-beep.png"],
      "IOS-QA-007": ["private-release/ios-qa-007-receive-beep.png"],
      "IOS-QA-008": ["private-release/ios-qa-008-quick-reply.png"],
      "IOS-QA-009": ["private-release/ios-qa-009-capture-blink.png"],
      "IOS-QA-010": ["private-release/ios-qa-010-send-blink.png"],
      "IOS-QA-011": ["private-release/ios-qa-011-play-blink.png"],
      "IOS-QA-012": ["private-release/ios-qa-012-push.png"],
      "IOS-QA-013": ["private-release/ios-qa-013-small-widget.png"],
      "IOS-QA-014": ["private-release/ios-qa-014-medium-widget.png"],
      "IOS-QA-015": ["private-release/ios-qa-015-delete-account.md"],
      "IOS-QA-016": ["private-release/ios-qa-016-apple-revoke-audit.md"]
    },
    "permissionChecks": {
      "blinkMicrophonePromptAbsent": true,
      "contactsPromptLocalOnly": true,
      "evidenceRefs": {
        "microphone": ["private-release/microphone-permission-check.md"],
        "contacts": ["private-release/contacts-permission-copy.png"]
      }
    }
  },
  "deletionAudit": {
    "requestId": "00000000-0000-4000-8000-000000000000",
    "status": "completed",
    "appleRevokeStatus": "completed",
    "appleRevokeErrorEmpty": true,
    "completedAtPresent": true
  },
  "iap": {
    "enabled": false
  },
  "redaction": {
    "confirmedNoSecrets": true
  }
}
```

Use real hosted HTTPS URLs in the private evidence file; `example` URLs intentionally fail the evidence checker.
Replace every placeholder/redacted value before running the checker; reserved domains like `.example`, `.test`, `.invalid`, and `localhost` fail intentionally. The all-zero sample `requestId` also fails intentionally.
Each `evidenceRefs` entry should point to a private screenshot, log excerpt, query result, or QA note. The checker requires references for build, public URLs, EAS env, Supabase deploy/audit, App Store Connect, TestFlight QA, deletion audit, and redaction review so a JSON full of bare booleans cannot pass as submission proof.
App Store Connect evidence references must also be split under `appStoreConnect.evidenceRefs` for `metadata`, `screenshots`, `privacy`, and `reviewNotes`. This gives App Store Connect evidence references enough shape to prove each review-console section was actually entered.
Each `testflight.flowEvidenceRefs` entry must point to private per-flow proof for the matching `IOS-QA-###` row. A flow marked `pass` without its own evidence reference fails the checker.
The `testflight.permissionChecks` block must set `blinkMicrophonePromptAbsent=true` and `contactsPromptLocalOnly=true`, with non-empty private refs for both microphone and contacts evidence. This is separate from the normal flow rows so a generic Blink screenshot cannot accidentally stand in for iOS permission prompt proof.
The `easEnv.publicValues.EXPO_PUBLIC_SUPABASE_URL` field must be `https://dyuzxilukcwiavtvbmci.supabase.co`, the public policy/support URL fields must match `publicUrls`, and the App Store Connect privacy/support URL fields must match those same hosted URLs. The release flag values under `easEnv.publicValues` must match `build.releaseFlags`.
The `build.appVersion` value must match `app.json` `expo.version`, the App Store Connect build number string must include that same app version, and the recorded EAS build profile/channel must both be `production`. This catches stale TestFlight proof copied from a preview or older version build.

## IAP QA, Only If Enabled

| Product ID | Sandbox purchase | Entitlement applied | Restore/reopen verified | Evidence |
| --- | --- | --- | --- | --- |
| `beepget.pack.school_desk` |  |  |  |  |
| `beepget.pack.cherry_dot` |  |  |  |  |
| `beepget.pack.photo_booth_blink` |  |  |  |  |
| `beepget.pack.night_signal` |  |  |  |  |

## Failures

| ID | Failure | Repro steps | Logs/screenshots | Fixed in commit/build |
| --- | --- | --- | --- | --- |
|  |  |  |  |  |
