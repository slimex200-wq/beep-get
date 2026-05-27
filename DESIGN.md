# BEEP-GET UI/UX Design Source

> Active target: Kotlin final mockup refresh, 2026-05-26
> Reference folder: `.lazyweb/quick-references/beep-get-ui-refresh-2026-05-26/references/stitch-kotlin-screens/`
> Product rule: BEEP-GET is a private pager for close friends, not chat, feed, or a generic dashboard.

## Current Implementation Target

The four authenticated tabs must match the Kotlin mockup family:

- `01-today-loaded.png` / `01b-today-lower.png`
- `02-send-top.png` / `02b-send-lower.png`
- `03-friends-top.png` / `03b-friends-add-dialog.png`
- `04-my-top.png` / `04b-my-lower.png`
- `04c-my-configure-slots-dialog.png` / `04d-my-add-code-dialog.png`

Use the mockup hierarchy first. Existing slip-system ideas are still valid only when they support this target.

## Visual Commitments

- Background is warm ivory, not black stage, for the primary mobile tabs.
- The app uses a compact native phone layout: status-safe header, content stack, bottom nav pill.
- Cards are white or soft ivory with thin rules and restrained radius.
- Primary actions are black, full-width where the mockup shows a major send/view action.
- Numeric signal codes stay visually dominant and monospaced.
- Blink should show actual video or real frame thumbnails, not placeholder color blocks.
- Korean signal meanings are allowed and expected for default codes.
- Avoid marketing hero layouts, chat bubbles, feeds, likes, comments, reward surfaces, and dashboard filler.

## Primary Tabs

### Today

Purpose: latest private signal first.

Hierarchy:

1. Header with avatar/title/actions
2. Latest incoming card
3. Sender, time, private status
4. Hero signal code and meaning
5. Blink playback on the main card when media is present
6. View / Done actions
7. Quick Reply chips
8. Compact queue rows

Today is video-first for incoming Blink. Full detail still lives in Reply Room, but the main card must preview the received Blink directly.

### Send

Purpose: create the next Beep or Blink for one close friend.

Hierarchy:

1. Centered Send header
2. Capture panel, defaulting to Blink
3. Captured frame strip using real frames
4. To rail with close friends
5. Signal type segmented control
6. Signal deck chips
7. Summary pill: `Will send code ... to ...`
8. Large black Send action

The Send screen must not duplicate camera/capture panels. There is one capture surface, followed by the recipient and code controls.

### Friends

Purpose: close circuit management.

Hierarchy:

1. Centered Friends header
2. Search field
3. My Beep ID card
4. Add new friends card
5. Close Friends list rows
6. Configure Friend Info dialog

Friends is not a public discovery surface.

### My

Purpose: user settings and widget configuration.

Hierarchy:

1. Centered My Settings header
2. Appearance row
3. Widget Layout cards
4. Quick Replies with Configure Slots dialog
5. Signal Directory Codes with Add New dialog

Do not surface internal Studio/Collection labels as primary user-facing sections here.

## Default Signal Codes

| Code | Meaning |
| --- | --- |
| `8282` | 빨리 와줘 |
| `486` | 보고 싶어 |
| `1004` | 집 도착 |
| `7942` | 친구사이 |
| `0404` | 영원히 사랑해 |

## Component Rules

- `KotlinHeader` is the shared app header for the four primary tabs.
- `MiniFrameStrip` and `BlinkStrip` must render real Blink frames when available.
- `SignalSlotRail` is the shared code deck / quick reply rail.
- `FriendPickerStrip` is the shared To rail for Send.
- The bottom nav is exactly four tabs: `TODAY`, `SEND`, `FRIENDS`, `MY`.
- Prefer editing shared components when the mismatch appears across multiple tabs.

## Verification Checklist

- No placeholder frame color blocks on primary Send/Today paths.
- No duplicated Blink camera panels.
- Today renders received Blink video or frames on the main card.
- Send defaults to the Blink mockup flow.
- Friends and My preserve the Kotlin mockup section order and dialogs.
- Typecheck, focused tests, full Jest, and Expo export pass before shipping.
