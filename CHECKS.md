# Checks

## Standard Commands

```bash
npx expo-doctor
npm run typecheck
npm test
npm run supabase:lint
npm run android
npm run web
```

## CI Gate

Pull requests into `master` must pass the GitHub Actions `validate` job before merge. The CI baseline is:

```bash
npm ci
npx --yes expo-doctor
npm run typecheck
npm test -- --runInBand
npx expo prebuild --platform android --no-install
cd android && ./gradlew :app:assembleDebug --console=plain --no-daemon
```

## Release Commands

```bash
npm run eas:info
npm run build:android:preview
npm run build:android:production
npm run submit:android:production
```

## Risk-Based Checks

- Native/module changes: prefer Android verification in this environment; mark iOS as not tested unless a Mac is available.
- Visual changes: compare against `.brand.json`, `mockup.html`, or `font-compare.html`.
- Supabase changes: verify environment assumptions and avoid committing secrets.
- Supabase project changes: use the project-local CLI (`npm exec supabase -- ...`) and run `npm run supabase:dry-run` after linking a remote project.

## Before Delivery

- Report which checks ran.
- Report platform gaps clearly, especially iOS.
- Do not claim mobile parity when only web/Jest was checked.
- Do not merge or direct-push to `master` until PR CI is green.
