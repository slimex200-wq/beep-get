# iOS Auth and StoreKit Setup

## Native Apple Login in Supabase

Use the Supabase project `beep-get-prod` (`dyuzxilukcwiavtvbmci`).

The iOS app uses native `expo-apple-authentication` and exchanges the Apple `identityToken` with Supabase via `signInWithIdToken`.

Required Apple Developer values for the native app path:

- App ID / bundle ID: `com.hypeboyo.beepget`
- Services ID: `com.hypeboyo.beepget.signin`
- Apple signing key `.p8`, Team ID `YR267UY7UX`, and Key ID `98ZCRX9Y55`.
- Supabase callback URL for the Services ID: `https://dyuzxilukcwiavtvbmci.supabase.co/auth/v1/callback`

Generate the Apple client secret locally:

```powershell
$env:APPLE_TEAM_ID="YR267UY7UX"
$env:APPLE_KEY_ID="98ZCRX9Y55"
$env:APPLE_PRIVATE_KEY_PATH="C:\Users\slime\Downloads\AuthKey_98ZCRX9Y55.p8"
$env:APPLE_CLIENT_ID="com.hypeboyo.beepget.signin,com.hypeboyo.beepget"
$env:APPLE_CLIENT_SECRET_SUB="com.hypeboyo.beepget.signin"
node scripts/apple-client-secret.mjs
```

Patch Supabase with the generated secret without committing it:

```powershell
$env:SUPABASE_ACCESS_TOKEN="<Supabase access token>"
$env:APPLE_TEAM_ID="YR267UY7UX"
$env:APPLE_KEY_ID="98ZCRX9Y55"
$env:APPLE_PRIVATE_KEY_PATH="C:\Users\slime\Downloads\AuthKey_98ZCRX9Y55.p8"
$env:APPLE_CLIENT_ID="com.hypeboyo.beepget.signin,com.hypeboyo.beepget"
$env:APPLE_CLIENT_SECRET_SUB="com.hypeboyo.beepget.signin"
npm run apple:supabase-provider
```

The Supabase provider client ID list includes both the Services ID and the native bundle ID. The client secret JWT `sub` uses the Services ID.

## Sign in with Apple Account Deletion / Token Revocation

Apple's account-deletion guidance says apps that support Sign in with Apple should revoke user tokens with the Sign in with Apple REST API when users delete their accounts:

- https://developer.apple.com/support/offering-account-deletion-in-your-app/
- https://developer.apple.com/documentation/technotes/tn3194-handling-account-deletions-and-revoking-tokens-for-sign-in-with-apple
- https://developer.apple.com/documentation/signinwithapplerestapi/revoke-tokens

Current repo state:

- The iOS app uses native `expo-apple-authentication`.
- The app sends the Apple `identityToken` and raw nonce to `supabase.auth.signInWithIdToken`.
- The app also requires the Apple authorization code and sends it to the `store-apple-revocation-token` Edge Function immediately after Supabase sign-in.
- `store-apple-revocation-token` exchanges the short-lived authorization code server-side with Apple, requires the returned Apple refresh token, encrypts it using `APPLE_TOKEN_ENCRYPTION_KEY`, and stores only encrypted token material in `public.apple_auth_tokens`. It intentionally does not fall back to an Apple access token because account deletion may happen after access-token expiry.
- The `delete-account` Edge Function attempts Apple `/auth/revoke` before deleting Beep Get app data, private Blink media, and the Supabase Auth user. It records `apple_revoke_status` and `apple_revoke_error` on the deletion audit row without retaining raw Apple token material. If stored Apple token material exists and revocation fails, deletion stops so the same encrypted token can be retried after the backend issue is fixed.
- Repo-local code can prove this implementation shape, but the real Apple revoke result still requires Supabase deployment, Apple credentials, and a disposable TestFlight account.

Set these Supabase Edge Function secrets before the reviewed build:

```powershell
npx supabase secrets set `
  --project-ref dyuzxilukcwiavtvbmci `
  APPLE_TEAM_ID="YR267UY7UX" `
  APPLE_KEY_ID="98ZCRX9Y55" `
  APPLE_PRIVATE_KEY="$(Get-Content -Raw C:\path\to\AuthKey_XXXXXXXXXX.p8)" `
  APPLE_TOKEN_CLIENT_ID="com.hypeboyo.beepget" `
  APPLE_TOKEN_ENCRYPTION_KEY="<long random secret>"
```

Apply the DB migration that creates `public.apple_auth_tokens` and the `apple_revoke_status` audit columns before deploying the functions:

```powershell
npx supabase link --project-ref dyuzxilukcwiavtvbmci
npx supabase db push
```

Deploy the revocation-token storage function with the deletion function:

```powershell
npx supabase functions deploy store-apple-revocation-token --project-ref dyuzxilukcwiavtvbmci
npx supabase functions deploy delete-account --project-ref dyuzxilukcwiavtvbmci
```

Before App Store submission, sign in with a disposable TestFlight Apple account, delete that account in app, and record sanitized evidence that `apple_revoke_status=completed` or that Apple returned an already-revoked equivalent. If `apple_revoke_status=not_available` or `failed`, do not submit the build until the backend/token path is fixed.

Do not commit Apple private keys, generated client secrets, refresh tokens, access tokens, authorization codes, or full Apple IDs. Record only the verification outcome, build number, and sanitized disposable account notes.

## StoreKit Products

Create these as **Non-Consumable** in App Store Connect for Beep Get:

| Pack | Product ID |
| --- | --- |
| School Desk | `beepget.pack.school_desk` |
| Cherry Dot | `beepget.pack.cherry_dot` |
| Photo Booth Blink | `beepget.pack.photo_booth_blink` |
| Night Signal | `beepget.pack.night_signal` |

The app already uses those IDs in `src/services/purchaseService.ts`.

Current App Store Connect state:

- App ID: `6769032098`
- The four non-consumable products exist as drafts.
- Each product still needs price/availability, localization, and review screenshot metadata before review.
- Existing Team Key: Issuer ID `fece44f0-aae6-44b0-ad23-188e30076da2`, Key ID `NASNC6QDQH`, name `[Expo] EAS Submit FZ_lkq586Z`, Admin role.
- Beep Get App Store Server API key: Key ID `JQ6KM739V7`, App Manager role, private key file `AuthKey_JQ6KM739V7.p8`.
- Supabase Edge Function secrets are set for App Store Server API verification and `APP_BUNDLE_ID=com.hypeboyo.beepget`.
- Revoked/unused key `824QSV86HA` should not be used. Delete any local `AuthKey_824QSV86HA.p8` copy to avoid confusion.

The reviewed app build should keep `EXPO_PUBLIC_ENABLE_IAP_STORE=0` until those products have price, availability, localization, review screenshot metadata, and a successful sandbox purchase QA pass. With the flag off, the app can still preview locked identity packs without showing prices or attempting StoreKit purchases.

If an App Store Connect API key is available, create the products from CLI:

```powershell
$env:ASC_APP_ID="6769032098"
$env:APP_STORE_CONNECT_ISSUER_ID="fece44f0-aae6-44b0-ad23-188e30076da2"
$env:APP_STORE_CONNECT_KEY_ID="JQ6KM739V7"
$env:APP_STORE_CONNECT_PRIVATE_KEY_PATH="C:\path\to\AuthKey_XXXXXXXXXX.p8"
npm run apple:create-iaps
```

After creation, App Store Connect still needs pricing, availability, localizations, and review metadata/screenshots before review.

## App Store Server API Secrets

Create an App Store Connect API key with In-App Purchase / App Store Server API access, then set these Supabase Edge Function secrets:

```powershell
npx supabase secrets set `
  --project-ref dyuzxilukcwiavtvbmci `
  APP_STORE_CONNECT_ISSUER_ID="<issuer id>" `
  APP_STORE_CONNECT_KEY_ID="<key id>" `
  APP_STORE_CONNECT_PRIVATE_KEY="$(Get-Content -Raw C:\path\to\AuthKey_XXXXXXXXXX.p8)" `
  APP_BUNDLE_ID="com.hypeboyo.beepget"
```

or:

```powershell
$env:APP_STORE_CONNECT_ISSUER_ID="fece44f0-aae6-44b0-ad23-188e30076da2"
$env:APP_STORE_CONNECT_KEY_ID="JQ6KM739V7"
$env:APP_STORE_CONNECT_PRIVATE_KEY_PATH="C:\Users\slime\Downloads\AuthKey_JQ6KM739V7.p8"
$env:APP_BUNDLE_ID="com.hypeboyo.beepget"
npm run apple:supabase-iap-secrets
```

`verify-iap` uses Apple's Get Transaction Info endpoint for iOS strict mode. Do not set `IAP_VERIFICATION_MODE=passthrough-for-internal-testing` for production.
