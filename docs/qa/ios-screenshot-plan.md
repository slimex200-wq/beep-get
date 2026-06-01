# iOS Screenshot Plan

Last updated: 2026-06-01

Official reference: https://developer.apple.com/help/app-store-connect/reference/screenshot-specifications

App Store Connect accepts one to ten screenshots per required device display. Beep Get currently sets `ios.supportsTablet=false`, so the first submission should prepare iPhone screenshots. Confirm the final build metadata in App Store Connect before upload.

## Required Capture Set

Capture at least these five portrait screenshots from a clean TestFlight build with test data only:

1. Auth / Sign in with Apple screen.
2. Today screen showing an incoming Beep or Blink.
3. Send screen showing Beep and Blink send choices.
4. Friends screen showing close-friend Beep ID flow.
5. My screen showing Skin Packs preview with paid packs locked/preview-only.

Optional, if the final screenshot set has room:

- Widget Layouts small widget preview.
- Widget Layouts medium Blink preview.
- Account settings showing delete account access.

## Privacy / Review Safety

- Use fictional Beep IDs, names, avatars, and Blink media.
- Do not show real contacts, real phone numbers, real email addresses, real payment details, or production secrets.
- If `EXPO_PUBLIC_ENABLE_IAP_STORE=0`, do not show prices or purchase promises in screenshots.
- If IAP is enabled, screenshots must match the actual available products and review notes.

## Upload Checklist

- Export `.png`, `.jpg`, or `.jpeg`.
- Keep each screenshot at an Apple-accepted size for the selected iPhone display class.
- Upload in product-story order: login/private pager, receive, send, friends, personalization.
- Re-run screenshots after any UI, theme, skin, or onboarding copy change.
