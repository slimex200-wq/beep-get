# iOS Auth and StoreKit Setup

## Apple OAuth in Supabase

Use the Supabase project `beep-get-prod` (`dyuzxilukcwiavtvbmci`).

Required Apple Developer values:

- App ID / bundle ID: `com.hypeboyo.beepget`
- Services ID: recommended `com.hypeboyo.beepget.signin`
- Website domain for the Services ID: `dyuzxilukcwiavtvbmci.supabase.co`
- Return URL for the Services ID: `https://dyuzxilukcwiavtvbmci.supabase.co/auth/v1/callback`
- Apple signing key `.p8`, Team ID, and Key ID.

Generate the Apple client secret locally:

```powershell
$env:APPLE_TEAM_ID="<Apple Team ID>"
$env:APPLE_SERVICES_ID="com.hypeboyo.beepget.signin"
$env:APPLE_KEY_ID="<Apple Sign in key ID>"
$env:APPLE_PRIVATE_KEY_PATH="C:\path\to\AuthKey_XXXXXXXXXX.p8"
node scripts/apple-client-secret.mjs
```

Patch Supabase with the generated secret without committing it:

```powershell
$env:SUPABASE_ACCESS_TOKEN="<Supabase access token>"
$env:PROJECT_REF="dyuzxilukcwiavtvbmci"
$env:APPLE_CLIENT_SECRET="<output from apple-client-secret.mjs>"

$body = @{
  external_apple_enabled = $true
  external_apple_client_id = "com.hypeboyo.beepget.signin"
  external_apple_secret = $env:APPLE_CLIENT_SECRET
} | ConvertTo-Json

Invoke-RestMethod `
  -Method Patch `
  -Uri "https://api.supabase.com/v1/projects/$env:PROJECT_REF/config/auth" `
  -Headers @{ Authorization = "Bearer $env:SUPABASE_ACCESS_TOKEN" } `
  -ContentType "application/json" `
  -Body $body
```

Also add `beepget://auth/callback` to Supabase Auth redirect URLs if it is missing.

## StoreKit Products

Create these as **Non-Consumable** in App Store Connect for Beep Get:

| Pack | Product ID |
| --- | --- |
| School Desk | `beepget.pack.school_desk` |
| Cherry Dot | `beepget.pack.cherry_dot` |
| Photo Booth Blink | `beepget.pack.photo_booth_blink` |
| Night Signal | `beepget.pack.night_signal` |

The app already uses those IDs in `src/services/purchaseService.ts`.

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

`verify-iap` uses Apple's Get Transaction Info endpoint for iOS strict mode. Do not set `IAP_VERIFICATION_MODE=passthrough-for-internal-testing` for production.
