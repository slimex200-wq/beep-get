# Beep Get

Expo / React Native app with product and visual direction captured in `.brand.json` and existing mockups.

This repository should be treated as a mobile product, not a generic Expo starter. Platform verification matters, especially because iOS checks may be blocked without macOS.

## Stack

- Expo
- React Native
- TypeScript
- React Navigation
- Zustand
- Supabase
- Jest

## AI Harness

Before asking Claude, Codex, or another coding agent to work here, read:

- `AGENTS.md` — repository rules for AI agents
- `PROJECT_STATE.md` — current status and next work
- `CHECKS.md` — test and platform verification expectations
- `DECISIONS.md` — platform and product decisions
- `.brand.json` — product/visual direction

## Commands

```bash
npm install
npm test
npm run android
npm run web
npm run ios
```

## Product Context

- `.brand.json` contains the product/visual direction.
- `mockup.html` and `font-compare.html` are useful visual references.
- iOS verification may require macOS; do not claim iOS parity unless it was actually checked.

## Verification

```bash
npm test
```

Use Android or web checks when iOS is not available, and record the platform gap explicitly.
