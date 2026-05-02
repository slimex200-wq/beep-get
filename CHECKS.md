# Checks

## Standard Commands

```bash
npx expo-doctor
npm test
npm run android
npm run web
```

## CI Gate

Pull requests into `master` must pass the GitHub Actions `validate` job before merge. The CI baseline is:

```bash
npm ci
npx --yes expo-doctor
npm test -- --runInBand
npx expo prebuild --platform android --no-install
cd android && ./gradlew :app:assembleDebug --console=plain --no-daemon
```

## Risk-Based Checks

- Native/module changes: prefer Android verification in this environment; mark iOS as not tested unless a Mac is available.
- Visual changes: compare against `.brand.json`, `mockup.html`, or `font-compare.html`.
- Supabase changes: verify environment assumptions and avoid committing secrets.

## Before Delivery

- Report which checks ran.
- Report platform gaps clearly, especially iOS.
- Do not claim mobile parity when only web/Jest was checked.
- Do not merge or direct-push to `master` until PR CI is green.
