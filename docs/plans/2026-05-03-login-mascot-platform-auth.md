# Login Mascot Platform Auth Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add the approved BEEP-GET pager mascot to login and split Apple/Google start buttons by platform.

**Architecture:** Add a small reusable mascot component built from React Native views, a tiny pure platform-auth helper, and update login/first-run surfaces to use platform-specific CTAs without adding dependencies. Keep the login screen frameless, using the existing slip visual system.

**Tech Stack:** Expo, React Native, Jest, TypeScript.

---

### Task 1: Platform Auth Helper

**Files:**
- Create: `src/lib/platformAuth.ts`
- Test: `__tests__/lib/platformAuth.test.ts`

**Steps:**
1. Add a pure `getPlatformAuthProvider(platform)` helper.
2. Return `apple` for `ios`.
3. Return `google` for `android`, `web`, and other platforms.
4. Add Jest tests for iOS, Android, and fallback behavior.

### Task 2: Beepy Mascot

**Files:**
- Create: `src/components/BeepyMascot.tsx`

**Steps:**
1. Build the approved pager-creature mascot with React Native primitives.
2. Use existing `src/design/tokens.ts` colors.
3. Include antenna, red LED cheek, cream face, tiny eyes, and pager vents.
4. Keep the component dependency-free and scalable.

### Task 3: Login And First-Run UI

**Files:**
- Modify: `src/screens/AuthScreen.tsx`
- Modify: `src/screens/FirstRunScreen.tsx`
- Modify: `src/services/authService.ts`
- Modify: `__tests__/services/authService.test.ts`

**Steps:**
1. Rework `AuthScreen` into a frameless slip-login surface on the black stage.
2. Place the mascot above the BEEP-GET wordmark.
3. Show only the platform auth CTA: Apple on iOS, Google elsewhere.
4. Keep UI Preview available when Supabase is not configured.
5. Update FirstRun platform CTA labels to use the same helper.
6. Make Apple auth use Supabase OAuth instead of the empty id-token stub.
7. Update auth service tests.

### Task 4: Verification

**Files:**
- Modify: `PROJECT_STATE.md`
- Write: `.omx/state/login-mascot/ralph-progress.json`

**Steps:**
1. Run `npm run typecheck`.
2. Run `npm test -- --runInBand`.
3. Run `npx --yes expo-doctor`.
4. Capture Android emulator screenshot in UI preview mode.
5. Run visual verdict against the approved mascot/login direction.
6. Commit, push branch, open PR, and wait for CI.

