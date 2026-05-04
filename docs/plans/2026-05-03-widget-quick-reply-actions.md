# Widget Quick Reply Actions

## Decision

Widget preset replies should be available from the native widget loop, but the first safe slice routes widget taps through app-owned deep links instead of doing direct native background Supabase sends.

This keeps the required product behavior visible and testable while avoiding a premature native auth/session/retry design.

## Scope

- Added widget action URLs for open reply room, confirm, save, and preset quick reply.
- Added app-side deep-link handling for `beepget://signal/:id/confirm`, `save`, and `quick-reply/:code`.
- Added app-side duplicate-tap protection for quick replies.
- Added server-side idempotency through `reply_with_preset_once(p_signal_id, p_code, p_client_action_id)` so duplicate app/widget taps cannot create duplicate Beeps.
- Updated preview-mode widget sync so the native Android widget has sample data after entering UI Preview.
- Restyled the Android Glance widget from green LCD toward the Swiss Paper slip direction.
- Added medium-widget action chips: `OK`, first preset code such as `8282`, and `OPEN`.

## Widget Appearance QA

The app can show widget states inside the Studio/Widget States screens, but the real home-screen widget must be placed from the Android launcher.

Local Android QA path:

```powershell
npm run typecheck
npm test -- --runInBand
npx --yes expo-doctor
android\gradlew.bat -p android :app:assembleDebug --console=plain --no-daemon

$adb = "C:\Users\slime\AppData\Local\Android\Sdk\platform-tools\adb.exe"
& $adb -s emulator-5554 install -r .\android\app\build\outputs\apk\debug\app-debug.apk
```

Then start the preview app with `EXPO_PUBLIC_UI_PREVIEW=1`, enter UI Preview, and place the widget manually:

1. Long-press an empty area on the Android home screen.
2. Choose `Widgets`.
3. Find `Beep Get`.
4. Drag the medium widget to the home screen.
5. It should render the latest sample signal, red dot, paper slip styling, and `OK / 8282 / OPEN` actions.

Useful evidence commands:

```powershell
$adb = "C:\Users\slime\AppData\Local\Android\Sdk\platform-tools\adb.exe"
& $adb -s emulator-5554 shell dumpsys appwidget | Select-String -Pattern "beep|get|hypeboyo|BeepWidget" -Context 0,2
& $adb -s emulator-5554 shell run-as com.hypeboyo.beepget cat shared_prefs/beep_widget_data.xml
& $adb -s emulator-5554 exec-out screencap -p > C:\Users\slime\AppData\Local\Temp\beep-get-android-widget.png
```

## Current Limitation

The Android emulator used for this pass did not support programmatic widget binding through `adb shell cmd appwidget`; it returned `No shell command implementation.` Because of that, launcher placement remains a manual QA step.

Native background direct-send from the widget is intentionally deferred until shared native auth/session handling and retry UX are deliberately designed. Server-side idempotency now exists, and the current safe path is app-owned deep links backed by that RPC.

## Verification

- `npm run typecheck`
- `npm test -- --runInBand`
- `npx --yes expo-doctor`
- `android\gradlew.bat -p android :app:assembleDebug --console=plain --no-daemon`
- `supabase db lint --linked`
- `supabase db push --dry-run --linked`
- Android provider registration check through `dumpsys appwidget`
- Android preview shared preferences check through `run-as com.hypeboyo.beepget cat shared_prefs/beep_widget_data.xml`
- Android quick-reply deep-link smoke with `beepget://signal/preview-message-1/quick-reply/8282`

## Remaining Gaps

- Medium Android launcher widget placement and action-chip QA still needs a real manual launcher pass; small-widget placement has been verified in later passes.
- iOS WidgetKit implementation and verification are not covered by this Windows pass.
- True one-tap background sends should wait for native auth/session sharing and retry UX; DB idempotency is now in place.
