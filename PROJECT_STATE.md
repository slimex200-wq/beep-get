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
- macOS/iOS availability may block iOS verification.

## Next Work Queue

- Perform real Android home-screen widget placement QA after the preview app review.
- Add production EAS env values for `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
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
- 2026-05-02: PR #6 merged after CI `validate` passed; `EXPO_PUBLIC_UI_PREVIEW=1` Android release installed on `emulator-5554`, UI preview entered successfully, and screenshot QA confirmed the Swiss Paper home preview is foreground at `C:/Users/slime/AppData/Local/Temp/beep-get-swiss-home-v3.png`.
- 2026-04-30: `npm test -- --runInBand` passed.
- Known gap: Real Android launcher widget placement and iOS verification were not performed.

## Related Vault Notes

- `C:/Users/slime/claude-projects/Obsidian Vault/Projects/beep-get/`

## Handoff Rule

When work changes navigation, native modules, Supabase behavior, visual system, or platform support, update this file with the new status and next concrete action.
