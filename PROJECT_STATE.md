# Project State

## Purpose

Beep-get Expo/React Native app with product/visual direction captured in `.brand.json` and mockup files.

## Current Status

- Active Git repo with Expo, Supabase, Jest, and React Native dependencies.
- AI harness files are committed and pushed on `master`.
- Android prebuild and debug Gradle assemble are working locally after SDK 54 dependency alignment and widget module fixes.
- EAS project is linked as `@hypeboyo/beep-get` with project ID `2c41736e-942b-4593-8fcd-53373d03ee53`.
- Android release configuration now targets package `com.hypeboyo.beepget` and Google Play internal testing.
- Backend-free UI preview mode is available behind `EXPO_PUBLIC_UI_PREVIEW=1` for emulator review before Supabase/OAuth are configured.
- Home preview now follows the saved Swiss Paper widget mockup direction instead of the old generic LCD/neumorphic card layout.
- Supabase CLI is installed as a project dev dependency; local Supabase config is initialized for the clean Beep/Blink backend plan.
- Active Supabase migration direction is now v2 `profiles/signals/signal_media/usage_daily`; the old `users/messages/friendships` migrations are archived and should not be pushed to a new project.
- Supabase project `beep-get-prod` is linked locally with project ref `dyuzxilukcwiavtvbmci`; v2 Beep/Blink migration has been pushed to the remote database through the IPv4 pooler path.
- Local `.env` is configured with the remote Supabase URL and public/publishable app key; secret DB password remains gitignored under `supabase/.temp/`.
- Beep/Blink domain limits and presentation payload helpers are implemented with tests, including the 2-second Blink cap and widget-safe teaser payloads.
- Home preview now acts as a Today/Reply Room entry point for the Beep/Blink loop, and `ReplyRoom` is available as a modal/deep-link target.
- macOS/iOS availability may block iOS verification.

## Next Work Queue

- Perform real Android home-screen widget placement QA after the preview app review.
- Add production EAS env values for `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
- Add Google/Apple OAuth provider settings in Supabase for `beep-get-prod`.
- Add production EAS env values for `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
- Continue from the static Reply Room into real Signal service wiring.
- Configure Google Play Console/service account, then run production EAS build and submit.
- Keep visual changes aligned with `.brand.json` and existing mockups.
- Continue UI/UX review from the current `EXPO_PUBLIC_UI_PREVIEW=1` emulator build, especially non-home tabs and real native Android widget placement.
- Prefer Android/web/Jest checks when iOS cannot be verified locally.
- Avoid broad app rewrites while platform verification is limited.

## Known Blockers

- No Android emulator/device was connected during the latest check (`adb devices` returned empty), so install/runtime QA is still pending.
- EAS production environment currently has no Supabase public variables, so a submitted build would not be runtime-ready until those are set.
- Google Play service account credentials are not configured in the repo and must not be committed.
- iOS verification may require macOS.

## Last Verified

- 2026-05-02: EAS project linked; `npx expo-doctor` passed 17/17, `npm run typecheck` passed, `npm test -- --runInBand` passed 181 tests, `npx expo prebuild --platform android --no-install` completed, `android/gradlew.bat -p android :app:assembleDebug --console=plain` built successfully, and `android/gradlew.bat -p android :app:bundleRelease --console=plain` built a release AAB successfully after adding missing font assets.
- 2026-05-03: Beep/Blink domain/presentation and Today/Reply Room preview work added; `npm run typecheck` passed, `npm test -- --runInBand` passed 198 tests, and `npx expo-doctor` passed 17/17. `npm run supabase:lint` could not rerun because Docker Desktop was not running after the local stack had been stopped.
- 2026-05-03: Remote Supabase `beep-get-prod` migration push succeeded after relinking with the DB password and IPv4 pooler path; `supabase db lint --linked` reported no schema errors and remote table stats showed the v2 Beep/Blink tables.
- 2026-05-02: PR #6 merged after CI `validate` passed; `EXPO_PUBLIC_UI_PREVIEW=1` Android release installed on `emulator-5554`, UI preview entered successfully, and screenshot QA confirmed the Swiss Paper home preview is foreground at `C:/Users/slime/AppData/Local/Temp/beep-get-swiss-home-v3.png`.
- 2026-04-30: `npm test -- --runInBand` passed.
- Known gap: Real Android launcher widget placement and iOS verification were not performed.

## Related Vault Notes

- `C:/Users/slime/claude-projects/Obsidian Vault/Projects/beep-get/`

## Handoff Rule

When work changes navigation, native modules, Supabase behavior, visual system, or platform support, update this file with the new status and next concrete action.
