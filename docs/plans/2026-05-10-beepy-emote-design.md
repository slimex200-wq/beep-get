# Beepy Emote Design Source Of Truth

## Status

This is the design source of truth for Beepy emotes and sticker-like identity-pack assets.

The app UI can preview placeholder marks, but purchasable Beepy value must come from real art assets. Do not treat React Native view-coded doodles, text labels, or generic icon chips as final emotes.

## Why This Exists

The identity shop only becomes worth buying if each pack changes the user's emotional signal, not just the card color. Beepy emotes are the small collectible layer that makes a skin feel personal on a friend's home screen.

The goal is not "more emojis." The goal is:

- A private friend signal language.
- Tiny expressions that fit the paper-slip/pager world.
- Assets that still read at widget size.
- Pack-specific personality strong enough to make users want the pack.

## Product Role

Beepy emotes appear in these places:

- `MY` pack detail preview.
- Friend-home widget preview.
- Reply Room signal detail.
- Blink 3-cut preview decoration.
- Future reply-slot editor and unlock screens.

They should support the widget-first loop. They should not turn BEEP-GET into a chat sticker marketplace, public feed, or mascot game.

## Character DNA

Beepy is a tiny hand-drawn pager creature.

Core traits:

- Small rounded pager body, closer to a scribbled `B` silhouette than a polished mascot.
- Thin black ink outline with slightly uneven pressure.
- One tiny red notification dot or signal accent.
- Minimal face; expression comes from pose, antenna, props, and motion marks.
- Cream paper or transparent background depending on context.
- Cute, but not childish. It should feel like a private joke between close friends.

Avoid:

- Glossy 3D sticker rendering.
- Generic emoji faces.
- Anime mascot proportions.
- Corporate vector mascot style.
- Big eyes, chibi overacting, or plush-toy softness.
- Discord/LINE clone gloss.
- Purple gradient, glassmorphism, SaaS icon style.

## Visual System

Line:

- Thin black ink, slightly imperfect.
- Use small gaps, jitter, and hand pressure variation.
- Keep the silhouette readable at 28-40px in app previews.

Color:

- Default body: cream paper / off-white.
- Accent: BEEP-GET red dot.
- Pack tones may tint props, background chips, or paper, but Beepy should remain recognizable.
- Night Signal can use green glow lines, but the character should not become a full LCD icon.

Texture:

- Light paper grain is allowed.
- No heavy noise that muddies small previews.
- No photoreal shadows.

Scale:

- Design at 1024x1024 or larger.
- Export production emotes at 512x512 transparent PNG or WebP.
- Keep important detail inside an 80px safe margin on a 512px export.

## Expression Rules

Each expression must answer one of these questions:

- What quick reply does this help me send?
- What mood does this help my friend understand without opening the app?
- What makes this pack feel different from the free pack?

Good expression types:

- State: hungry, focus, sleepy, private, waiting.
- Action: open, save, retake, ping, reply.
- Social cue: like, sulking, shy yes, come out, BFF.
- Blink cue: pose, V sign, camera flash, photo saved.

Bad expression types:

- Decorative-only props.
- Random cute faces with no use case.
- Duplicates where only the color changes.
- Long text inside the drawing.
- Memes that will age quickly before launch.

## Pack Matrix

### Classic Paper

Role: free baseline. Simple, useful, and iconic.

Visual notes:

- Cream paper sticker.
- Black ink outline.
- Tiny red dot.
- No heavy props.

Expressions:

- `basic-beepy`: default Beepy standing by.
- `ok-slip`: Beepy holding a tiny OK slip.
- `open-signal`: Beepy pointing at an open signal mark.
- `save`: Beepy hugging a saved paper slip.
- `ping`: Beepy with a small antenna ping.
- `waiting`: Beepy sitting still beside a dot.

### School Desk

Role: teen/20s daily-life utility pack. This should feel immediately usable.

Visual notes:

- Ruled note paper.
- Pencil marks, binder holes, small margin lines.
- Slightly messy hand-drawn school-desk mood.

Expressions:

- `hungry`: Beepy holding or staring at a tiny food cue.
- `focus-mode`: Beepy with concentration lines and a small desk mark.
- `cafe-study`: Beepy with notebook/cup props, not a full cafe scene.
- `done-after-class`: Beepy escaping the ruled page edge.
- `sleepy`: Beepy slumped with small z marks.
- `exam-panic`: Beepy with tiny paper storm marks.

### Cherry Dot

Role: soft, friendly, slightly flirty without becoming couple-only.

Visual notes:

- Pink cream sticker tone.
- Cherry/dot accents.
- Softer curves, still ink-drawn.
- Red dot stays part of the system.

Expressions:

- `like`: Beepy with a tiny heart ping.
- `waiting`: Beepy peeking from the side.
- `sulking`: Beepy turned away with one red dot.
- `come-out`: Beepy waving from a slip edge.
- `heart-ping`: Beepy sending a small signal heart.
- `shy-yes`: Beepy half-hiding behind a sticker corner.

### Photo Booth Blink

Role: Blink-specific premium pack. This pack must sell the 3-cut video/photo fantasy.

Visual notes:

- Blue grid paper.
- Tape corners.
- Small photo strip marks.
- Camera flash and pose cues.

Expressions:

- `pose`: Beepy posing for a cut.
- `v-sign`: Beepy making a tiny V sign.
- `retake`: Beepy with a redo arrow and camera mark.
- `bff`: two tiny Beepy marks sharing a strip.
- `camera-flash`: Beepy hit by a tiny flash burst.
- `photo-saved`: Beepy pinning a mini photo slip.

### Night Signal

Role: private, quiet, secret-signal pack. It can be premium, but should not overlap with a separate LCD pack.

Visual notes:

- Black/near-black slip.
- Green signal lines.
- Small radar and lock marks.
- Beepy remains a hand-drawn character, not only a pixel icon.

Expressions:

- `secret`: Beepy holding a tiny shh/signal mark.
- `private`: Beepy behind a lock slip.
- `lock`: Beepy beside a small lock icon.
- `radar-detected`: Beepy on a radar ring.
- `do-not-disturb`: Beepy sleeping under a quiet signal line.
- `open-quietly`: Beepy opening a paper edge carefully.

## UI Preview Contract

Pack detail should show:

- Three featured emotes from the pack.
- One Blink 3-cut strip using the pack's tone.
- Reply slot chips that match the pack's intended use.
- A short pack description focused on feeling and usage.

Pack detail must not show:

- Blank black strips.
- Text-only placeholders like `B`, `Beep`, or `camera` as final art.
- Color-only variants.
- Inconsistent preview grammar between packs.

The catalog source is `src/design/identityPacks.ts`. Each expression id in that file must match the final asset filename.

## Asset Contract

Production path:

```text
assets/brand/emotes/<pack-slug>/<pack-slug>__<expression-id>.png
```

Example:

```text
assets/brand/emotes/school-desk/school-desk__hungry.png
```

Catalog shape:

```ts
{
  id: "hungry",
  label: "Hungry",
  source: "asset",
  asset: require("../../assets/brand/emotes/school-desk/school-desk__hungry.png")
}
```

Before real assets land, `source: "placeholder"` is allowed only for layout QA.

## GPT Image / Designer Prompt

Use this as the base prompt, then add the pack-specific notes above.

```text
Create a cohesive Beepy emote sheet for BEEP-GET.

Brand:
- private pager signal app for close friends
- widget-first, paper-slip UI, tiny red notification dot
- Korean teen/20s mood, cute but not childish

Character:
- tiny hand-drawn pager creature named Beepy
- slightly uneven thin black ink outline
- small rounded body, minimal face, tiny antenna/signal details
- cream paper sticker feeling with transparent background

Style:
- restrained hand-drawn sticker sheet
- readable at small mobile/widget size
- consistent scale and line weight across all emotes
- each emote separated with clean transparent background

Pack:
[PACK NAME]

Pack visual notes:
[PACK-SPECIFIC VISUAL NOTES]

Expressions:
[6 EXPRESSIONS WITH ONE-LINE INTENT EACH]

Avoid:
- glossy 3D
- anime mascot
- generic emoji faces
- corporate vector icon
- Discord sticker gloss
- over-detailed full-body character
- purple gradients
- chat bubble UI

Output:
one clean sticker sheet plus enough spacing to crop each emote into individual 512x512 transparent assets.
```

## Acceptance Checklist

An emote pack is production-ready only if:

- Every emote is understandable at 32px.
- The pack has at least six expressions.
- At least three expressions are clearly useful as quick replies.
- The pack looks different by idea, not only by palette.
- The red-dot/signal language still feels like BEEP-GET.
- The style matches the hand-drawn Beepy direction from `assets/brand/beepy-handdrawn.png`.
- The pack detail preview makes the user understand why the pack could be worth paying for.

## Open Work

- Replace placeholder expression metadata with real assets.
- Add pack-specific prompt files or source art references once final art is generated.
- Add visual QA screenshots for all pack details after assets land.
- Decide the IAP unlock model separately; this document defines art direction, not purchase mechanics.
