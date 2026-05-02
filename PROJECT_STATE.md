# Project State

## Purpose

Beep-get Expo/React Native app with product/visual direction captured in `.brand.json` and mockup files.

## Current Status

- Active Git repo with Expo, Supabase, Jest, and React Native dependencies.
- AI harness files are committed and pushed on `master`.
- Android prebuild and debug Gradle assemble are working locally after SDK 54 dependency alignment and widget module fixes.
- macOS/iOS availability may block iOS verification.

## Next Work Queue

- Connect/start an Android emulator, then run `npm run android` and perform widget/app runtime QA.
- Keep visual changes aligned with `.brand.json` and existing mockups.
- Prefer Android/web/Jest checks when iOS cannot be verified locally.
- Avoid broad app rewrites while platform verification is limited.

## Known Blockers

- No Android emulator/device was connected during the latest check (`adb devices` returned empty), so install/runtime QA is still pending.
- iOS verification may require macOS.

## Last Verified

- 2026-05-02: `npx expo-doctor` passed 17/17, `npm test -- --runInBand` passed 181 tests, `npx expo prebuild --platform android --no-install` completed, and `android/gradlew.bat -p android :app:assembleDebug --console=plain` built successfully.
- 2026-04-30: `npm test -- --runInBand` passed.
- Known gap: Android emulator install/runtime QA and iOS verification were not performed.

## Related Vault Notes

- `C:/Users/slime/claude-projects/Obsidian Vault/Projects/beep-get/`

## Handoff Rule

When work changes navigation, native modules, Supabase behavior, visual system, or platform support, update this file with the new status and next concrete action.
