# Login Mascot And Platform Auth Design

## Decision

Use mascot concept 1: a small pager creature with an antenna, cream face, black casing, and one red LED cheek. It should feel like a collectible BEEP-GET object, not a childish animal or generic emoji.

## Product Rules

- The real app must not render an extra iPhone/device frame inside the phone screen.
- The login surface can be a frameless cream paper slip on the black BEEP-GET stage.
- Keep the mascot mostly to login, empty, and failure states so the main signal screens stay precise and pager-like.
- Platform login CTA should be split: iOS shows Apple start, Android shows Google start. Web/other platforms may default to Google for local preview.

## Implementation Notes

- Build the mascot from React Native primitives so it is deterministic, lightweight, and easy to tune.
- Do not add image assets or new dependencies for this slice.
- Keep colors on the current neutral shell palette; avoid warm near-black values that read olive on Android screenshots.

