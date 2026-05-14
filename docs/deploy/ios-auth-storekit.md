# iOS Auth and StoreKit Setup

## Native Apple Login in Supabase

Use the Supabase project `beep-get-prod` (`dyuzxilukcwiavtvbmci`).

The iOS app uses native `expo-apple-authentication` and exchanges the Apple `identityToken` with Supabase via `signInWithIdToken`.

Required Apple Developer values for the native app path:

- App ID / bundle ID: `com.hypeboyo.beepget`
- Apple signing key `.p8`, Team ID, and Key ID.

Generate the Apple client secret locally:

```powershell
$env:APPLE_TEAM_ID="<Apple Team ID>"
$env:APPLE_CLIENT_ID="com.hypeboyo.beepget"
$env:APPLE_KEY_ID="<Apple Sign in key ID>"
$env:APPLE_PRIVATE_KEY_PATH="C:\path\to\AuthKey_XXXXXXXXXX.p8"
node scripts/apple-client-secret.mjs
```

Patch Supabase with the generated secret without committing it:

```powershell
$env:SUPABASE_ACCESS_TOKEN="<Supabase access token>"
npm run apple:supabase-provider
```

If a web OAuth fallback is ever added, create a separate Apple Services ID and callback URL. The current iOS app login path does not require the web redirect flow.

## StoreKit Products

Create these as **Non-Consumable** in App Store Connect for Beep Get:

| Pack | Product ID |
| --- | --- |
| School Desk | `beepget.pack.school_desk` |
| Cherry Dot | `beepget.pack.cherry_dot` |
| Photo Booth Blink | `beepget.pack.photo_booth_blink` |
| Night Signal | `beepget.pack.night_signal` |

The app already uses those IDs in `src/services/purchaseService.ts`.

If an App Store Connect API key is available, create the products from CLI:

```powershell
$env:ASC_APP_ID="6769032098"
$env:APP_STORE_CONNECT_ISSUER_ID="<issuer id>"
$env:APP_STORE_CONNECT_KEY_ID="<key id>"
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
$env:APP_STORE_CONNECT_ISSUER_ID="<issuer id>"
$env:APP_STORE_CONNECT_KEY_ID="<key id>"
$env:APP_STORE_CONNECT_PRIVATE_KEY_PATH="C:\path\to\AuthKey_XXXXXXXXXX.p8"
npm run apple:supabase-iap-secrets
```

`verify-iap` uses Apple's Get Transaction Info endpoint for iOS strict mode. Do not set `IAP_VERIFICATION_MODE=passthrough-for-internal-testing` for production.
