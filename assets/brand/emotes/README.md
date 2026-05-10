# Beepy Emoji Asset Boundary

Design source of truth: `docs/plans/2026-05-10-beepy-emote-design.md`.

This folder is the production boundary for Beepy and identity-pack emote assets.

The current React Native view-coded marks remain layout placeholders only. Do not treat those coded shapes as monetization-ready sticker art. Production packs should replace placeholder expression metadata in `src/design/identityPacks.ts` with real image assets.

Important boundary:

- `Classic Paper` should use the canonical hand-drawn Beepy mascot reference.
- Paid packs should use skin-native emotes, not the same Beepy mascot with only different actions, props, or costumes.

## Format

- Preferred: `PNG` or `WebP`.
- Background: transparent.
- Recommended source canvas: square, at least `512 x 512` per expression.
- Mobile preview should remain readable at small widget-preview size.
- Do not ship glossy mascot renders, 3D assets, Discord-style sticker gloss, or generic emoji faces.

## Naming

Use pack slug plus expression id:

```text
assets/brand/emotes/<pack-slug>/<pack-slug>__<expression-id>.png
```

Examples:

```text
assets/brand/emotes/classic-paper/classic-paper__ok-slip.png
assets/brand/emotes/school-desk/school-desk__hungry.png
assets/brand/emotes/night-signal/night-signal__open-quietly.webp
```

## Catalog Contract

Each expression in `src/design/identityPacks.ts` uses:

```ts
{
  id: string;
  label: string;
  artFamily: "canonical-beepy" | "pack-native";
  source: "placeholder" | "asset";
  asset?: ImageSourcePropType;
}
```

Production assets are wired through `src/design/beepyEmoteAssets.generated.ts`. Keep `assets/brand/emotes/manifest.json`, the generated map, and `src/design/identityPacks.ts` expression ids aligned.

When a real file exists, `identityPacks.ts` should hydrate the generated map so `source` becomes `"asset"` and `asset` points at the static `require("../../assets/brand/emotes/<pack>/<file>.png")`.

## Style Prompt Skeleton

```text
Create a cohesive BEEP-GET emote sheet.

Style:
- Classic Paper uses the hand-drawn tiny pager mascot named Beepy
- paid packs use skin-native emote subjects, not Beepy costume/action variants
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

## Pack Expression Matrix

### Classic Paper

- Basic Beepy
- OK slip
- Open signal
- Save
- Ping
- Waiting

### School Desk

- Hungry
- Focus mode
- Cafe study
- Done after class
- Sleepy
- Exam panic

### Cherry Dot

- Like
- Waiting
- Sulking
- Come out
- Heart ping
- Shy yes

### Photo Booth Blink

- Pose
- V sign
- Retake
- BFF
- Camera flash
- Photo saved

### Night Signal

- Secret
- Private
- Lock
- Radar detected
- Do not disturb
- Open quietly
