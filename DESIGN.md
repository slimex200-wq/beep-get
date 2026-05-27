# Design

## Source of truth

- Status: Active
- Last refreshed: 2026-05-27
- Primary product surfaces: Authenticated mobile tabs (`Today`, `Send`, `Friends`, `My`), Blink preview, Send Beep/Blink modal flows, widget configuration surfaces.
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
  - `src/navigation/RootNavigator.tsx`
  - `src/screens/TodayScreen.tsx`
  - `src/screens/SendSignalScreen.tsx`
  - `src/screens/SendBeepScreen.tsx`
  - `src/screens/SendBlinkScreen.tsx`
  - `src/screens/PeopleScreen.tsx`
  - `src/screens/MyScreen.tsx`

## Brand

- Personality: private, immediate, close-friend pager; quiet but slightly playful.
- Trust signals: small-circle language, private status pills, no public feed affordances, clear send summaries before action.
- Avoid: chat bubbles, likes/comments, public discovery, marketing hero sections, purple gradients, glassmorphism, generic dashboard cards, reward-first surfaces.

## Product goals

- Goals: make the latest private signal obvious, make Blink feel like a 2-second private object, make sending to one close friend fast, make widget settings understandable.
- Non-goals: social feed, general messaging thread, public friend discovery, long-form content, free-text widget chat.
- Success signals: user can see the newest Blink on Today, send a Blink from the Send tab without navigating elsewhere, add a friend by Beep ID, configure quick replies and signal codes from My.

## Personas and jobs

- Primary personas: close friends/couples/roommates using short codes and 2-second Blinks as low-friction check-ins.
- User jobs: see who beeped, understand the code quickly, reply with a preset, send a Blink, manage trusted friends, tune widget responses.
- Key contexts of use: phone home screen handoff, short mobile sessions, one-handed scanning, low-attention check-ins.

## Information architecture

- Primary navigation: exactly four bottom tabs: `TODAY`, `SEND`, `FRIENDS`, `MY`.
- Core routes/screens:
  - `Today`: latest signal, Blink preview, quick reply, queue.
  - `Send`: Blink-first send flow, To rail, signal deck, summary, send action.
  - `Friends`: search, My Beep ID, add friend, close friend rows.
  - `My`: appearance, widget layouts, quick replies, signal directory.
- Content hierarchy: latest/private/actionable information first; configuration and lower-priority lists below the fold.

## Design principles

- Principle 1: Match the Kotlin final mockup before inventing new slip-system variants.
- Principle 2: One primary object per screen: latest signal on Today, capture deck on Send, close friends on Friends, settings groups on My.
- Principle 3: Blink previews must use real video or real frame thumbnails, never decorative placeholder blocks.
- Tradeoffs: The old black pager/slip style can survive in secondary surfaces, but the primary mobile tabs use the warm ivory Kotlin mockup language.

## Visual language

- Color: warm ivory app background, white cards, soft gray controls, black primary actions, red/green status dots.
- Typography: compact sans for labels/body, monospaced numerals for signal codes and time, no oversized marketing type inside tool surfaces.
- Spacing/layout rhythm: compact mobile stacks, consistent section labels, bottom nav pill fixed above the home indicator, no nested decorative cards.
- Shape/radius/elevation: restrained rounded cards, pill controls for status/nav/chips, thin rule borders, minimal shadow.
- Motion: short mechanical press states only; avoid large animated transitions unless tied to Blink capture/playback.
- Imagery/iconography: use actual Blink frames/video for media surfaces; simple symbolic icons for header/nav controls; no stock-like decorative images.

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
- Variants and states: selected/unselected signal chips, disabled send buttons, camera permission fallback, captured Blink ready state, empty Today/Friends states, add/configure dialogs.
- Token/component ownership: use `src/design/tokens.ts` and `src/design/typography.ts`; do not introduce a parallel design layer.

## Accessibility

- Target standard: practical mobile accessibility with readable contrast and minimum touch target discipline.
- Keyboard/focus behavior: modal inputs should remain reachable by keyboard/screen reader; avoid hidden primary actions under the bottom nav.
- Contrast/readability: black primary buttons on light surfaces, muted copy only for secondary metadata, signal codes large enough for glance reading.
- Screen-reader semantics: pressable rows/buttons should keep `accessibilityRole="button"` where interactive.
- Reduced motion and sensory considerations: Blink playback previews should be muted and loop quietly; avoid full-screen shake or aggressive pulse effects.

## Responsive behavior

- Supported breakpoints/devices: phone-first React Native layout, constrained to the app surface max width.
- Layout adaptations: horizontal rails scroll instead of shrinking labels; cards use stable min heights for capture/media blocks.
- Touch/hover differences: touch-first; no hover-only controls.

## Interaction states

- Loading: header refresh action may show an ellipsis; avoid replacing major content with full-screen loading.
- Empty: Today explains that Beeps/Blinks land there; Friends prompts add by Beep ID.
- Error: use concise alerts for failed network/send/auth operations.
- Success: send actions acknowledge the recipient and code; dialogs close only after successful add/register.
- Disabled: send buttons disabled without a code or while sending/recording.
- Offline/slow network: preserve local preview/capture state until send completes or fails.

## Content voice

- Tone: compact, direct, private, mixed Korean/English where product terms matter.
- Terminology: keep `Beep`, `Blink`, `BEEP-GET`, `Today`, `Send`, `Friends`, `My`; Korean meanings are expected for default codes.
- Microcopy rules:
  - Prefer action labels like `View`, `Done`, `Send Blink`, `Configure Slots`.
  - Send summaries should say what will be sent and to whom.
  - Avoid explaining the whole product inside the app surface.

## Default signal codes

| Code | Meaning |
| --- | --- |
| `8282` | 빨리 와줘 |
| `486` | 보고 싶어 |
| `1004` | 집 도착 |
| `7942` | 친구사이 |
| `0404` | 영원히 사랑해 |

## Design review notes

- Fixed: Today uses the left-aligned title layout without a forced avatar, matching the Today mockup.
- Fixed: the primary Send tab suppresses the back action; modal Send flows can still show back.
- Fixed: Send Blink no longer duplicates camera or captured-frame sections when the shared mockup deck owns them.
- Fixed: primary Send/Today Blink previews use real media/frames instead of color placeholders.
- Fixed: widget preview, widget tap Reply Room, and account settings no longer use the old `HeaderBar`/slip shell.
- Fixed: Appearance is an in-place light/dark toggle instead of opening the old collection UI.
- Fixed: primary screen headers live inside the scroll surface so the top content does not feel pinned while only the lower content moves.
- Watch: the Send top-right gear currently opens logs; if product expects settings there, update the action destination or icon label together.
- Watch: final visual confidence still needs TestFlight/device screenshots because iOS simulator access is not available in this workspace.

## Implementation constraints

- Framework/styling system: Expo / React Native with React Navigation and local StyleSheet components.
- Design-token constraints: use existing `colors`, `radius`, `spacing`, and `type` exports.
- Performance constraints: keep Blink frame previews lightweight; do not expand demo data into large runtime payloads.
- Compatibility constraints: OTA-safe JavaScript changes only unless native widget/camera permissions require a new binary.
- Test/screenshot expectations: run typecheck, focused screen tests, full Jest, iOS export, Android export; use device/TestFlight screenshots before claiming pixel fidelity.

## Open questions

- [ ] Should the Send header gear open logs, settings, or a Send-specific configuration panel? Owner: product. Impact: header affordance clarity.
- [ ] What exact device sizes should define pixel QA baselines? Owner: product/design. Impact: spacing and bottom-nav fit.
- [ ] Should friend avatars use real profile images or generated initials until contacts/profile media exist? Owner: product/design. Impact: mockup fidelity.
