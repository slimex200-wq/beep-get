# iOS App Store Metadata Draft

Last updated: 2026-06-01

This is the first-submission metadata draft for App Store Connect. Final values must be confirmed by the app owner in App Store Connect, especially legal entity, content rights, age rating, DSA trader status, and hosted URLs.

Official references:

- https://developer.apple.com/help/app-store-connect/reference/app-information
- https://developer.apple.com/help/app-store-connect/reference/app-information/platform-version-information
- https://developer.apple.com/help/app-store-connect/reference/app-information/app-privacy/

## App Information

| Field | Draft value |
| --- | --- |
| Name | Beep Get |
| Subtitle | Private pager for friends |
| Primary language | English (U.S.) |
| Bundle ID | com.hypeboyo.beepget |
| SKU | beep-get-ios |
| Apple ID | 6769032098 |
| Primary category | Social Networking |
| Secondary category | Lifestyle |
| Privacy Policy URL | Publish `docs/legal/privacy-policy.md` and enter the hosted HTTPS URL |
| Support URL | Publish `docs/legal/support.md` and enter the hosted HTTPS URL |
| User Privacy Choices URL | Publish `docs/legal/account-deletion.md` and enter the hosted HTTPS URL if used |
| Copyright | 2026 Hypeboyo, owner to confirm legal display name |
| Content rights | Owner must confirm rights to Beepy, Blink, icon, font, skin-pack, and screenshot assets |
| Age rating | Complete App Store Connect questionnaire; social/user-generated media may affect final rating |
| DSA trader status | Owner must answer in App Store Connect |

## Version Metadata

| Field | Draft value |
| --- | --- |
| Promotional text | A tiny private signal for the people you actually answer. |
| Keywords | pager,blink,friends,private,widget,signal,close,camera,notify |
| Review notes | Use `docs/deploy/ios-review-notes-template.md` |
| Screenshots | Use `docs/qa/ios-screenshot-plan.md` |
| App privacy | Use `docs/deploy/ios-app-privacy-label-draft.md` |

## Description Draft

```text
Beep Get is a private pager for close friends.

Send a simple Beep code when you want someone's attention, or send a muted 2-second Blink with a three-frame preview when the moment needs a tiny visual signal. The app is built around close-friend delivery, quick replies, and home-screen widgets that make the signal visible without turning it into a public feed.

What you can do:
- Sign in with Apple.
- Create a Beep ID and connect with close friends.
- Send and receive Beep codes.
- Capture short muted Blink messages with camera permission.
- Save useful signals and quick replies.
- Add small and medium widgets for glanceable Beep/Blink updates.
- Preview identity skin packs for the app and widget surfaces.

For the first iOS review build, secondary OAuth providers and paid identity-pack purchases should remain disabled unless the matching provider and StoreKit paths have passed real-device QA.
```

## Submission Notes

- Do not mention unavailable paid packs, prices, or purchase promises if `EXPO_PUBLIC_ENABLE_IAP_STORE=0`.
- Do not upload screenshots that show real contacts, real emails, production secrets, or real payment information.
- Blink is intended to be video-only and muted; microphone permission is disabled in the Expo camera plugin.
- If IAP is enabled, App Store product metadata and review screenshots must match the submitted build.
