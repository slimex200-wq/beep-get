# Design

## Source of truth

- Status: Active
- Last refreshed: 2026-05-31
- Primary product surfaces: Authenticated mobile tabs (`Today`, `Send`, `Friends`, `My`), Blink preview, Send Beep/Blink modal flows, widget configuration surfaces, skin pack previews.
- Evidence reviewed:
  - `.lazyweb/quick-references/beep-get-ui-refresh-2026-05-26/references/stitch-kotlin-screens/00-contact-sheet.png`
  - `.lazyweb/quick-references/beep-get-ui-refresh-2026-05-26/references/stitch-kotlin-screens/01-today-loaded.png`
  - `.lazyweb/quick-references/beep-get-ui-refresh-2026-05-26/references/stitch-kotlin-screens/01b-today-lower.png`
  - `.lazyweb/quick-references/beep-get-ui-refresh-2026-05-26/references/stitch-kotlin-screens/02-send-top.png`
  - `.lazyweb/quick-references/beep-get-ui-refresh-2026-05-26/references/stitch-kotlin-screens/02b-send-lower.png`
  - `.lazyweb/quick-references/beep-get-ui-refresh-2026-05-26/references/stitch-kotlin-screens/03-friends-top.png`
  - `.lazyweb/quick-references/beep-get-ui-refresh-2026-05-26/references/stitch-kotlin-screens/03b-friends-add-dialog.png`
  - `.lazyweb/quick-references/beep-get-ui-refresh-2026-05-26/references/stitch-kotlin-screens/04-my-top.png`
  - `.lazyweb/quick-references/beep-get-ui-refresh-2026-05-26/references/stitch-kotlin-screens/04c-my-configure-slots-dialog.png`
  - `.lazyweb/quick-references/beep-get-ui-refresh-2026-05-26/references/stitch-kotlin-screens/04d-my-add-code-dialog.png`
  - `src/components/KotlinMockupUI.tsx`
  - `src/design/tokens.ts`
  - `src/design/appTheme.ts`
  - `src/design/skinPacks.ts`
  - `src/navigation/RootNavigator.tsx`
  - `src/screens/TodayScreen.tsx`
  - `src/screens/SendSignalScreen.tsx`
  - `src/screens/SendBeepScreen.tsx`
  - `src/screens/SendBlinkScreen.tsx`
  - `src/screens/SlipReplyRoomScreen.tsx`
  - `src/screens/PeopleScreen.tsx`
  - `src/screens/MyScreen.tsx`
  - `src/screens/WidgetStatesScreen.tsx`
  - `src/screens/DictionaryScreen.tsx`
  - `src/screens/SettingsScreen.tsx`
  - `C:/Users/slime/AppData/Local/Temp/beepget-uiqa-nav-today-1779900135244.png`
  - `C:/Users/slime/AppData/Local/Temp/beepget-uiqa-nav-send-1779900139568.png`
  - `C:/Users/slime/AppData/Local/Temp/beepget-uiqa-nav-friends-1779900143894.png`
  - `C:/Users/slime/AppData/Local/Temp/beepget-uiqa-nav-my-1779900148228.png`
  - `C:/Users/slime/AppData/Local/Temp/beepget-auth-login-dynamic-official.png`
  - `.lazyweb/design-improve/auth-login-2026-05-30/report.md`
  - `.lazyweb/design-research/auth-login-onboarding-2026-05-30/report.md`
  - `.lazyweb/design-brainstorm/auth-login-onboarding-2026-05-30/report.md`
  - `.lazyweb/design-improve/auth-login-rigged-2026-05-30/report.md`

## Brand

- Personality: private, immediate, close-friend pager; quiet but slightly playful.
- Trust signals: small-circle language, private status pills, no public feed affordances, clear send summaries before action, account/data settings separated from personalization.
- Avoid: chat bubbles, likes/comments, public discovery, marketing hero sections, purple gradients, generic dashboard cards, reward-first surfaces, unrelated settings inside Send.

## Product goals

- Goals: make the latest private signal obvious, make Beep the default code signal, make Blink feel like a separate 2-second video send type, make sending to one close friend fast, make widget settings understandable, sell coordinated skin packs rather than one-off toggles.
- Non-goals: social feed, general messaging thread, public friend discovery, long-form content, free-text widget chat, separate SM/MD skin purchases, avatar editing from Send.
- Success signals: user can see the newest Blink on Today, send a code-only Beep from the Send tab, add a Blink only when needed, add a friend by Beep ID, configure quick replies and signal tokens from My, preview skin packs against SM/MD widgets before applying.

## Auth login direction

- Job: the first-run screen should demonstrate the core product promise in one short loop: Beepy wakes, sends `8282`, and a close friend's widget receives it. It should feel like the app is already alive before the user signs in.
- Layout: keep the cream paper slip and black outer stage, but make the signal demo the hero stage instead of a small framed widget inside the slip. Avoid a literal iPhone frame and avoid a generic marketing hero.
- Motion: use a 3-step loop, `wake -> send -> received`, with frame-based Classic Paper Beepy emote changes, antenna pulse, flying signal chip, and recipient/widget confirmation. Do not draw fake eyes or face parts over the Beepy PNG; swap purpose-made frames instead. Respect reduced motion with a still final state.
- Auth CTAs: keep provider buttons official and compliance-led. iOS uses native Apple sign-in first; Google and Kakao remain visually equal secondary options. UI Preview is a small utility affordance, not another login peer.
- Product copy: one compact sentence is enough. The animation should explain the app; the buttons should only explain sign-in.

## Personas and jobs

- Primary personas: close friends/couples/roommates using short codes and 2-second Blinks as low-friction check-ins.
- User jobs: see who beeped, understand the code quickly, reply with a preset, send a Beep, attach a Blink when the signal needs motion, manage trusted friends, tune widget responses, personalize the pager identity.
- Key contexts of use: phone home screen handoff, short mobile sessions, one-handed scanning, low-attention check-ins.

## Information architecture

- Primary navigation: exactly four bottom tabs: `TODAY`, `SEND`, `FRIENDS`, `MY`.
- Core routes/screens:
  - `Today`: latest signal, Blink preview, quick reply, queue.
  - `Send`: two explicit send types, `BEEP` for code-only and `BLINK` for code plus 2-second video, To rail, signal deck, summary, send action.
  - `Friends`: search, My Beep ID, add friend, close friend rows.
  - `My`: profile/avatar entry point, skin-pack entry through the header/current-pack surface, widget skins, quick replies, signal directory.
  - `Account`: account actions, privacy, logout, delete only.
- Content hierarchy: latest/private/actionable information first; configuration and lower-priority lists below the fold. Skin packs live under My/Personalize and can be previewed from SM/MD widget detail screens.

## Design principles

- Principle 1: Classic Paper (the warm-ivory Kotlin mockup) is the base skin. Every other skin is a coordinated pack layered on the **same** IA, grid, and component grammar — skins vary palette / texture / shape only, never the screen structure or data slots.
- Principle 2: One primary object per screen: latest signal on Today, Beep transmission on Send, close friends on Friends, personalization/settings groups on My.
- Principle 3: Blink previews must use real video or real frame thumbnails inside the actual Send/widget layout, never decorative placeholder blocks.
- Principle 4: Beep first, but Blink must remain a visible sibling send type instead of being hidden as settings or copy.
- Principle 5: Skin packs are bundled identities that affect app chrome, Send cards, widgets, avatar frame, and status tint. Every primary surface (Today, Send, Friends, My) and shared component must read its colors from `useAppPalette` so an applied skin recolors the whole app — no surface may hardcode skin-owned colors.
- Principle 6: Widget grammar is size-bound: Beep is SM-widget only, and Blink is MD-list-widget only. Do not render Beep inside MD previews or Blink inside SM previews.
- Tradeoffs: The old black pager/slip style can survive in secondary surfaces, but the primary mobile tabs use the warm ivory Kotlin mockup language. Purchasing entry points can be visible in My/Widget previews, but checkout must not live inside the urgent Send flow.

## Visual language

- Color: the app chrome is a system light/dark theme. Light is warm ivory background, white cards, soft gray controls, black primary actions, red/green status dots; dark is a calm neutral near-black with warm off-white text and a light high-contrast primary. The theme follows the OS (`useColorScheme`) plus an in-app System/Light/Dark toggle, never per-identity-pack palettes; surfaces must stay legible in both modes, so always pull background/card/text/rule/primary from `useAppPalette` rather than literal hex.
- Typography: compact sans for labels/body, monospaced numerals for signal codes and time, no oversized marketing type inside tool surfaces.
- Spacing/layout rhythm: compact mobile stacks, consistent section labels, bottom nav pill fixed above the home indicator, no nested decorative cards.
- Shape/radius/elevation: restrained rounded cards, pill controls for status/nav/chips, thin rule borders, minimal shadow.
- Motion: short mechanical press states and send-plane flight only; avoid large animated transitions unless tied to Blink capture/playback.
- Imagery/iconography: use actual Blink frames/video for media surfaces. All header and bottom-nav controls use one icon family — lucide line icons via `src/components/MockupLineIcons.tsx` — so headers and the tab bar read as the same set; never mix unicode glyphs (`◐ ◎ ⚙ ×`) or text labels (`Back`, `Close`) into icon slots. Emoji are allowed only as user-authored signal-token content (e.g. `집중중 🔕`), never as chrome/control affordances.

## Theme and skin system

Two separate concepts:

1. **App theme = system light/dark.** The app chrome has exactly two palettes, `lightPalette` and `darkPalette` in `src/design/appTheme.ts`, exposed through `useAppPalette()`. The active mode is resolved by `useResolvedThemeMode()` from the OS color scheme (`useColorScheme`) plus a persisted user preference (`themePreference: system | light | dark` in `src/stores/themeStore.ts`, stored in expo-secure-store). The only chrome theme control is the Appearance toggle in Account settings — there are no per-skin app palettes.
2. **Identity packs = widget skins, decoupled from app color.** Identity packs (Classic Paper / School Desk / Cherry Dot / Photo Booth Blink / Night Signal) are the user-facing personalization "main": coordinated paid/free sets of widget styling, Send-card layout, avatar frame, and emotes. They are picked in My and Widget Layouts and stored on `profiles.active_identity_pack` (set via the entitlement-checked `set_active_identity_pack` RPC). They do **not** change the app's light/dark chrome.

| App theme mode | Direction |
| --- | --- |
| Light | Warm ivory background, white cards, 1px rules, black ink primary, red/green status dots — the Classic Paper baseline |
| Dark | Calm neutral near-black background (`#0E0F0E`), soft raised cards, warm off-white text, light high-contrast primary; `statusBar: "light"` |

- Naming is single-source-of-truth. Use the user-facing identity-pack name everywhere a user can see it (store cards, widget previews, settings) and the slug everywhere in code/data. Do not introduce a third alias.
- Both light and dark keep the same screens, grid, component grammar, and data slots (Principle 1). Only palette and shadow change between modes; never fork a screen per mode.
- Every surface must remain legible (text/rule contrast) in both light and dark — a screen that hardcodes a light-only color is a defect.
- Premium identity packs must apply to **every** widget/Send surface they touch, not just Today/My; never grant or apply a paid pack without checkout verification.
- Adding nothing to the theme: light/dark are fixed. To extend personalization, add an identity pack (widget skin), not a new app palette.

## Components

- Existing components to reuse:
  - `KotlinHeader` for primary-tab headers.
  - `MockupCard`, `MockupSection`, `StatusPill` for Kotlin mockup section grammar.
  - `BlinkHeroPreview`, `BlinkStrip`, `MiniFrameStrip` for Blink media.
  - `SignalSlotRail` for code deck and quick replies.
  - `FriendPickerStrip` for Send recipients.
  - `ActionButton` for primary/secondary actions.
- New/changed components:
  - `KotlinHeader.showAvatar` controls Today vs centered tab header layout.
  - Send child screens expose `showBackAction` so the primary Send tab matches the mockup while modal sends can still go back.
  - `MiniFrameStrip` renders real demo/captured frames.
  - `src/design/skinPacks.ts` owns skin pack metadata used by My and Widget preview surfaces.
- Variants and states: selected/unselected signal chips, disabled send buttons, camera permission fallback, captured Blink ready state, empty Today/Friends states, add/configure dialogs, active/owned/locked skin packs, empty/beep/blink widget states.
- Token/component ownership: use `src/design/tokens.ts`, `src/design/typography.ts`, `src/design/appTheme.ts`, and `src/design/skinPacks.ts`; do not introduce a parallel design layer.

## Accessibility

- Target standard: practical mobile accessibility with readable contrast and minimum touch target discipline.
- Keyboard/focus behavior: modal inputs should remain reachable by keyboard/screen reader; avoid hidden primary actions under the bottom nav.
- Contrast/readability: black primary buttons on light surfaces, muted copy only for secondary metadata, signal codes large enough for glance reading.
- Screen-reader semantics: pressable rows/buttons should keep `accessibilityRole="button"` where interactive; skin cards should expose selected state.
- Reduced motion and sensory considerations: Blink playback previews should be muted and loop quietly; avoid full-screen shake or aggressive pulse effects.

## Responsive behavior

- Supported breakpoints/devices: phone-first React Native layout, constrained to the app surface max width; web preview around 390px width.
- Layout adaptations: horizontal rails scroll instead of shrinking labels; cards use stable min heights for capture/media blocks; skin cards wrap or stack.
- Touch/hover differences: touch-first; no hover-only controls.

## Interaction states

- Loading: header refresh action may show an ellipsis; avoid replacing major content with full-screen loading.
- Empty: Today explains that Beeps/Blinks land there; Friends prompts add by Beep ID; no-friend Send explains Beep first and offers Friends.
- Error: use concise alerts for failed network/send/auth operations.
- Success: send actions acknowledge the recipient and code; dialogs close only after successful add/register.
- Disabled: send buttons disabled without a code or while sending/recording.
- Locked skin packs: show store intent, but do not grant entitlement or apply premium packs without checkout verification.
- Offline/slow network: preserve local preview/capture state until send completes or fails.

## Content voice

- Tone: compact, direct, private, mixed Korean/English where product terms matter.
- Terminology: keep `Beep`, `Blink`, `BEEP-GET`, `Today`, `Send`, `Friends`, `My`; Korean meanings are expected for default codes. Beep means the default short signal token, usually numeric but allowed to be a concise word or simple emoji status such as `집중중 🔕`. Blink means the 2-second video add-on. Skin Pack means a coordinated paid/free set.
- Microcopy rules:
  - Prefer action labels like `View`, `Done`, `Send Beep`, `Blink`, `Capture Blink`, `Configure Slots`.
  - Send summaries should say what will be sent and to whom.
  - Avoid explaining the whole product inside the app surface.
  - The Appearance toggle (`System` / `Light` / `Dark`) in Account settings is the only chrome theme control; light vs dark is a system/OS-driven app property, not a skin. Identity packs are widget skins, not app color, so pack personalization is expressed as `Skin Pack`, `Apply Pack`, `Unlock Pack`, and `Profile` and never doubles as an appearance switch.

## Default Signal Tokens

| Token | Meaning |
| --- | --- |
| `8282` | 빨리 와줘 |
| `486` | 보고 싶어 |
| `1004` | 집 도착 |
| `7942` | 친구사이 |
| `0404` | 영원히 사랑해 |
| `집중중 🔕` | 방해 금지 |

## Design review notes

- 2026-05-31 direction: the skin store is now first-class (see Skin system). Five skins are kept and supported (Classic Paper base + Soft Pager / Glass Mode free, Cyber Neon / Retro Future premium). Primary surfaces and shared components were migrated to `useAppPalette` so applied skins (incl. the two dark skins) recolor the whole app, not just Today/My. Open follow-ups: (a) unify skin names to the Skin system table (`skinPacks.ts`/`uiPreview.ts` still say `Swiss Paper`; DB seed + `theme/skins/*.json` carry the old label — needs a new migration, do not edit applied migrations); (b) header/nav icons unified to lucide line icons (no `◐ ◎ ⚙ × Back Close` in icon slots).
- Fixed: Today uses the left-aligned title layout without a forced avatar, matching the Today mockup.
- Fixed: the primary Send tab suppresses the back action; modal Send flows can still show back.
- Fixed: Send Blink no longer duplicates camera or captured-frame sections when the shared mockup deck owns them.
- Fixed: primary Send/Today Blink previews use real media/frames instead of color placeholders.
- Fixed: widget preview, widget tap Reply Room, and account settings no longer use the old `HeaderBar`/slip shell.
- Fixed: My personalization is a skin-pack flow instead of opening the old collection UI.
- Fixed: primary screen headers live inside the scroll surface so the top content does not feel pinned while only the lower content moves.
- Fixed: Send is Beep-first while `BLINK` remains a sibling send type for code plus 2-second video.
- Fixed: Send settings no longer owns profile avatar/account controls; those belong under My/Account.
- Fixed: My owns avatar editing through a profile avatar sheet; the Send settings sheet only controls Send-local defaults and saved Blink frames.
- Fixed: My header/current pack opens the Skin Pack sheet instead of dumping purchasable packs directly into the settings scroll.
- Fixed: Send mode labels are `BEEP` and `BLINK` so users can send either a code-only Beep or a code plus 2-second video Blink.
- Fixed: Widget skin previews render size-specific SM and MD widget mini-layouts instead of one generic themed rectangle; MD Blink previews use the same `Incoming Blink` / `SIGNAL SLOTS` / `2.0s - MUTE` medium-widget grammar as the native widget.
- Fixed: Send Beep uses an SM widget preview, Send Blink uses the MD widget preview, and Widget Layout state choices are size-specific so SM offers Beep while MD offers Blink.
- Fixed: no-friend Send uses the same warm Kotlin header/surface as the normal Send tab instead of the old debug shell.
- Fixed: primary header icons on Today/Send/Friends/My now map to user-facing actions; Diagnostics/logs are not exposed from the main Send settings sheet.
- Fixed: Friends add flow is Beep-ID-first, and the featured Blink CTA binds to actual received Blink media/code/time instead of static promotional copy.
- Fixed: My quick reply slots are editable from `Configure Slots`; slot changes persist through code presets instead of showing read-only fields.
- Fixed: `View` opens Reply Room as a Today-expanded signal card, reusing the Today sender row, code block, Blink media, and quick-reply rail instead of a separate modal header shell.
- Fixed: Signal Tokens uses the current Kotlin card shell instead of the old `HeaderBar`/black code page, and the directory accepts numbers, short words, and simple emoji statuses.
- Watch: the internal React Navigation route name for the Send tab is still `Compose`; user-facing labels are correct, but analytics/deep-link vocabulary should be normalized in a later low-risk pass.
- Watch: final visual confidence still needs TestFlight/device screenshots because iOS simulator access is not available in this workspace.

## Implementation constraints

- Framework/styling system: Expo / React Native with React Navigation and local StyleSheet components.
- Design-token constraints: use existing `colors`, `radius`, `spacing`, `type`, `useAppPalette`, and `src/design/skinPacks.ts`.
- Performance constraints: keep Blink frame previews lightweight; do not expand demo data into large runtime payloads; keep settings previews lightweight.
- Compatibility constraints: OTA-safe JavaScript changes only unless native widget/camera permissions require a new binary.
- Test/screenshot expectations: run typecheck, focused screen tests, full Jest, iOS export, Android export; use device/TestFlight screenshots before claiming pixel fidelity.

## Open questions

- [ ] What exact device sizes should define pixel QA baselines? Owner: product/design. Impact: spacing and bottom-nav fit.
- [ ] Should friend avatars use real profile images or generated initials until contacts/profile media exist? Owner: product/design. Impact: mockup fidelity.
- [ ] What checkout route verifies Skin Pack purchases? Owner: product/backend. Impact: locked packs currently show store intent but do not grant entitlement.
