# GPT-5.5 Pro Max Design Brief: Beep-get Whole-App UI/UX

Use this brief as a prompt for a high-end design model. The goal is to generate a complete visual direction for the whole Beep-get mobile app, not just one screen.

## Role

You are a world-class mobile product designer and art director. Your taste should be closer to Swiss editorial systems, Dieter Rams/Braun product clarity, and Teenage Engineering object-interface playfulness than to generic SaaS/mobile templates.

Design for a real Expo/React Native app that will ship on iOS and Android. The design must feel distinctive, implementable, and coherent across the entire app.

## Product

Product name: `BEEP-GET`

Beep-get is a widget-first private pager app for close friends.

The product is not a chat app, not a social feed, and not a generic video app. It is a small home-screen signal machine. Users send short numeric Beeps and optional 2-second Blinks. The receiver sees the signal on a widget, then can reply quickly from the widget or open the app for richer context.

## Approved Core Direction

The approved metaphor is a Swiss paper slip / pager ticket system:

- Widget: `Incoming Slip`
- Send screen: `Outgoing Slip`
- Reply Room: `Signal Detail + Quick Reply`
- App shell: the pager desk behind the widget

Every major surface should feel like part of one system of slips, codes, stamps, grids, and precise mechanical actions.

## Existing Widget Mockup DNA

The user's preferred widget mockup has these qualities:

- Cream paper background on black stage.
- Thin black grid lines.
- Rounded outer widget frame, but internal grid is strict.
- Serif display title: `Incoming Beep`, with italic `Beep`.
- Mono numeric hero code: `8282`.
- Tiny mono labels: `FROM - MINA - NO 04`, `14 - 56`.
- Small red notification dot.
- Circular dot-field/radar ornament.
- Bottom action buttons such as `CONFIRM`, `SAVE`, or future `OK`, `8282`, `OPEN`.

Preserve this DNA. Do not replace it with generic cards, purple gradients, glassmorphism, neumorphism, bubbly chat UI, or bland dark-mode SaaS components.

## Visual References To Synthesize

Use these as taste references, not as things to copy:

- Swiss / International Typographic Style: modular grid, asymmetry, disciplined typography, minimal ornament.
- Refero Standards: high-contrast precision blueprint, black/near-white with one orange/red accent, sharp minimal components.
- Dieter Rams / Braun: useful, understandable, unobtrusive, less but better, physical product clarity.
- Teenage Engineering OP-1: object-like interface, playful hardware controls, small high-density UI modules.
- Boarding passes, railway tickets, receipts, and pager displays: information-dense slips where every label has a role.

## Hard Constraints

- Whole app design, not a single screen.
- Mobile-first. Target 390x844 and 430x932 phone frames.
- Must be implementable in React Native/Expo.
- Must support Android-first verification and future iOS parity.
- Must not depend on complex custom shaders, 3D, or heavy video compositing.
- Must preserve code as the hero element.
- Must keep Blink as a 2-second format.
- Must avoid public feed / likes / open comments in MVP.
- Must avoid free-text widget input.
- Must avoid camera capture inside widget.

## Recommended App IA

Replace the current generic tab set with this product-native IA:

1. `Today`
   Current incoming signals, latest slip, queue, fast actions.

2. `People`
   Close friends, relationship-specific presets, send entry points.

3. `Send`
   Central compose action. Opens or displays the `Outgoing Slip`.

4. `Studio`
   Widget preview, skin selection, direct-reply slots, permissions.

5. `Logs`
   Saved Beeps/Blinks, expired media metadata, future collection/reward layer.

`Reply Room` should not be a tab. It is a modal/detail screen opened from widget, notification, Today, or Logs.

## Required Deliverables

Produce a complete design package in Markdown.

Include:

1. Art direction summary.
2. Navigation model.
3. Design tokens.
4. Component system.
5. Screen-by-screen mockups.
6. Widget states.
7. Motion/interaction notes.
8. Empty/error/loading states.
9. React Native implementation notes.

If you can produce visual artifacts, generate either:

- A self-contained HTML/CSS mockup board showing all screens side by side.
- Or high-fidelity image mockups for all required screens.
- Or SVG-style mockups embedded in Markdown.

Prefer one coherent visual system over many unrelated explorations.

## Required Screens

### 1. Auth / First Run

Purpose: Make the product premise clear before sign-in.

Should show:

- App as “private pager for close friends.”
- Widget-first promise.
- Apple/Google sign-in placeholders.
- A tiny Incoming Slip preview.

Avoid:

- Generic welcome screen.
- Long onboarding carousel.
- Corporate app copy.

### 2. Today

Purpose: The default home after login.

Should show:

- Latest incoming slip as the hero.
- Sender, code, time, Blink teaser if present.
- Quick actions: `OK`, `8282`, `OPEN`, `SAVE`.
- Small queue of other signals.

This replaces the generic dashboard/home idea.

### 3. Reply Room

Purpose: Opened from widget, notification, or Today.

Should show:

- Full incoming slip.
- 2-second Blink playback stage or 3-frame strip.
- Quick replies: `OK`, `8282`, `486`.
- `BLINK BACK` opens camera.
- Save/log action.

Avoid making this a normal chat thread. It is a signal response room.

### 4. Send: Beep Mode

Purpose: Compose an outgoing numeric signal.

Should show:

- Outgoing Slip.
- Recipient stamp.
- Code input as hero.
- Preset chips/keys.
- Optional tiny memo.
- Primary action: `SEND BEEP`.

The user should feel they are preparing the widget card that will appear on the other person's home screen.

### 5. Send: Blink Mode

Purpose: Attach a 2-second video signal.

Should show:

- Same Outgoing Slip structure.
- Camera/lens panel integrated into the slip, not buried below form fields.
- 2-second limit as a visible product rule.
- 3-frame preview strip.
- Primary action: `HOLD 2 SEC` or `SEND BLINK`.

Avoid generic camera upload UI.

### 6. People

Purpose: Manage close relationships.

Should show:

- People as a “close circuit,” not a contact list.
- Friend number/index.
- Relationship presets.
- Quick send entry.
- Invite/add friend flow.

### 7. Studio

Purpose: Configure the home-screen widget.

Should show:

- Widget preview in small and medium sizes.
- Skin selector.
- Direct reply slots: `OK`, `8282`, `486`, `OPEN`.
- Permission/status checklist.
- Test widget action.

This is where the user tunes their pager object.

### 8. Logs

Purpose: Saved slips and Blink history.

Should show:

- Saved Beeps/Blinks as ticket/ledger rows.
- Expired media represented as metadata-only slips.
- Saved media state.
- Future room for collection/reward, but do not make rewards the main screen.

### 9. Widget States

Design at least:

- Empty widget.
- Incoming Beep.
- Incoming Blink with 3-frame strip.
- Direct reply available.
- Sending.
- Sent.
- Failed/open app.

## Component System

Define components for:

- `SlipFrame`
- `SlipGrid`
- `SignalCode`
- `SignalStamp`
- `DotRadar`
- `BlinkStrip`
- `ReplyActionButton`
- `PresetCodeSlot`
- `BottomPagerNav`
- `WidgetPreview`
- `TicketLogRow`
- `CameraLensPanel`

For each component, define:

- Purpose
- Anatomy
- Variants
- States
- Implementation notes for React Native

## Design Tokens

Start with these baseline tokens, then refine if needed:

```css
:root {
  --bg-stage: #0A0A0A;
  --paper: #F2EDE4;
  --ink: #0A0A0A;
  --muted: #6B6560;
  --accent-red: #D8361E;
  --lcd-green: #D8F0C2;
  --rule-width: 1px;
  --outer-radius: 22px;
  --inner-radius: 14px;
  --button-radius: 0px;
}
```

Typography:

- Display serif for slip titles: similar to Fraunces or a warm editorial serif.
- Mono for codes and metadata: similar to IBM Plex Mono.
- Avoid generic Inter-heavy layouts.
- Code should use tabular numerals and generous tracking.

## Interaction Principles

- The widget is for receiving and preset replying.
- The app is for viewing context, composing, configuring, and saving.
- Most actions should be short and mechanical.
- Blink should feel like a tiny signal, not a social video.
- The app should open directly into context when launched from a widget or notification.

## Direct Widget Reply UX

Design direct widget reply as a required product behavior:

- User taps `OK` or `8282` on the widget.
- Widget shows `SENDING`.
- On success, widget shows `SENT`.
- On failure or missing auth, widget shows `OPEN APP`.

Do not design free-form widget text input.

## Output Format

Return the answer in this order:

1. `Design Thesis`
2. `Whole-App IA`
3. `Visual System`
4. `Design Tokens`
5. `Screen Mockups`
6. `Widget Mockups`
7. `Component System`
8. `Interaction and Motion`
9. `Implementation Notes for Expo/React Native`
10. `What Not To Build`

Be specific. Do not give generic UX advice. Produce concrete layouts, text labels, hierarchy, component names, and interaction states.

## Quality Bar

The result should feel like a real product with a point of view.

It should be:

- Stranger than a normal chat app.
- Clearer than an art project.
- More useful than a Dribbble shot.
- Less generic than a mobile dashboard.
- Coherent enough that an engineer can implement it screen by screen.

If any part starts looking like a standard messenger, social feed, crypto app, productivity dashboard, or generic neon/pixel app, stop and redesign it back toward the Swiss paper pager slip system.
