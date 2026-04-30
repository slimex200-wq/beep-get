# Checks

## Standard Commands

```bash
npm test
npm run android
npm run web
```

## Risk-Based Checks

- Native/module changes: prefer Android verification in this environment; mark iOS as not tested unless a Mac is available.
- Visual changes: compare against `.brand.json`, `mockup.html`, or `font-compare.html`.
- Supabase changes: verify environment assumptions and avoid committing secrets.

## Before Delivery

- Report which checks ran.
- Report platform gaps clearly, especially iOS.
- Do not claim mobile parity when only web/Jest was checked.
