# Beep Get Account Deletion

Last updated: 2026-06-01

Beep Get supports in-app account deletion from Account settings.

## In-App Deletion

1. Open Beep Get.
2. Sign in to the account you want to delete.
3. Open My, then Account settings.
4. Tap Delete Account.
5. Confirm the deletion prompt.

This removes your profile, Beep ID, relationships, Beeps, Blinks, private Blink media, encrypted Sign in with Apple revocation token material, and Supabase Auth user. This cannot be undone.

The in-app flow sends an authenticated deletion request, confirms intent before deletion, and attempts Sign in with Apple token revocation for Apple accounts. Test this only with disposable accounts.

## Web Request

If you cannot access the app, use the public account deletion URL configured for the production release or contact the app owner through the App Store listing. Include the Beep ID or sign-in email for the account, but do not send passwords or private keys.

## Retention

After deletion, Beep Get may retain a hashed audit record that proves a deletion request was completed without retaining the raw user ID.
