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
