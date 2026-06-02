# iOS App Review Notes Template

Last updated: 2026-06-01

Paste and adapt this in App Store Connect Review Notes. Do not include real production passwords or private keys.

## Suggested Notes

Beep Get is a private pager for close friends. The reviewed iOS build uses Sign in with Apple as the primary login.

Account deletion is available in the app:

1. Open the app.
2. Sign in.
3. Finish profile setup if prompted.
4. Open My.
5. Tap the Account settings gear.
6. Tap Delete Account.

For Sign in with Apple accounts, the submitted build stores encrypted Apple revocation token material server-side during login and attempts Apple token revocation during account deletion before deleting the Supabase Auth user.

Blink uses the camera to record a muted 2-second message and generate a three-frame preview; microphone permission is disabled for this build. Notifications are used for Beep/Blink delivery. The small and medium iOS widgets open app-owned deep links back into Beep Get.

If the Contacts permission appears, contacts are read locally for friend-discovery/invite context only; this build does not upload contact phone numbers or perform remote contact matching.

For the first review build, secondary OAuth and paid identity-pack purchases should remain disabled unless explicitly noted here:

```text
EXPO_PUBLIC_ENABLE_GOOGLE_AUTH=0
EXPO_PUBLIC_ENABLE_KAKAO_AUTH=0
EXPO_PUBLIC_ENABLE_IAP_STORE=0
```

If identity-pack IAP is enabled in the submitted build, the four non-consumable products are:

- `beepget.pack.school_desk`
- `beepget.pack.cherry_dot`
- `beepget.pack.photo_booth_blink`
- `beepget.pack.night_signal`

## Demo / QA Account

Preferred path: reviewer signs in with Apple and creates a disposable Beep ID.

If a pre-created review account is provided, fill in the following outside git:

```text
Review account email:
Review account password:
Review Beep ID:
Friend test Beep ID:
Notes:
```

Do not commit credentials to this repository.

Metadata fields for the same submission live in `docs/deploy/ios-app-store-metadata-draft.md`.
