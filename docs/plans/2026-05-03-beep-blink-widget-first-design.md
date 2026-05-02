# Beep/Blink Widget-First Product Design

> Draft design for the next Beep-get product loop.
> Date: 2026-05-03

## Positioning

Beep-get should not behave like a generic chat app. The product should feel like a private home-screen pager for the closest people in a user's life.

The widget is the primary surface. The app exists to set up relationships, view richer content, reply, save, and configure the widget.

## Core Vocabulary

- `Beep`: a short coded signal, such as `8282`, `1004`, or a saved phrase.
- `Blink`: a 2-second video signal attached to a Beep.
- `Log`: a saved Beep or Blink that the user intentionally keeps.
- `Widget`: the glanceable teaser surface.
- `Reply Room`: the app scene opened from a widget or notification to view and respond.
- `Studio`: the app area for widget skin, code presets, and display configuration.

## Product Loop

1. A user sends a Beep or Blink to a close friend.
2. The receiver's widget updates with a Swiss-paper pager card.
3. The widget shows the code, sender, time, and either a static teaser thumbnail or a three-frame Blink strip.
4. The receiver can use direct widget actions for simple responses, such as confirm, save, or favorite-code reply.
5. Tapping the teaser opens the app directly into the Reply Room, not a generic home screen.
6. The Reply Room plays the 2-second Blink and shows fast response actions.
7. Saved items become Logs. Unsaved media expires automatically.

## Why 2 Seconds

Two seconds should be treated as the product format, not a technical limitation.

- It feels like a signal, not a video message.
- It reduces recording anxiety.
- It helps storage and delivery costs stay bounded.
- It makes the widget teaser honest: the app opens for a quick emotional hit, not long-form viewing.
- It differentiates Beep-get from feed-based short video apps.

## Surface Responsibilities

### Widget

The widget should be a teaser and remote control, not a mini app.

- Show the latest incoming Beep/Blink.
- Show a Blink teaser as a still thumbnail or three-frame strip.
- Support fast actions: confirm, save, and reply with favorite codes.
- Open the Reply Room through deep links.
- Avoid free-text input, scrolling chat, and video playback inside the widget.

### App

The app should be the backstage and detail layer.

- Reply Room: view a received Blink, respond, save, or dismiss.
- Today: queue of current incoming Beeps/Blinks and unsaved items.
- Studio: widget skin, favorite code slots, display size preview, permissions.
- People: close-friend setup and relationship-specific presets.
- Logs: saved Beeps/Blinks, with media retention rules.

### Notifications

Notifications should handle quick text reply better than widgets can.

- Use actionable notification buttons for confirm/save/reply.
- Use platform-native text input reply where appropriate.
- Keep widget interactions focused on fixed actions and presets.

## Navigation Model

Recommended app tabs:

- `Today`: current inbox and latest incoming signal.
- `People`: close friends and pair/group setup.
- `Studio`: widget preview, skins, and favorite code slots.
- `Logs`: saved Beeps/Blinks.

Deep links should bypass tabs when context exists:

- `beepget://reply/:messageId`
- `beepget://compose?friendId=:friendId`
- `beepget://studio/widget`
- `beepget://logs/:messageId`

## Media Constraints

Default Blink constraints:

- Duration: 2 seconds.
- Audio: off by default for MVP.
- Resolution: target 480p or lower.
- FPS: target 15 fps.
- Size target: 300-700 KB per Blink after compression.
- Expiry: 24 hours for unsaved media.
- Save policy: saved media moves into longer retention.
- Preload policy: no widget or list autoplay/preload; load media only in detail view.

## Cost-Control Model

The product should be designed to fail closed when usage grows.

- Daily free send quota, starting around 10 Blinks per user.
- Relationship cooldown, starting around 30-60 seconds between Blinks to the same friend.
- Per-file size cap before upload.
- Server-side validation of duration and file size.
- Signed URL access for playback.
- Thumbnail and metadata remain after media expiry.
- Original media deletion for unsaved items after expiry.
- Premium storage for longer retention, not ads.

## Backend Direction

Short term:

- Supabase remains the app backend for auth, database, realtime, and metadata.
- Existing message concepts evolve into Beeps and optional media attachments.
- Supabase Storage may be acceptable for a small internal MVP only if strict quotas are enforced.

Medium term:

- Move Blink media to Cloudflare R2 or Cloudflare Stream if media usage becomes central.
- Keep Supabase as the source of truth for users, relationships, message metadata, and entitlements.
- Store only media object keys and signed playback references in the database.

## Data Model Direction

Core entities:

- `messages`: code, sender, receiver, status, expiry, saved state.
- `message_media`: media type, duration, storage provider, object key, thumbnail key, byte size, processing status.
- `code_presets`: user-owned or relationship-owned quick reply codes.
- `widget_state`: latest renderable state per user/device/widget instance where available.
- `usage_limits`: per-user daily send counts and media budget state.
- `logs`: saved message/media references or saved-state projection.

## MVP Scope

The next MVP should prove one loop:

1. Send a coded Beep with optional 2-second Blink.
2. Show the incoming teaser in app preview and Android widget preview.
3. Tap into Reply Room.
4. Confirm, save, or reply with a preset code.
5. Expire unsaved media.

Avoid for MVP:

- Public feed.
- Likes/comments.
- Long videos.
- Infinite scrolling discovery.
- Creator/celebrity accounts.
- Complex group chats.
- AI-generated replies.

## Success Metrics

Activation:

- Widget setup rate.
- First friend added.
- First Beep sent.
- First Blink sent.

Retention:

- Day 1 and Day 7 widget still installed.
- Beeps/Blinks sent per close relationship.
- Reply rate from widget or Reply Room.
- Save rate.

Cost health:

- Average media size.
- Media views per upload.
- Storage GB-days for unsaved media.
- Saved media conversion rate.

## Risks

- Widget platform constraints can make interaction feel weaker than expected.
- Media processing can add cost and implementation complexity.
- The product can drift into generic chat if free text becomes central.
- A feed can dilute the close-friend pager identity.
- iOS verification requires macOS, so Android-first validation must not be mistaken for platform parity.

## Design Decision

Proceed with a widget-first Beep/Blink loop:

- Keep the widget as the primary surface.
- Keep video to a branded 2-second Blink format.
- Use the app as Reply Room, Studio, People, and Logs.
- Use quotas and expiry as product rules from day one.
