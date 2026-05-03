# Project State

## Purpose

Beep-get Expo/React Native app with product/visual direction captured in `.brand.json` and mockup files.

## Current Status

- Active Git repo with Expo, Supabase, Jest, and React Native dependencies.
- AI harness files are committed and pushed on `master`.
- Android prebuild and debug Gradle assemble are working locally after SDK 54 dependency alignment and widget module fixes.
- EAS project is linked as `@hypeboyo/beep-get` with project ID `2c41736e-942b-4593-8fcd-53373d03ee53`.
- Android release configuration now targets package `com.hypeboyo.beepget` and Google Play internal testing.
- Backend-free UI preview mode is available behind `EXPO_PUBLIC_UI_PREVIEW=1` for emulator review before Supabase/OAuth are configured.
- Home preview now follows the saved Swiss Paper widget mockup direction instead of the old generic LCD/neumorphic card layout.
- Supabase CLI is installed as a project dev dependency; local Supabase config is initialized for the clean Beep/Blink backend plan.
- Active Supabase migration direction is now v2 `profiles/signals/signal_media/usage_daily`; the old `users/messages/friendships` migrations are archived and should not be pushed to a new project.
- Supabase project `beep-get-prod` is linked locally with project ref `dyuzxilukcwiavtvbmci`; v2 Beep/Blink migration has been pushed to the remote database through the IPv4 pooler path.
- Local `.env` is configured with the remote Supabase URL and public/publishable app key; secret DB password remains gitignored under `supabase/.temp/`.
- Beep/Blink domain limits and presentation payload helpers are implemented with tests, including the 2-second Blink cap and widget-safe teaser payloads.
- Home preview now acts as a Today/Reply Room entry point for the Beep/Blink loop, and `ReplyRoom` is available as a modal/deep-link target.
- Runtime services now target the v2 Supabase schema: auth uses `profiles/create_profile`, friends use `relationships/find_profile_by_beep_id`, Beeps use `signals/send_beep`, dictionary entries use `code_presets`, skin/status updates use `profiles`, and Realtime listens on `signals`/`profiles`.
- Legacy UI shapes are preserved through adapters so existing screens and widget sync can keep using `from_user`, `number_code`, `is_read`, and `user_id` while the backend stores `sender_id`, `code`, `status`, and `owner_id`.
- Blink media storage now has a test-covered adapter boundary that validates 2-second/750KB uploads, creates `create_blink_metadata` rows, returns signed Supabase upload targets, and issues short-lived playback references without permanent public URLs.
- App-side usage guardrails now have a pure evaluator for daily Beep/Blink limits and per-relationship Blink cooldowns before the UI calls paid/storage-heavy paths.
- Blink send now has an app-side capture/send path: `SendScreen` can switch between Beep and Blink, records a 2-second muted camera clip through `expo-camera`, uploads through the signed Supabase Storage target, and finalizes media with `finalize_blink_upload`.
- The `finalize_blink_upload` RPC has been pushed to `beep-get-prod`; it only lets the authenticated sender mark their own pending Blink media as `uploaded`.
- The approved UX direction is now the Swiss Paper "slip" model: widget as `Incoming Slip`, Send screen as `Outgoing Slip`, and Reply Room as `Signal Detail + Quick Reply`.
- `DESIGN.md` is now the implementation source of truth for the app UI redesign; the downloaded starter kit has been integrated into the app-level visual system, components, and mock-data screens without native widget implementation.
- Main app navigation now opens the slip-first primary tabs: Today, People, Send, Studio, and Logs, with Reply Room and widget states available as modal/deep-link targets.
- Android emulator visual QA refined the slip UI shell: pager screens now respect the status-bar safe area, primary tabs stay to five one-line labels, and the Send Beep/Blink switcher lives inside the pager surface.
- Base stage/shell colors are neutral black/charcoal; avoid warm near-black values such as `#11110F` because they read as mugwort/olive on Android emulator screenshots.
- Login now uses a frameless cream paper-slip surface with the approved concept-1 Beepy pager mascot; the production mascot is a handdrawn PNG asset at `assets/brand/beepy-handdrawn.png`, not the earlier clean code-vector drawing. Do not add a literal phone/iPhone frame inside the app UI.
- Runtime app screens now use a frameless cream `AppSurface` instead of the black `PagerFrame` hardware shell; `PagerFrame` should stay reserved for non-runtime mockup/widget demonstration contexts.
- Platform auth CTAs are split by runtime platform: iOS uses Apple, Android/web/other platforms use Google. Android UI preview should show Google plus UI Preview only.
- Direct widget preset replies are now considered required product behavior for the strong widget loop; implementation should start with latest-signal preset Beep replies, then add idempotency before native direct-send actions ship.
- Android widget action URLs now cover open reply room, confirm, save, and preset quick reply; the app handles these deep links and preview mode syncs native widget sample data after entering UI Preview.
- Android Glance widgets are moving from the old green LCD look toward the Swiss Paper slip style; the medium widget includes `OK / 8282 / OPEN` action chips for home-screen QA.
- Android Glance widget colors must use Compose `Color(...)` values inside `ColorProvider`; Android `Color.parseColor(...)` ints are treated as resource IDs by RemoteViews hosts and can show `Can't load widget`.
- Android small Glance widget now renders latest Blink payloads as `Incoming Blink` with a 3-frame teaser strip (`01 02 03`) and updates through `GlanceAppWidget.updateAll(...)` instead of shell-blocked/stale app-widget broadcasts.
- macOS/iOS availability may block iOS verification.

## Next Work Queue

- Perform real Android medium-widget placement/action-chip QA after the small widget smoke; see `docs/plans/2026-05-03-widget-quick-reply-actions.md` for the manual launcher flow.
- Add production EAS env values for `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
- Add Google/Apple OAuth provider settings in Supabase for `beep-get-prod`.
- Confirm real authenticated Android camera/file upload against Supabase Storage with a non-preview sender/receiver pair.
- Add real thumbnail/3-frame image generation path for Blink teaser payloads; current Android widget strip is a safe textual film-strip preview until real frame URIs are available.
- Implement the approved slip UX spec in `docs/superpowers/specs/2026-05-03-slip-reply-widget-design.md`: redesign Send, redesign Reply Room, add app-side quick replies, then add idempotent widget direct reply.
- Decide whether v2 should reintroduce collection/season/icon rewards; production collection/season services currently return empty safe fallbacks because those tables are intentionally absent from the v2 migration.
- Configure Google Play Console/service account, then run production EAS build and submit.
- Keep visual changes aligned with `.brand.json` and existing mockups.
- Continue UI/UX review from the current `EXPO_PUBLIC_UI_PREVIEW=1` emulator build, especially non-home tabs and real native Android widget placement.
- Connect the integrated `DESIGN.md` screens to live v2 Supabase data and existing Beep/Blink services after visual approval; current starter screens intentionally use mock signals.
- Add native widget direct-send actions only after app-side quick replies, native auth/session sharing, and server-side idempotency are implemented.
- Prefer Android/web/Jest checks when iOS cannot be verified locally.
- Avoid broad app rewrites while platform verification is limited.

## Known Blockers

- Android emulator QA is available, but Pixel Launcher widget placement is manual because `adb shell cmd appwidget` reported `No shell command implementation.`
- EAS production environment currently has no Supabase public variables, so a submitted build would not be runtime-ready until those are set.
- Google Play service account credentials are not configured in the repo and must not be committed.
- Collection/season/icon rewards are preview-only until a v2 rewards schema is designed.
- Status labels are UI-only for now; v2 persists `profiles.status_icon`, not separate `status_broadcasts.label`.
- Blink upload adapter and SendScreen preview UI are verified, but real authenticated Android camera/file upload and Supabase Storage policy behavior still need runtime QA.
- iOS verification may require macOS.

## Last Verified

- 2026-05-02: EAS project linked; `npx expo-doctor` passed 17/17, `npm run typecheck` passed, `npm test -- --runInBand` passed 181 tests, `npx expo prebuild --platform android --no-install` completed, `android/gradlew.bat -p android :app:assembleDebug --console=plain` built successfully, and `android/gradlew.bat -p android :app:bundleRelease --console=plain` built a release AAB successfully after adding missing font assets.
- 2026-05-03: Beep/Blink domain/presentation and Today/Reply Room preview work added; `npm run typecheck` passed, `npm test -- --runInBand` passed 198 tests, and `npx expo-doctor` passed 17/17. `npm run supabase:lint` could not rerun because Docker Desktop was not running after the local stack had been stopped.
- 2026-05-03: Remote Supabase `beep-get-prod` migration push succeeded after relinking with the DB password and IPv4 pooler path; `supabase db lint --linked` reported no schema errors and remote table stats showed the v2 Beep/Blink tables.
- 2026-05-03: App service layer was rewired to the v2 Supabase schema; `npm run typecheck` passed, `npm test -- --runInBand` passed 169 tests, `npx expo-doctor` passed 17/17, and `supabase db lint --linked` reported no schema errors.
- 2026-05-03: Blink media storage adapter and usage limit evaluator were added; `npm run typecheck` passed, `npm test -- --runInBand` passed 187 tests, `npx expo-doctor` passed 17/17, and `supabase db lint --linked` reported no schema errors after linking the worktree to `beep-get-prod`.
- 2026-05-03: Blink Send UI and upload-finalize path added; `npm run typecheck` passed, `npm test -- --runInBand` passed 194 tests, `npx expo-doctor` passed 17/17, `supabase db push --dry-run --password ...` reported only `20260503050000_finalize_blink_upload.sql`, `supabase db push --password ...` applied it, a follow-up dry-run reported the remote database up to date, and `supabase db lint --linked` found no schema errors.
- 2026-05-03: Android runtime smoke passed on `emulator-5554`: `npx expo prebuild --platform android --no-install` completed, `:app:assembleDebug` passed from short path `C:/bg-blink`, x86_64 debug APK installed after emulator space cleanup, Metro bundled successfully with `EXPO_PUBLIC_UI_PREVIEW=1`, UI Preview entered Home, and the Send screen showed the Beep/Blink switch plus Blink capture panel. Screenshots: `C:/Users/slime/AppData/Local/Temp/beep-get-ui-preview-home.png`, `C:/Users/slime/AppData/Local/Temp/beep-get-blink-send-screen.png`.
- 2026-05-03: Downloaded `DESIGN.md` UI starter integrated into the existing Expo app navigation as Today/People/Send/Studio/Logs/Widget tabs plus slip Reply Room modal; `npx expo-doctor` passed 17/17, `npm run typecheck` passed, and `npm test -- --runInBand` passed 194 tests.
- 2026-05-03: Android emulator visual QA for the integrated slip UI passed after safe-area/tab/Send switcher polish; screenshots saved at `C:/Users/slime/AppData/Local/Temp/beep-get-slip-ui-polished-today.png`, `C:/Users/slime/AppData/Local/Temp/beep-get-slip-ui-polished-send-v2.png`, and `C:/Users/slime/AppData/Local/Temp/beep-get-slip-ui-polished-studio.png`.
- 2026-05-03: Shell color cast fix verified on `emulator-5554`; `src/design/tokens.ts` stage/shell colors were neutralized, screenshot saved at `C:/Users/slime/AppData/Local/Temp/beep-get-neutral-shell-today.png`, `npm run typecheck` passed, `npm test -- --runInBand` passed 194 tests, and `npx expo-doctor` passed 17/17.
- 2026-05-03: Login mascot/platform-auth pass verified on `emulator-5554`; Android screenshot saved at `C:/Users/slime/AppData/Local/Temp/beep-get-login-mascot-android-v2.png`, visual verdict scored 92/pass in `.omx/state/login-mascot/ralph-progress.json`, `npm run typecheck` passed, `npm test -- --runInBand` passed 197 tests, and `npx --yes expo-doctor` passed 17/17. iOS Apple-only runtime verification is still pending on macOS.
- 2026-05-03: Beepy mascot was revised from a clean code-vector drawing to a handdrawn ink-textured PNG asset to match mockup A more closely; Android screenshot saved at `C:/Users/slime/AppData/Local/Temp/beep-get-handdrawn-beepy-login-android.png`, and local visual verdict scored 94/pass in `.omx/state/login-mascot/ralph-progress.json`.
- 2026-05-03: Runtime app screens were moved off the black `PagerFrame` hardware shell onto a cream `AppSurface`; Android UI preview screenshots saved at `C:/Users/slime/AppData/Local/Temp/beep-get-frameless-today-v3.png` and `C:/Users/slime/AppData/Local/Temp/beep-get-frameless-send.png`, with local visual verdict scored 94/pass in `.omx/state/remove-app-pager-frame/ralph-progress.json`.
- 2026-05-03: Widget quick-reply app path and Android Glance slip styling added; `npm run typecheck` passed, `npm test -- --runInBand` passed 204 tests, `android/gradlew.bat -p android :app:assembleDebug --console=plain --no-daemon` passed, widget providers were visible in `dumpsys appwidget`, preview widget shared preferences included `beepget://signal/preview-message-1/quick-reply/8282`, and that deep link smoked on `emulator-5554` without AndroidRuntime crashes. Actual launcher widget placement still needs manual QA because programmatic widget binding was unavailable on the emulator.
- 2026-05-03: Actual Android launcher small-widget placement smoke passed after fixing Glance `ColorProvider` values to use Compose colors; x86_64 debug APK installed on `emulator-5554`, UI Preview synced widget data, Pixel Launcher placed the `BeepWidgetReceiver`, screenshot saved at `C:/Users/slime/AppData/Local/Temp/beep-get-widget-visible-fixed.png`, and logcat no longer reported the previous `Resource ID #0xfff4efe5` RemoteViews color failure.
- 2026-05-04: Android launcher small-widget Blink teaser strip verified on `emulator-5554`; `npm run typecheck` passed, `npm test -- --runInBand` passed 205 tests, `npx --yes expo-doctor` passed 17/17, `:app:assembleDebug -PreactNativeArchitectures=x86_64` passed, UI Preview synced `kind:"blink"` with 3 strip frame URIs, Pixel Launcher showed `Incoming Blink` plus `01   02   03`, screenshot saved at `C:/Users/slime/AppData/Local/Temp/beep-get-widget-three-frame-strip.png`, and post-sync logcat showed no Glance/RemoteViews truncation errors.
- 2026-05-02: PR #6 merged after CI `validate` passed; `EXPO_PUBLIC_UI_PREVIEW=1` Android release installed on `emulator-5554`, UI preview entered successfully, and screenshot QA confirmed the Swiss Paper home preview is foreground at `C:/Users/slime/AppData/Local/Temp/beep-get-swiss-home-v3.png`.
- 2026-04-30: `npm test -- --runInBand` passed.
- Known gap: Medium Android launcher widget action-chip placement and iOS verification were not performed.

## Related Vault Notes

- `C:/Users/slime/claude-projects/Obsidian Vault/Projects/beep-get/`

## Handoff Rule

When work changes navigation, native modules, Supabase behavior, visual system, or platform support, update this file with the new status and next concrete action.
