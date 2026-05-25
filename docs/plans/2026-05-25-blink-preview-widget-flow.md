# Blink Preview Widget Flow Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make Blink sending behave like the product promise: capture a short video, preview three real frames, send the video plus teaser frames, and let the widget show those frames before the receiver opens the full video.

**Architecture:** Keep the existing Supabase media/storage boundary and WidgetKit payload shape. Add a small app-side captured Blink draft state so `SendBlinkScreen` can render generated local teaser frames before upload, then reuse `sendBlinkVideo` for upload/finalize.

**Tech Stack:** Expo React Native, `expo-camera`, `expo-video-thumbnails`, Zustand stores, Jest, WidgetKit App Group payloads.

---

### Task 1: Lock The Send Blink Draft Contract

**Files:**
- Modify: `src/screens/SendSignalScreen.tsx`
- Modify: `src/screens/SendBlinkScreen.tsx`
- Test: `__tests__/screens/SendBlinkScreen.test.tsx`

**Steps:**
1. Add a failing render test that passes three frame URIs into `SendBlinkScreen` and expects three image frames instead of fallback slots.
2. Add a failing interaction test that verifies `RETAKE` is disabled before capture and calls the reset handler after a draft exists.
3. Implement `previewFrameUris` and `hasCapturedBlink` props in `SendBlinkScreen`.
4. Pass `previewFrameUris` to `BlinkStrip` and gate `RETAKE` on `hasCapturedBlink`.
5. Run the focused screen test.

### Task 2: Capture Before Send

**Files:**
- Modify: `src/screens/SendSignalScreen.tsx`
- Test: `__tests__/screens/SendSignalScreen.blink.test.tsx`

**Steps:**
1. Add a failing unit/integration test around the helper that creates a Blink draft from a captured camera URI and teaser generator.
2. Extract a small `createBlinkDraft` helper if needed so frame generation is testable without mounting native camera.
3. Change Blink action flow from immediate record-upload to two phases: first press records and generates local preview frames; second press uploads existing draft.
4. Make `RETAKE` clear video URI, teaser frames, and memo only when explicitly requested.
5. Run the focused Blink send tests.

### Task 3: Widget-Safe Frame Persistence

**Files:**
- Modify: `src/services/messageService.ts`
- Modify: `src/services/widgetService.ts`
- Test: `__tests__/services/widgetService.test.ts`

**Steps:**
1. Add a failing test proving signed Blink frame URLs are not treated as durable widget frame payloads after expiry.
2. Decide the minimal local-safe payload for build 27: keep demo/data URI frames widget-safe, and avoid promising durable real remote frames until app-side local caching is added.
3. If local caching is added in this pass, write the failing test for cached file/data URI frame payloads first.
4. Verify widget payload tests and iOS widget source tests.

### Task 4: Verification

**Commands:**
- `npm.cmd test -- --runInBand <focused tests>`
- `npm.cmd run typecheck`
- `npm.cmd test -- --runInBand`
- `git diff --check`

**Platform gap:** Windows cannot compile Swift/WidgetKit locally. iOS native verification needs EAS or macOS.
