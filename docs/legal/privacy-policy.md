# Beep Get Privacy Policy

Last updated: 2026-06-01

Beep Get is a private pager app for close friends. This policy describes the app data handled by the iOS-first release.

## Data We Handle

- Account data: authentication identifier, nickname, Beep ID, avatar selection, and profile status.
- Relationship data: close-friend connections and invite/share metadata.
- Signal data: Beeps, Blinks, reply slots, code presets, timestamps, delivery/read state, and saved signal state.
- Media data: Blink videos and generated preview frames that you choose to capture and send.
- Device features: camera for Blink capture, notifications for signal delivery, contacts only when you choose contact-related flows, and app/widget state needed for the home-screen widget. The first iOS release reads contacts locally and does not upload contact phone numbers for matching.
- Purchase data: identity-pack entitlement records and App Store transaction identifiers when paid skin packs are enabled.
- Account-deletion support data: encrypted Sign in with Apple refresh-token material used only to disconnect Apple authorization during account deletion.

## How We Use Data

We use this data to create your account, connect close friends, send and receive Beeps/Blinks, render widgets, deliver notifications, support account deletion, revoke Sign in with Apple authorization during deletion, and verify paid identity-pack purchases when the store is enabled.

## Sharing

We do not sell personal data. Data is shared with service providers needed to run the app, including Supabase for backend/auth/storage, Apple for Sign in with Apple and App Store purchases, and push-notification infrastructure for delivery.

## Retention And Deletion

Account deletion can be started in the app from Account settings. Deletion removes your profile, relationships, Beeps, Blinks, private Blink media, encrypted Apple revocation token material, and the Supabase Auth user. A hashed deletion audit record may be retained to verify completion without keeping the raw user ID.

## Contact

For privacy or deletion requests, use the account deletion link configured in the production app or contact the app owner through the App Store listing.
