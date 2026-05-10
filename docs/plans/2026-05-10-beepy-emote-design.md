# Beepy And Pack Emote Design Source Of Truth

## Status

This is the design source of truth for the default Beepy mascot emotes and the skin-native emote systems that ship inside identity packs.

The app UI can preview placeholder marks, but purchasable pack value must come from real art assets. Do not treat React Native view-coded doodles, text labels, generic icon chips, or the same mascot with different props as final premium emotes.

## Why This Exists

The identity shop only becomes worth buying if each pack changes the user's emotional signal, not just the card color. The free/default skin should use the real Beepy mascot; paid skins should introduce different emote languages that feel native to that skin.

The goal is not "more emojis." The goal is:

- A private friend signal language.
- Tiny expressions that fit the paper-slip/pager world.
- Assets that still read at widget size.
- Pack-specific personality strong enough to make users want the pack.

## Product Role

Mascot and pack emotes appear in these places:

- `MY` pack detail preview.
- Friend-home widget preview.
- Reply Room signal detail.
- Blink 3-cut preview decoration.
- Future reply-slot editor and unlock screens.

They should support the widget-first loop. They should not turn BEEP-GET into a chat sticker marketplace, public feed, or mascot game.

## Mascot Boundary

There are two different asset families:

- `Classic Paper` uses canonical Beepy. This pack should visibly use `assets/brand/beepy-handdrawn.png` as the source reference and can include Beepy holding slips, pinging, waiting, or opening a signal.
- Paid/locked packs use skin-native emotes. They may include tiny Beepy cameos only as secondary stamps, but the main emote value must be different per skin.

Do not make every paid pack "Beepy wearing a different costume." That reads like one mascot pose pack, not like a shop full of distinct identities.

Pack-native examples:

- `School Desk`: memo doodles, pencil stamps, food/cafe/study marks, sleepy notebook creatures.
- `Cherry Dot`: cherry blobs, heart pings, shy sticker faces, red-dot charm marks.
- `Photo Booth Blink`: camera flashes, pose stamps, film-strip faces, BFF strip symbols.
- `Night Signal`: radar glyphs, lock slips, secret signal ghosts, green scan marks.

The BEEP-GET red dot, paper/slip feeling, and private-signal mood tie the packs together. The mascot does not need to carry every pack.

## Canonical Beepy DNA

Beepy is the default mascot and belongs primarily to `Classic Paper`, login/onboarding, and brand moments.

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
- Classic Paper should keep the canonical cream Beepy body recognizable.
- Paid packs should change the emote subject and silhouette, not only tint Beepy.
- Night Signal can use green glow lines and radar/lock glyphs, but it should not become a separate LCD pack.

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

Role: free baseline. Simple, useful, iconic, and clearly Beepy.

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

Role: teen/20s daily-life utility pack. This should feel immediately usable and should not be Beepy in school cosplay.

Visual notes:

- Ruled note paper.
- Pencil marks, binder holes, small margin lines.
- Slightly messy hand-drawn school-desk mood.

Expressions:

- `hungry`: small lunch/food doodle with signal dot.
- `focus-mode`: pencil target mark and concentration rings.
- `cafe-study`: notebook/cup stamp, not a full cafe scene.
- `done-after-class`: stamped DONE mark escaping the ruled page edge.
- `sleepy`: sleepy notebook creature or folded memo mark.
- `exam-panic`: tiny paper storm and pencil panic marks.

### Cherry Dot

Role: soft, friendly, slightly flirty without becoming couple-only. This pack should feel like cherry/sticker characters, not Beepy with pink props.

Visual notes:

- Pink cream sticker tone.
- Cherry/dot accents.
- Softer curves, still ink-drawn.
- Red dot stays part of the system.

Expressions:

- `like`: cherry blob with a tiny heart ping.
- `waiting`: red-dot charm peeking from the side.
- `sulking`: round sticker face turned away.
- `come-out`: cherry pair waving from a slip edge.
- `heart-ping`: heart signal with red-dot trail.
- `shy-yes`: shy pink sticker face half-hidden behind a corner.

### Photo Booth Blink

Role: Blink-specific premium pack. This pack must sell the 3-cut video/photo fantasy.

Visual notes:

- Blue grid paper.
- Tape corners.
- Small photo strip marks.
- Camera flash and pose cues.

Expressions:

- `pose`: photo-frame pose stamp.
- `v-sign`: V-sign sticker inside a tiny film frame.
- `retake`: redo arrow and camera mark.
- `bff`: two frame faces sharing a strip.
- `camera-flash`: flash burst over a black photo card.
- `photo-saved`: pinned mini photo slip.

### Night Signal

Role: private, quiet, secret-signal pack. It can be premium, but should not overlap with a separate LCD pack.

Visual notes:

- Black/near-black slip.
- Green signal lines.
- Small radar and lock marks.
- Keep the marks hand-drawn and signal-based, not a full LCD/pixel mascot set.

Expressions:

- `secret`: tiny green secret-signal ghost or shh glyph.
- `private`: lock slip with hidden dot.
- `lock`: hand-drawn lock mark with scan line.
- `radar-detected`: radar ring and detected signal dot.
- `do-not-disturb`: quiet signal line over a dark slip.
- `open-quietly`: barely-open black paper edge with green glow.

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

The catalog source is `src/design/identityPacks.ts`. Each expression id in that file must match the final asset filename. `Classic Paper` expressions should use `artFamily: "canonical-beepy"`; paid pack expressions should use `artFamily: "pack-native"`.

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
Create a cohesive emote sheet for BEEP-GET.

Brand:
- private pager signal app for close friends
- widget-first, paper-slip UI, tiny red notification dot
- Korean teen/20s mood, cute but not childish

Mascot and pack boundary:
- Classic Paper should use the canonical hand-drawn Beepy mascot
- paid packs should use skin-native emote subjects, not the same Beepy mascot in costumes
- keep the BEEP-GET red dot/private signal language across every pack

Character / art:
- slightly uneven thin black ink outline
- simple silhouette, minimal face, tiny signal details
- cream paper or pack-native sticker feeling with transparent background

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
- same mascot with only costume or prop changes across all packs
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
- Paid packs use a pack-native emote subject, not canonical Beepy with different poses.
- The red-dot/signal language still feels like BEEP-GET.
- Classic Paper uses the hand-drawn Beepy direction from `assets/brand/beepy-handdrawn.png`.
- The pack detail preview makes the user understand why the pack could be worth paying for.

## Open Work

- Replace placeholder expression metadata with real assets.
- Add pack-specific prompt files or source art references once final art is generated.
- Add visual QA screenshots for all pack details after assets land.
- Decide the IAP unlock model separately; this document defines art direction, not purchase mechanics.
