# Final Build Readiness Audit - 2026-05-14

## Verdict

Not ready for final production iOS/Android builds yet.

The app code gate is healthy on `origin/master`, but the production path is blocked by remote Supabase deployment, Apple/Google store setup, iOS extension provisioning, and real two-device QA. Treat the next builds as internal verification builds until the P0 list below is closed.

## Current Evidence

- Branch audited: `origin/master` from local branch `codex/final-build-readiness-audit`.
- Open GitHub issues:
  - `#52` Configure iOS extension provisioning profiles for WidgetKit build.
  - `#53` Enable Supabase Apple auth provider for iOS login.
- Supabase project: `dyuzxilukcwiavtvbmci` (`beep-get-prod`).
- Remote DB dry-run still wants to push:
  - `20260510150000_allow_text_signal_tokens.sql`
  - `20260514190000_revenue_push_cleanup_foundation.sql`
- Remote Edge Functions currently list only:
  - `delete-account`
- Remote Supabase secrets currently list only Supabase defaults. Missing release secrets include App Store Server API values and `CLEANUP_SHARED_SECRET`.
- iOS auth implementation is now native Apple sign-in:
  - `expo-apple-authentication`
  - `ios.usesAppleSignIn: true`
  - `supabase.auth.signInWithIdToken({ provider: "apple" })`
- Android/web auth remains Google OAuth.

## P0 Stop-Ship

1. Deploy pending Supabase migrations.

   The app can already send short text slots and call purchase/push tables in code, but remote DB is behind. Run and verify:

   ```bash
   npm run supabase:dry-run
   supabase db push --linked
   npm run supabase:dry-run
   ```

   Expected final state: dry-run reports no pending migrations.

2. Deploy new Supabase Edge Functions.

   `verify-iap`, `send-signal-push`, and `cleanup-expired-signals` exist locally but are not active remotely. Deploy them before any build that exposes identity-pack unlock, push delivery, or Blink cleanup behavior.

   ```bash
   supabase functions deploy verify-iap --project-ref dyuzxilukcwiavtvbmci
   supabase functions deploy send-signal-push --project-ref dyuzxilukcwiavtvbmci
   supabase functions deploy cleanup-expired-signals --project-ref dyuzxilukcwiavtvbmci
   supabase functions list --project-ref dyuzxilukcwiavtvbmci
   ```

3. Set production Edge Function secrets.

   Required before strict iOS IAP and cleanup:

   - `APP_STORE_CONNECT_ISSUER_ID`
   - `APP_STORE_CONNECT_KEY_ID`
   - `APP_STORE_CONNECT_PRIVATE_KEY`
   - `APP_BUNDLE_ID=com.hypeboyo.beepget`
   - `CLEANUP_SHARED_SECRET`

   Do not set `IAP_VERIFICATION_MODE=passthrough-for-internal-testing` for production.

4. Enable Supabase Apple provider for native iOS login.

   Native Apple login still needs Supabase Apple provider verification enabled server-side. Use:

   - Client ID: `com.hypeboyo.beepget`
   - Team ID: `YR267UY7UX`
   - Key ID: `98ZCRX9Y55`
   - `.p8`: keep local/secret only, never commit or paste into chat.

   Close `#53` only after a real iOS device signs in with Apple and lands in the nickname/profile flow.

5. Resolve iOS extension provisioning.

   Close `#52` only after EAS can provision/build:

   - `com.hypeboyo.beepget`
   - `com.hypeboyo.beepget.widget`
   - `com.hypeboyo.beepget.notificationservice`
   - App Group: `group.com.beepget.shared`

   This is required before claiming iOS WidgetKit support.

6. Create/confirm store products.

   App code maps paid packs to:

   - `beepget.pack.school_desk`
   - `beepget.pack.cherry_dot`
   - `beepget.pack.photo_booth_blink`
   - `beepget.pack.night_signal`

   iOS needs App Store Connect products plus App Store Server API secrets. Android needs matching Play Console products or paid-pack unlock must be hidden/gated on Android. Current `verify-iap` returns `501` for Android strict verification.

7. Confirm production public URLs/env.

   Before store submission, confirm live URLs for:

   - `EXPO_PUBLIC_PRIVACY_URL`
   - `EXPO_PUBLIC_ACCOUNT_DELETION_URL`
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`

8. Run real two-device QA on production backend.

   Required flows:

   - iOS Apple login -> nickname -> profile creation.
   - Android Google login -> nickname/profile recovery after restart.
   - Add friend by Beep ID.
   - Send Beep text slot.
   - Receive Beep on other device.
   - Reply from app and widget quick-reply action.
   - Send Blink with camera, upload, 3-frame teaser, signed playback.
   - Push notification delivery in both directions.
   - Save/read/open deep links.
   - Account deletion only with disposable QA account.

## P1 Before Wider TestFlight / Play Internal

1. Add reply-slot editing UX.

   The product promise is widget/app pager replies. `MY` currently displays saved dictionary entries plus defaults, but there is no polished "edit my widget reply slots" flow. Add a focused editor or make the existing dictionary path explicit from `MY`.

2. Gate paid identity-pack purchase UI until store setup is real.

   `purchaseIdentityPack()` now opens native IAP. If products are missing, users see `Store product is not available yet.` That is acceptable for internal QA but too rough for public review. Either finish both stores or hide/disable paid unlock with clear internal-only state.

3. Decide Android monetization path.

   iOS strict receipt verification is implemented, but Android Google Play receipt verification is intentionally not configured. For Android final build, either implement Play verification or do not expose paid unlock.

4. Schedule cleanup.

   `cleanup-expired-signals` exists locally, but there is no confirmed production scheduler. Add a Cloud Scheduler/GitHub Actions/Supabase scheduled invocation path with `CLEANUP_SHARED_SECRET`.

5. Re-check widget setup modal UX on iOS.

   Previous real-device screenshots showed the widget modal clipped under iOS chrome. Verify the current full-screen/widget setup route on real iOS and Android after the next build.

6. Decide collection/season surface.

   `collectionService` and `seasonService` intentionally return empty safe fallbacks because the v2 schema does not include reward tables. If collection/season screens are reachable in production, hide them or design the real schema before final launch.

## Security Review Notes

- No secret values should be committed or pasted. Apple `.p8`, App Store Connect API key, service role key, Play credentials, and cleanup secret must stay in secure local/dashboard storage.
- Do not push local `supabase/config.toml` provider settings to production. Provider settings are dashboard/Management API config.
- `send-signal-push` correctly authenticates the caller and only lets the sender notify the receiver, but it is not deployed yet.
- `cleanup-expired-signals` requires `CLEANUP_SHARED_SECRET`, but the secret is not set remotely yet.
- `verify-iap` defaults to strict mode. Keep passthrough mode out of production.
- `delete-account` is deployed; only test destructive deletion with disposable accounts.
- `npm audit --audit-level=high` passed. Remaining findings are low/moderate Expo/Jest transitive issues whose automated fix path is breaking.

## Design / UX QA Notes

- Current direction still matches the approved paper-slip pager UI: `TODAY / SEND / PEOPLE / MY`.
- iOS real-device QA is required for splash/icon flicker, safe areas, modal presentation, native Apple sheet, widget placement, and notification prompt timing.
- Android emulator build passes, but launcher widget placement remains manual and must be checked on a real launcher/device.
- Invite/share copy should be rechecked from both platforms after the next build because previous TestFlight showed raw/mojibake invite text.
- Font rendering should be checked on physical iOS and Android, not just Jest/prebuild.

## Verification Run In This Audit

Passed:

```bash
npm.cmd run typecheck
npm.cmd test -- --runInBand
npx.cmd --yes expo-doctor
npm.cmd audit --audit-level=high
git diff --check
npx.cmd expo prebuild --platform android --no-install
android\gradlew.bat -p android :app:assembleDebug -PreactNativeArchitectures=x86_64 --console=plain --no-daemon
```

Blocked / not a code failure:

```bash
npm.cmd run supabase:lint
```

Reason: local Supabase Postgres at `127.0.0.1:54322` was not running.

Remote checks that found blockers:

```bash
npm.cmd run supabase:dry-run
npx.cmd supabase functions list --project-ref dyuzxilukcwiavtvbmci
npx.cmd supabase secrets list --project-ref dyuzxilukcwiavtvbmci
gh issue list --state open
```

## Recommended Execution Order

1. Deploy Supabase migrations.
2. Deploy Edge Functions.
3. Set Edge Function secrets.
4. Enable Supabase Apple provider.
5. Resolve iOS extension provisioning.
6. Create/confirm App Store and Play products, or gate paid packs.
7. Rebuild iOS and Android internal builds.
8. Run the two-device QA matrix.
9. Fix P1 UX gaps found in QA.
10. Only then run final production builds/submissions.
