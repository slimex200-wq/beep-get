# Handdrawn Beepy Asset Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the too-clean code-vector Beepy with a handdrawn, ink-textured mascot asset closer to the approved mockup A style.

**Architecture:** Keep the existing `BeepyMascot` component API, but render a generated PNG asset through React Native `Image`. Store the final app asset under `assets/brand/` and keep the current platform-auth/login layout unchanged.

**Tech Stack:** Expo, React Native, generated PNG asset, Jest, TypeScript.

---

### Task 1: Create Handdrawn Asset

**Files:**
- Create: `assets/brand/beepy-handdrawn.png`

**Steps:**
1. Generate a standalone Beepy mascot matching mockup A: handdrawn black ink, imperfect outline, cream face, red LED, small antenna, risograph/thermal paper texture.
2. Use chroma-key removal if needed so the asset can sit naturally on the cream login slip.
3. Validate the asset visually before wiring it into the app.

### Task 2: Wire Asset Into Login Mascot

**Files:**
- Modify: `src/components/BeepyMascot.tsx`

**Steps:**
1. Preserve the `size` and `style` props.
2. Render the generated asset with `Image`.
3. Keep accessibility label/role.
4. Avoid new dependencies.

### Task 3: Verification And PR

**Files:**
- Modify: `PROJECT_STATE.md`
- Modify: `.omx/state/login-mascot/ralph-progress.json`

**Steps:**
1. Run `npm run typecheck`.
2. Run `npm test -- --runInBand`.
3. Run `npx --yes expo-doctor`.
4. Capture Android emulator screenshot.
5. Record visual verdict and open PR.

