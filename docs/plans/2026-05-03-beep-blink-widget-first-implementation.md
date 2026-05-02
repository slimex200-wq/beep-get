# Beep/Blink Widget-First Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Recenter Beep-get around the widget-first Beep/Blink loop: coded signals, 2-second video teasers, direct widget actions, Reply Room, and cost-safe media retention.

**Architecture:** Keep the Expo/React Native app and existing widget module. Add the product model in small slices: pure domain limits first, app preview flow second, backend schema third, native widget integration fourth, then media upload/expiry. Supabase remains the metadata backend; media storage starts abstracted so Supabase Storage, Cloudflare R2, or Cloudflare Stream can be selected without rewriting UI logic.

**Tech Stack:** Expo SDK 54, React Native, TypeScript, Jest, Supabase, Expo modules, Android AppWidget, future iOS WidgetKit.

---

## References

- Product design: `docs/plans/2026-05-03-beep-blink-widget-first-design.md`
- Current project state: `PROJECT_STATE.md`
- Verification commands: `CHECKS.md`
- Product decisions: `DECISIONS.md`
- Brand direction: `.brand.json`
- Current app preview: `src/screens/HomeScreen.tsx`
- Widget module: `modules/beep-widget/`

## Milestone 0: Safety Baseline

### Task 0.1: Capture Current State

**Files:**
- Read: `PROJECT_STATE.md`
- Read: `CHECKS.md`
- Read: `package.json`

**Step 1: Check git state**

Run:

```powershell
git status --short --branch
```

Expected: branch is not `master` for implementation work. Any unrelated dirty build artifacts are noted and not staged.

**Step 2: Run baseline checks**

Run:

```powershell
npm run typecheck
npm test -- --runInBand
npx expo-doctor
```

Expected: all pass before behavior changes.

**Step 3: Commit only if a baseline doc update is needed**

Do not commit unrelated generated files.

## Milestone 1: Domain Model and Limits

### Task 1.1: Add Beep/Blink Domain Constants

**Files:**
- Create or modify: `src/lib/beepBlinkLimits.ts`
- Test: `__tests__/lib/beepBlinkLimits.test.ts`

**Step 1: Write failing tests**

Test these constraints:

- `BLINK_DURATION_SECONDS` is `2`.
- `BLINK_MAX_BYTES` matches the chosen MVP cap.
- `BLINK_DAILY_FREE_LIMIT` is explicit.
- `UNSAVED_MEDIA_TTL_HOURS` is `24`.
- Helper returns whether a media upload is allowed by byte size and duration.

**Step 2: Run the targeted test**

Run:

```powershell
npm test -- --runInBand __tests__/lib/beepBlinkLimits.test.ts
```

Expected: fails because module does not exist.

**Step 3: Implement constants and pure helpers**

Keep this pure TypeScript. Do not call Supabase or native modules.

**Step 4: Verify**

Run:

```powershell
npm test -- --runInBand __tests__/lib/beepBlinkLimits.test.ts
npm run typecheck
```

Expected: pass.

**Step 5: Commit**

Use the Lore protocol in `AGENTS.md`.

### Task 1.2: Add Beep/Blink Presentation Model

**Files:**
- Create or modify: `src/lib/beepBlinkPresentation.ts`
- Test: `__tests__/lib/beepBlinkPresentation.test.ts`

**Step 1: Write failing tests**

Cover:

- Plain Beep with code only.
- Blink teaser with thumbnail and three-frame strip.
- Expired unsaved Blink falls back to metadata-only Log.
- Saved Blink shows saved state.
- Widget summary never exposes full playback URL.

**Step 2: Implement a UI-agnostic presentation mapper**

Input should resemble backend message/media rows, but keep it local and typed.

**Step 3: Verify**

Run targeted tests and `npm run typecheck`.

**Step 4: Commit**

Commit only the presentation model and tests.

## Milestone 2: App IA and UI Preview

### Task 2.1: Replace Home Preview With Today/Reply Room Preview

**Files:**
- Modify: `src/screens/HomeScreen.tsx`
- Modify or create: `src/lib/uiPreview.ts`
- Test: existing Home/presentation tests if available

**Step 1: Define preview fixtures**

Add fixtures for:

- Incoming `8282` Beep.
- Incoming Blink with thumbnail strip.
- Saved Log.
- Expired unsaved Blink.

**Step 2: Update HomeScreen preview**

Home should communicate:

- Latest incoming signal.
- Direct action row: Confirm, Save, Reply.
- Small widget teaser preview, not a full-screen widget mockup.
- Entry point to Reply Room preview.

**Step 3: Preserve brand direction**

Stay close to Swiss Paper/pager visual language. Avoid generic card-heavy SaaS UI.

**Step 4: Verify**

Run:

```powershell
npm run typecheck
npm test -- --runInBand
```

If emulator is available, run Android preview and capture a screenshot.

**Step 5: Commit**

Commit UI preview changes separately from backend/schema changes.

### Task 2.2: Add Reply Room Screen

**Files:**
- Create: `src/screens/ReplyRoomScreen.tsx`
- Modify: navigation files under `src/navigation/` if present
- Test: presentation tests or screen-level smoke tests if existing patterns support them

**Step 1: Build static preview from fixtures**

The first version does not need real video upload. It should show:

- Sender.
- Code.
- 2-second Blink placeholder/player area.
- Confirm, Save, Reply preset actions.
- Metadata: received time and expiry.

**Step 2: Add deep-link-ready route shape**

Use a message ID route param even if preview mode uses fixtures.

**Step 3: Verify**

Run typecheck and tests.

**Step 4: Commit**

Commit screen/navigation changes.

## Milestone 3: Backend Schema and Services

### Task 3.1: Add Draft Supabase Migration for Media Metadata

**Files:**
- Create: `supabase/migrations/*_beep_blink_media.sql`
- Test: SQL review or local Supabase test if available

**Step 1: Create schema migration**

Add tables or columns for:

- `messages.kind`: `beep` or `blink`.
- `message_media`: message ID, provider, object key, thumbnail key, duration, byte size, processing status, expires_at.
- `code_presets`: user/relationship preset codes.
- `usage_limits` or daily usage counters.

**Step 2: Add RLS policy draft**

Only sender/receiver can read message metadata. Only owner can write usage counters through trusted paths or RPC.

**Step 3: Verify**

Run any existing migration lint/test command if present. If no local Supabase is configured, document the gap in the commit.

**Step 4: Commit**

Commit schema draft separately.

### Task 3.2: Add Media Storage Adapter Interface

**Files:**
- Create: `src/services/mediaStorage.ts`
- Create: `src/services/mediaStorage.supabase.ts` or `src/services/mediaStorage.mock.ts`
- Test: `__tests__/services/mediaStorage.test.ts`

**Step 1: Write failing tests**

Cover:

- Request upload target.
- Validate file metadata before upload.
- Return thumbnail/playback references without exposing permanent public URLs.
- Reject oversized or over-duration media.

**Step 2: Implement mock/local adapter**

Do not hardwire final provider yet.

**Step 3: Verify**

Run targeted tests, all tests, and typecheck.

**Step 4: Commit**

Commit adapter and tests.

## Milestone 4: Widget Integration

### Task 4.1: Extend Shared Widget Payload

**Files:**
- Modify: widget payload utilities under `modules/beep-widget/` and app bridge files
- Test: widget payload tests if present; add pure tests if missing

**Step 1: Add payload fields**

Add:

- code.
- sender label.
- time label.
- kind: `beep` or `blink`.
- thumbnail key or local thumbnail URI.
- strip frame references.
- action deep links.

**Step 2: Keep payload small**

Do not pass video files to the widget.

**Step 3: Verify**

Run:

```powershell
npm run typecheck
npm test -- --runInBand
npx expo prebuild --platform android --no-install
```

**Step 4: Commit**

Commit bridge/payload changes.

### Task 4.2: Android Widget Teaser QA

**Files:**
- Modify: Android widget native files under `modules/beep-widget/` or generated Android project as appropriate
- Test: Android build and emulator/manual screenshot

**Step 1: Render Blink teaser state**

Show thumbnail/strip and a play marker.

**Step 2: Wire actions**

Confirm/save/reply actions should map to existing bridge or deep-link stubs.

**Step 3: Verify**

Run:

```powershell
npm run typecheck
npm test -- --runInBand
npx expo prebuild --platform android --no-install
android\\gradlew.bat -p android :app:assembleDebug --console=plain
```

If an emulator is connected, install and capture widget QA evidence.

**Step 4: Commit**

Commit Android widget implementation.

## Milestone 5: Quotas, Expiry, and Cost Controls

### Task 5.1: Add Usage Limit Service

**Files:**
- Create: `src/services/usageLimits.ts`
- Test: `__tests__/services/usageLimits.test.ts`

**Step 1: Write failing tests**

Cover:

- Daily free Blink count.
- Relationship cooldown.
- Saved media does not bypass send limits.
- Limit errors are user-readable.

**Step 2: Implement pure limit evaluator**

Keep the first version local and testable.

**Step 3: Verify**

Run targeted tests and typecheck.

**Step 4: Commit**

Commit limits service.

### Task 5.2: Add Expiry Job Design or Stub

**Files:**
- Create: `docs/deploy/media-expiry.md`
- Optional create: `supabase/functions/expire-unsaved-media/`

**Step 1: Document expiry behavior**

State:

- Unsaved media expires after 24 hours.
- Metadata and thumbnail can remain.
- Original object is deleted.
- Saved media gets longer retention based on entitlement.

**Step 2: Implement only if Supabase project/env is ready**

If Supabase env is missing, do not fake a production function.

**Step 3: Verify**

Run docs review and any available function tests.

**Step 4: Commit**

Commit docs/stub separately.

## Milestone 6: Release Readiness

### Task 6.1: Update Project State and Checks

**Files:**
- Modify: `PROJECT_STATE.md`
- Modify: `CHECKS.md` if new commands are introduced

**Step 1: Update current status**

Document:

- Beep/Blink direction.
- Implemented slices.
- Remaining backend/provider decisions.
- iOS verification gap.

**Step 2: Verify full baseline**

Run:

```powershell
npm run typecheck
npm test -- --runInBand
npx expo-doctor
npx expo prebuild --platform android --no-install
android\\gradlew.bat -p android :app:assembleDebug --console=plain
```

**Step 3: Commit**

Commit docs/state update.

### Task 6.2: Open PR

**Files:**
- No file changes unless PR template exists.

**Step 1: Check branch**

Run:

```powershell
git status --short --branch
```

Expected: clean except known unrelated generated build artifacts if still present and intentionally unstaged.

**Step 2: Push branch**

Run:

```powershell
git push -u origin <branch>
```

**Step 3: Create PR**

Use a PR description that includes:

- Product loop summary.
- Verification evidence.
- iOS gap.
- Media provider decision status.

**Step 4: Wait for CI**

Do not merge until GitHub Actions `validate` passes.

## Recommended Execution Order

1. Milestone 1 domain constants and presentation model.
2. Milestone 2 UI preview and Reply Room.
3. Milestone 3 schema and storage adapter.
4. Milestone 5 usage limits and expiry design.
5. Milestone 4 widget payload and Android widget QA.
6. Milestone 6 release readiness and PR.

This order keeps the product loop reviewable before native/widget complexity expands.

## Open Decisions

- Final media provider for MVP: Supabase Storage for speed, or Cloudflare R2/Stream for cost predictability.
- Audio in Blink: off for MVP unless product testing proves it matters.
- Free quota: start with 10 Blinks/day/user or reduce to 5 for alpha.
- Saved media retention: 7 days free vs 30 days free.
- iOS widget implementation timing depends on macOS availability.
