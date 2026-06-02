# iOS App Privacy Label Draft

Last updated: 2026-06-01

This is a draft input sheet for App Store Connect App Privacy. The final answers must be confirmed by the app owner against the production backend, any analytics/crash tooling added later, and third-party SDK behavior.

Official references:

- https://developer.apple.com/app-store/app-privacy-details/
- https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy/
- https://developer.apple.com/documentation/BundleResources/describing-use-of-required-reason-api

## Product Position

Beep Get is a private pager for close friends. The first iOS review build should keep secondary OAuth and IAP disabled unless those provider/store paths have passed real-device QA.

## Data Types To Declare

| Apple category | Beep Get data | Linked to user | Used for tracking | Purpose |
| --- | --- | --- | --- | --- |
| Contact Info / Name | Apple full name if supplied, nickname chosen by user | Yes | No | App functionality, account setup |
| Contact Info / Email Address | Sign in with Apple email or relay email via Supabase Auth | Yes | No | Authentication, account recovery/provider identity |
| User ID | Supabase Auth user ID, Beep ID, and encrypted Sign in with Apple refresh-token material | Yes | No | App functionality, friend discovery, account deletion, Apple authorization revocation |
| User Content / Photos or Videos | Blink videos and generated teaser frames the user sends | Yes | No | App functionality |
| User Content / Other User Content | Beep/Blink code tokens, memos, reply slots, saved signal state | Yes | No | App functionality |
| Contacts | Phone numbers read locally after contact permission | No, unless future upload/match is enabled | No | Friend discovery prompt only; current app code returns no uploaded contact matches |
| Purchases | Identity-pack entitlement and App Store transaction IDs when IAP is enabled | Yes | No | Purchase validation, app functionality |
| Identifiers / Device ID | Expo push token | Yes | No | Push notifications |
| Diagnostics | None intentionally collected by repo code | No | No | Leave undeclared unless a crash/analytics SDK is added |

## Tracking

Current repo code has no advertising SDK and no cross-app tracking purpose. Answer tracking as No unless a future dependency or data use changes this.

## Privacy Manifest

The repo declares required-reason API use for App Group `UserDefaults` in `app.json`, `targets/BeepWidgetExtension/PrivacyInfo.xcprivacy`, and `targets/BeepNotificationService/PrivacyInfo.xcprivacy`:

- API category: `NSPrivacyAccessedAPICategoryUserDefaults`
- Reason: `1C8F.1`
- Tracking: No

This covers Beep Get's own widget/notification App Group storage. Before submission, verify any third-party SDK privacy manifests and signatures in the final archive.

## Permission Prompts

- Camera: records 2-second Blink messages.
- Microphone: not used for the first iOS review build; Blink is muted and `expo-camera` microphone permission is disabled.
- Contacts: read contacts locally to help find friends; current implementation does not upload contact phone numbers to Supabase.
- Notifications: delivers Beep/Blink signal updates.

## Required Owner Confirmation

- Confirm whether Supabase/Auth logs or any added analytics/crash provider change the privacy label.
- Confirm the production Sign in with Apple deletion flow stores only encrypted revocation token material and removes it during deletion.
- Confirm production contact-discovery behavior before declaring Contacts collection. Current app code reads contacts locally and returns no remote matches; if remote matching is added later, update this privacy label and release gate first.
- Confirm whether IAP is enabled for the submitted build. If `EXPO_PUBLIC_ENABLE_IAP_STORE=0`, purchases should not appear in user-facing flows, but App Store metadata may still describe future IAP products if they are submitted with the build.
- Confirm no tracking or ads SDKs were added after this document.
