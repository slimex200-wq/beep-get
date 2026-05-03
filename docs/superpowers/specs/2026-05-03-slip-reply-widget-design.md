# Slip Reply and Widget Direct Send Design

Date: 2026-05-03
Status: approved direction, ready for implementation planning

## Decision

Use the A direction from the brainstorming mockups as the product spine:

- Widget: `Incoming Slip`
- Send screen: `Outgoing Slip`
- Reply Room: `Signal Detail + Quick Reply`

Beep-get should feel like a small pager terminal, not a chat app. The app exists to create, inspect, save, and reply to slips. The widget remains the primary surface for receiving and fast preset replies.

## Problem

The current Send and Reply Room flows work, but the Send screen still feels like a generic form with a camera panel. That weakens the widget-first idea. The next UX slice should make every send/reply interaction feel like the same object moving across surfaces: an incoming or outgoing paper slip.

## Goals

- Make the app screen look like the expanded version of the widget, not a separate chat UI.
- Let users reply from the widget with a fixed preset Beep such as `OK`, `8282`, or `486`.
- Keep Blink replies app-first because camera, permission, upload, and failure states are too heavy for a widget.
- Preserve the 2-second Blink format as a product rule and cost guardrail.
- Keep the MVP close-friends and private-signal focused, with no public feed or social comments.

## Non-Goals

- No free-text input inside widgets.
- No camera capture inside widgets.
- No public feed, likes, or open comments.
- No generic DM thread as the primary interface.
- No direct `master` changes; implementation must land through PR after CI.

## Surface Model

### Widget: Incoming Slip

The widget shows the latest incoming Beep or Blink:

- Sender name
- Numeric code
- Received time or index
- New/unread dot
- Blink teaser as thumbnail or three-frame strip when available
- Action row on supported sizes

Recommended action row:

- `OK` replies with the user's default acknowledge preset.
- `8282` replies with an urgent/call-me preset.
- `OPEN` deep-links to Reply Room.

Small widgets can prioritize one direct action plus open. Medium widgets can show two preset replies plus open. If a platform or widget family cannot support direct action, the button should deep-link into Reply Room with the preset preselected instead of silently failing.

### Send Screen: Outgoing Slip

The Send screen becomes the outgoing version of the same object:

- Top stamp: recipient, signal number, and mode.
- Central slip card: code as the hero.
- Mode switch embedded into the slip language, not as generic app tabs.
- Beep mode: code and optional tiny memo.
- Blink mode: the slip includes the 2-second lens and three-frame teaser strip.
- Bottom action remains visible: `SEND BEEP` or `HOLD 2 SEC`.

The user should feel they are preparing the widget card that will appear on the other person's home screen.

### Reply Room: Signal Detail + Quick Reply

Reply Room opens from widget, notification, or app inbox. It should show the full signal context:

- The incoming slip at large size.
- Blink playback for the 2-second clip when media exists.
- Save/read controls.
- Quick replies: `OK`, `8282`, `486`, or relationship-specific slots.
- `BLINK BACK` opens the app camera flow.

Reply Room can support a one-line note later, but the first implementation should prefer preset replies. That keeps the product from drifting into chat.

## Widget Direct Reply Design

Direct widget reply is required for the product to feel native to the home screen.

### Action Scope

MVP direct widget actions:

- Reply to the latest visible signal only.
- Use fixed preset codes only.
- Send only Beep replies, not Blink replies.
- Mark the source signal with a reply event.

### Backend Contract

Use the existing `reply_with_preset(p_signal_id uuid, p_code text)` RPC as the base. Before shipping direct widget send, add idempotency so double taps cannot create duplicate replies.

Recommended migration:

- Add `client_action_id uuid` to `signals` or `signal_events`.
- Add a unique constraint scoped to actor and action, for example `(actor_id, client_action_id)`.
- Add `reply_with_preset_once(p_signal_id uuid, p_code text, p_client_action_id uuid)`.
- Keep the relationship and participant checks server-side.
- Return the created or already-created reply signal.

### Auth and Storage

The native widget cannot assume the Expo JS runtime is active. It needs a small native-safe action path:

- Android: Glance `actionRunCallback`, short network action, and WorkManager fallback for retry.
- iOS: WidgetKit `Button` with `AppIntent` on iOS 17+.
- Store only the minimum auth material needed for the native action in platform-secure storage or an app-group-safe handoff.
- If no valid session exists, degrade to `OPEN APP` and preselect the intended action.

### State Feedback

Widget actions need visible states:

- Initial: `OK`, `8282`, `OPEN`
- Tap: optimistic `SENDING`
- Success: `SENT`
- Failure: `OPEN APP`

The widget should not keep spinning. If the direct action does not complete quickly, it should fail closed and ask the user to open the app.

## Data Flow

1. App syncs latest signal and recent preset slots to widget data.
2. Widget renders the latest incoming slip.
3. User taps a preset reply.
4. Native widget action reads `messageId`, selected `code`, and auth context.
5. Native action calls the idempotent reply RPC.
6. Backend verifies participant/relationship, inserts the reply Beep, and records a reply event.
7. Widget updates local status to `SENT` or `OPEN APP`.
8. App Realtime or next fetch refreshes inbox state.

## Error Handling

- Missing auth: open app to Reply Room.
- Expired source signal: show `EXPIRED` and open app.
- Network failure: show `OPEN APP`; retry only if WorkManager/AppIntent can do so safely.
- Duplicate tap: server returns the original reply for the same `client_action_id`.
- Daily limit exceeded: show `LIMIT` and open app to usage explanation.
- Unsupported platform version: render deep-link-only actions.

## Platform Notes

- Android Glance supports callbacks and background work, but long network work should move to WorkManager.
- Android 12+ activity launches should use `actionStartActivity`, not trampoline services.
- iOS interactive widgets require WidgetKit/AppIntent behavior; locked-device actions may require unlock/authentication.
- iOS implementation and validation require macOS/Xcode. Until then, Android can be implemented and tested first, but platform parity must not be claimed.

## Visual Rules

- Use Swiss Paper visual language from the saved mockups.
- Prefer black stage, cream paper, thin ink rules, red status dot, mono code typography, and serif slip titles.
- Avoid generic rounded app cards, large blank form inputs, and chat-bubble-first layouts.
- Keep code as the hero. Memo, comments, and media are secondary.

## Implementation Slices

1. Redesign Send screen into `Outgoing Slip` while preserving existing send behavior.
2. Redesign Reply Room into `Signal Detail + Quick Reply`.
3. Add app-side quick reply service/store methods for the existing `reply_with_preset` RPC.
4. Add idempotent reply RPC migration before native widget direct send.
5. Add Android widget action row with direct preset reply.
6. Add iOS WidgetKit/AppIntent path when macOS is available.
7. Verify Android widget placement and direct reply on emulator/device.

## Acceptance Criteria

- Send screen no longer looks like a generic form.
- Reply Room opens directly to the selected signal and offers preset reply actions.
- Widget still shows the latest incoming signal.
- Android medium widget can send at least one preset reply without opening the app.
- Duplicate taps do not create duplicate replies.
- Unsupported or unauthenticated states fail into app-open behavior.
- Typecheck, Jest, Expo Doctor, and Android debug build pass before PR merge.

## Open Questions

- Which exact default presets ship first: `OK`, `8282`, `486`, or relationship-specific slots?
- Should `OK` map to a numeric code in the backend or be displayed as a label over a numeric code?
- Should quick replies count against the same daily Beep limit as normal sends? Default answer: yes.
- Should small widget direct reply be allowed, or should direct reply require medium widget size for safety?
