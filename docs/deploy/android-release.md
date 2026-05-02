# Android Release Runbook

## Current Target

- Expo project: `@hypeboyo/beep-get`
- EAS project ID: `2c41736e-942b-4593-8fcd-53373d03ee53`
- Android package: `com.hypeboyo.beepget`
- Version source: EAS remote app versioning
- First store track: Google Play internal testing

## Required Before Store Submission

- Add `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` to the EAS `production` environment.
- Configure Google Play Console for `com.hypeboyo.beepget`.
- Provide a Google Play service account key locally or through EAS credentials; do not commit the key.
- Confirm app icon, screenshots, short description, full description, privacy policy, and data safety answers.

## EAS Environment Setup

Use local values or a secure shell prompt. Do not paste secrets into commits.

```bash
npx eas-cli@latest env:create production --name EXPO_PUBLIC_SUPABASE_URL --value "<supabase-url>" --visibility plaintext --non-interactive
npx eas-cli@latest env:create production --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "<supabase-anon-key>" --visibility sensitive --non-interactive
```

Repeat for `preview` if internal QA builds should point at the same backend.

## Build

```bash
npm run build:android:preview
npm run build:android:production
```

Use `preview` for installable QA APKs and `production` for Play Store AABs.

Local `android/gradlew.bat -p android :app:bundleRelease` is a compile proof only. Use EAS production builds for store-ready signing.

## Submit

```bash
npm run submit:android:production
```

The production submit profile targets the Google Play `internal` track.

## Verification Baseline

```bash
npx expo-doctor
npm run typecheck
npm test -- --runInBand
npx expo prebuild --platform android --no-install
android/gradlew.bat -p android :app:assembleDebug --console=plain
```

## Known Platform Gap

iOS config now has a bundle identifier, but native iOS build and App Store submission still require macOS/Xcode plus Apple credentials.
