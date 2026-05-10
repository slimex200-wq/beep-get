# Today, Send, People, and Beepy Emoji UX Design

## Goal

Make the non-MY tabs feel as intentional as the identity shop without adding chat, feeds, or generic social-app clutter.

The approved direction is:

- Keep the four primary tabs: `TODAY / SEND / PEOPLE / MY`.
- Do not merge tabs yet. The tab model is understandable; the weak point is that `TODAY`, `SEND`, and `PEOPLE` do not currently carry enough product weight.
- Make each tab own one clear loop: received signals, outgoing signals, and close-friend circuit.
- Stop trying to make purchasable emotes out of React Native view doodles. Use the coded shapes only as placeholders and move premium emoji value into real image assets.

## Product Diagnosis

`MY` is now carrying too much of the product fantasy: widget preview, skins, identity packs, reply slots, account, and archive. The other tabs are functionally correct but feel thin:

- `TODAY` works as an inbox, but it does not yet feel like a daily signal desk.
- `SEND` works as a form, but it does not yet feel like a quick signal deck.
- `PEOPLE` works as friend management, but it does not yet feel like a close circuit of real people.

The app should stay widget-first. The phone app is not the main destination; it is the place where users inspect, send, and tune the signals that show up on friend home screens.

## Reference Notes

- LINE Creators Market recommends stickers that are easy to use in daily conversation and have understandable expressions, messages, and illustrations. This supports designing Beepy packs around reusable social states, not decorative objects.
- Apple Messages frames stickers as matching personality and mood, and lets users reuse stickers in conversations. This supports treating Beepy emoji as identity/expression assets, not simple icon buttons.

Reference URLs:

- https://creator.line.me/en/guideline/sticker/
- https://support.apple.com/en-gb/guide/iphone/iph37b0bfe7b/ios

## Information Architecture

Keep this primary navigation:

```text
TODAY   SEND   PEOPLE   MY
```

Do not rename or collapse the tabs in the next implementation pass. If the next QA round still finds `SEND` and `PEOPLE` underused, consider renaming `PEOPLE` to `CIRCUIT` and moving some send shortcuts into it. That should be a later decision, not the first fix.

## TODAY: Signal Desk

Current role: latest received Beep/Blink plus queue.

New role: the daily desk for incoming signals.

Sections:

- `Incoming Now`: latest Beep/Blink slip with `OK / 8282 / OPEN`.
- `Quick Reply Rail`: user slots from `MY`, not only hardcoded numeric replies.
- `Today Queue`: compact list of unread and recent signals.
- `Friend Pulse`: 3-4 friend rows showing latest state such as `민아 sent 8282`, `준호 quiet`, `유나 saved Blink`.
- `Widget Mirror`: small preview of what my friend-home widget currently shows.

Behavior:

- Empty state should be warm and actionable: add friend if no friends, send first signal if friends exist.
- Latest signal remains the hero; do not turn Today into a feed.
- Reply Room remains the deep view, not chat history.

## SEND: Signal Deck

Current role: selected recipient or fallback first friend, then Beep/Blink form.

New role: a fast outgoing signal deck.

Sections:

- `To Strip`: horizontal close-friend picker at the top. If opened from People, preselect that friend.
- `Signal Type`: Beep/Blink switcher remains, but it should feel like part of the slip, not a detached toggle.
- `Slot Deck`: user reply slots plus numeric presets. Show both text tokens and classic codes.
- `Recent Combos`: last 3 sent combinations, for example `민아 + 배고픔`, `준호 + 8282`, `유나 + 끝나고`.
- `Send Slip`: the current outgoing slip form.

Behavior:

- Default code should come from the selected slot, not always `8282`.
- If no friends exist, route to People with a stronger invite panel.
- Blink should still enforce the 2-second limit and avoid implying free-form video chat.

## PEOPLE: Close Circuit

Current role: add by Beep ID, radar, friend cards, relationship preset chips.

New role: the user’s close friend circuit.

Sections:

- `My Beep ID`: shareable ID slip at the top. People should make inviting easier, not hide the user’s own ID in `MY`.
- `Close Circuit Map`: keep the radar, but attach friend dots to actual friend cards where possible.
- `Friend Cards`: each card shows relationship, last signal, quick send, and pin-to-widget affordance.
- `Invite Slip`: input by Beep ID plus relationship preset.
- `Circuit Settings`: soft management actions such as rename relation, mute, or remove. Keep destructive actions secondary.

Behavior:

- Tapping a friend should show a small action sheet or detail slip: `SEND BEEP`, `SEND BLINK`, `VIEW SIGNALS`, `PIN`.
- Friend cards should not feel like static address-book cards.
- Relationship presets should feel like labels for closeness, not form metadata.

## Beepy Emoji Direction

Detailed source of truth: `docs/plans/2026-05-10-beepy-emote-design.md`.

The current view-coded emotes are useful for layout QA only. They are not good enough for monetization.

Approved direction:

- Keep coded emotes as temporary placeholders.
- Use the real hand-drawn Beepy mascot for the default `Classic Paper` skin.
- Build real `PNG` or `WebP` skin-native emote assets for paid packs.
- Do not make paid packs the same Beepy mascot doing different actions or wearing different costumes.
- Each identity pack needs 5-8 expressions, not only 3.
- The app should preview 3 emotes in pack detail, but the pack can include more in the future.
- Maintain the BEEP-GET visual language: cream paper, thin black ink, tiny red dot, slightly imperfect hand-drawn lines, not glossy mascot art.

Shared art rules:

- Default skin: hand-drawn Beepy, simple body, asymmetrical tiny details.
- Other skins: different emote subjects that belong to the skin, tied together by paper/signal/red-dot language.
- Thin black outline with small red accent dot.
- Transparent background for production sticker assets.
- Readable at small widget-preview size.
- Expressions must map to real teen/20s usage states.
- Avoid generic emoji faces, shiny 3D, Discord sticker gloss, and over-rendered AI character art.

## Pack Expression Matrix

`Classic Paper`

- Basic Beepy
- OK slip
- Open signal
- Save
- Ping
- Waiting

`School Desk`

- Hungry
- Focus mode
- Cafe study
- Done after class
- Sleepy
- Exam panic

`Cherry Dot`

- Like
- Waiting
- Sulking
- Come out
- Heart ping
- Shy yes

`Photo Booth Blink`

- Pose
- V sign
- Retake
- BFF
- Camera flash
- Photo saved

`Night Signal`

- Secret
- Private
- Lock
- Radar detected
- Do not disturb
- Open quietly

## Asset Brief For GPT Image Or Designer

Use this as the stable prompt skeleton:

```text
Create a cohesive BEEP-GET emote sheet.

Style:
- Classic Paper uses the hand-drawn tiny pager mascot named Beepy
- paid packs use different skin-native emote subjects, not Beepy costume/action variants
- cream paper sticker feeling, thin black ink outline, slightly uneven linework
- tiny red notification dot accent
- minimal Korean teen/20s private-friend mood
- cute but not childish, private pager signal system
- transparent background, simple silhouette, readable at small mobile sizes

Avoid:
- glossy 3D
- generic emoji faces
- anime mascot
- corporate vector mascot
- overly detailed full-body character
- purple gradient, chat bubble UI, SaaS icon style

Pack:
[PACK NAME]

Expressions:
[6-8 expressions]

Output:
one clean sticker sheet with each emote separated, consistent scale, consistent line weight, production-ready for mobile UI preview.
```

## Success Criteria

- Users can explain each tab in one sentence.
- `TODAY` feels worth opening even when there is only one signal.
- `SEND` makes the fastest path obvious: pick friend, pick slot, send.
- `PEOPLE` feels like a close-friend circuit, not a contact form.
- Pack previews stop looking like color variants.
- Beepy emoji quality is good enough that the user can imagine paying for a pack.

## Deferred

- Do not add chat.
- Do not add a public feed.
- Do not add user-generated marketplace.
- Do not implement StoreKit or Google Play Billing in this pass.
- Do not replace the four-tab IA before another QA round proves it is still confusing.
