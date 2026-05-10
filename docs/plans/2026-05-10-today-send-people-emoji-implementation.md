# Today Send People Emoji UX Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Strengthen `TODAY`, `SEND`, and `PEOPLE` so they feel like core product loops, and replace monetization-facing Beepy emoji placeholders with a real asset pipeline boundary.

**Architecture:** Keep the existing four-tab React Navigation structure. Add small reusable product components for signal slots, friend pulse rows, recent send combos, and asset-backed emoji previews instead of rewriting the whole app. Preserve the widget-first slip model and use mock/preview fallbacks where backend tables are not ready.

**Tech Stack:** Expo 54, React Native, React Navigation, Zustand stores, Supabase service adapters, Jest, Android emulator QA.

---

### Task 1: Lock The Four-Tab Mental Model

**Files:**
- Test: `__tests__/navigation/rootNavigator.test.tsx`
- Read: `src/navigation/RootNavigator.tsx`

**Step 1: Write or extend the navigation test**

Assert that authenticated primary tabs are exactly:

```ts
["TODAY", "SEND", "PEOPLE", "MY"]
```

Also assert that `LOGS`, `STUDIO`, and `ACCOUNT` are not primary tab labels.

**Step 2: Run the test**

```powershell
npm.cmd test -- --runInBand rootNavigator
```

Expected: pass. If no matching test file exists, create it with the nearest existing navigator test harness.

**Step 3: Commit**

```powershell
git add __tests__/navigation/rootNavigator.test.tsx
git commit -m "Protect the four-tab product model"
```

---

### Task 2: Add Shared Signal Slot Components

**Files:**
- Create: `src/components/SignalSlotChip.tsx`
- Create: `src/components/SignalSlotRail.tsx`
- Test: `__tests__/components/SignalSlotRail.test.tsx`

**Step 1: Write the failing component test**

Render a rail with slots:

```ts
["8282", "배고픔", "집중중"]
```

Assert all labels render and tapping one calls `onSelect("배고픔")`.

**Step 2: Run the test**

```powershell
npm.cmd test -- --runInBand SignalSlotRail
```

Expected: fail because the component does not exist.

**Step 3: Implement the rail**

Use `ActionButton` styling rules where possible, but make the chip compact enough for `TODAY` and `SEND`.

Props:

```ts
type SignalSlotRailProps = {
  slots: string[];
  selected?: string;
  onSelect: (slot: string) => void;
};
```

**Step 4: Run the test**

```powershell
npm.cmd test -- --runInBand SignalSlotRail
```

Expected: pass.

**Step 5: Commit**

```powershell
git add src/components/SignalSlotChip.tsx src/components/SignalSlotRail.tsx __tests__/components/SignalSlotRail.test.tsx
git commit -m "Create reusable signal slot rail"
```

---

### Task 3: Upgrade TODAY Into Signal Desk

**Files:**
- Modify: `src/screens/TodayScreen.tsx`
- Create: `src/components/FriendPulseRow.tsx`
- Test: `__tests__/screens/TodayScreen.test.tsx`

**Step 1: Write the failing screen expectations**

In preview/auth store state, assert Today renders:

```ts
["INCOMING NOW", "QUICK REPLY", "TODAY QUEUE", "FRIEND PULSE", "WIDGET MIRROR"]
```

**Step 2: Run the test**

```powershell
npm.cmd test -- --runInBand TodayScreen
```

Expected: fail until sections are added.

**Step 3: Implement the sections**

- Add `INCOMING NOW` label above the current hero slip.
- Replace hardcoded quick row with `SignalSlotRail` where possible.
- Keep `OK / 8282 / OPEN` available as fallback slots.
- Add `FriendPulseRow` using friends and recent received signals.
- Add a small `Widget Mirror` panel that reuses existing widget preview data or a safe preview fallback.

**Step 4: Run focused tests**

```powershell
npm.cmd test -- --runInBand TodayScreen SignalSlotRail
```

Expected: pass.

**Step 5: Commit**

```powershell
git add src/screens/TodayScreen.tsx src/components/FriendPulseRow.tsx __tests__/screens/TodayScreen.test.tsx
git commit -m "Turn Today into a signal desk"
```

---

### Task 4: Upgrade SEND Into Signal Deck

**Files:**
- Modify: `src/screens/SendSignalScreen.tsx`
- Modify: `src/screens/SendBeepScreen.tsx`
- Modify: `src/screens/SendBlinkScreen.tsx`
- Create: `src/components/FriendPickerStrip.tsx`
- Create: `src/components/RecentSignalCombos.tsx`
- Test: `__tests__/screens/SendSignalScreen.test.tsx`

**Step 1: Write the failing expectations**

Assert Send renders:

```ts
["TO STRIP", "SIGNAL TYPE", "SLOT DECK", "RECENT COMBOS"]
```

**Step 2: Run the test**

```powershell
npm.cmd test -- --runInBand SendSignalScreen
```

Expected: fail until the deck structure exists.

**Step 3: Implement friend selection**

Move recipient selection into `SendSignalScreen` state:

- If route params include a friend, preselect that friend.
- Else select the first friend.
- Allow changing recipient through `FriendPickerStrip`.

**Step 4: Implement slots and recent combos**

- Use `SignalSlotRail` for user/default slots.
- Add `RecentSignalCombos` with safe local preview data first.
- When a combo is tapped, set recipient and code/token.

**Step 5: Run focused tests**

```powershell
npm.cmd test -- --runInBand SendSignalScreen SignalSlotRail
```

Expected: pass.

**Step 6: Commit**

```powershell
git add src/screens/SendSignalScreen.tsx src/screens/SendBeepScreen.tsx src/screens/SendBlinkScreen.tsx src/components/FriendPickerStrip.tsx src/components/RecentSignalCombos.tsx __tests__/screens/SendSignalScreen.test.tsx
git commit -m "Turn Send into a signal deck"
```

---

### Task 5: Upgrade PEOPLE Into Close Circuit

**Files:**
- Modify: `src/screens/PeopleScreen.tsx`
- Modify: `src/components/FriendCard.tsx`
- Create: `src/components/MyBeepIdSlip.tsx`
- Test: `__tests__/screens/PeopleScreen.test.tsx`

**Step 1: Write the failing expectations**

Assert People renders:

```ts
["MY BEEP ID", "CLOSE CIRCUIT", "INVITE SLIP"]
```

Assert a friend card exposes quick actions:

```ts
["SEND BEEP", "SEND BLINK", "PIN"]
```

**Step 2: Run the test**

```powershell
npm.cmd test -- --runInBand PeopleScreen
```

Expected: fail until new sections/actions exist.

**Step 3: Add My Beep ID slip**

Show current user Beep ID and a share/copy action. If native share/copy is not already available, make the action a non-destructive placeholder and document the native boundary.

**Step 4: Improve friend cards**

Each friend card should show:

- nickname
- relationship preset
- last signal summary if available
- quick send action
- pin-to-widget affordance

Do not implement destructive remove/mute actions in this task.

**Step 5: Run focused tests**

```powershell
npm.cmd test -- --runInBand PeopleScreen
```

Expected: pass.

**Step 6: Commit**

```powershell
git add src/screens/PeopleScreen.tsx src/components/FriendCard.tsx src/components/MyBeepIdSlip.tsx __tests__/screens/PeopleScreen.test.tsx
git commit -m "Make People feel like a close circuit"
```

---

### Task 6: Create The Beepy Emoji Asset Boundary

**Files:**
- Create: `assets/brand/emotes/README.md`
- Create: `src/design/identityPacks.ts`
- Modify: `src/screens/MyScreen.tsx`
- Test: `__tests__/design/identityPacks.test.ts`

**Step 1: Write the failing catalog test**

Assert each pack has at least 5 expression definitions:

```ts
["classic-paper", "school-desk", "cherry-dot", "photo-booth-blink", "night-signal"]
```

Each expression must include:

```ts
{
  id: string;
  label: string;
  source: "placeholder" | "asset";
  asset?: ImageSourcePropType;
}
```

**Step 2: Run the test**

```powershell
npm.cmd test -- --runInBand identityPacks
```

Expected: fail until catalog exists.

**Step 3: Move pack metadata**

Move pack titles, descriptions, prices, tones, slots, and expression metadata out of `MyScreen.tsx` into `src/design/identityPacks.ts`.

**Step 4: Keep current placeholders**

Keep the current coded emote renderer as `source: "placeholder"` until real `PNG` or `WebP` assets are generated.

**Step 5: Document asset requirements**

In `assets/brand/emotes/README.md`, include:

- image format
- naming convention
- transparent background requirement
- style prompt skeleton from the design doc
- expression matrix per pack

**Step 6: Run tests**

```powershell
npm.cmd test -- --runInBand identityPacks MyScreen
```

Expected: pass.

**Step 7: Commit**

```powershell
git add assets/brand/emotes/README.md src/design/identityPacks.ts src/screens/MyScreen.tsx __tests__/design/identityPacks.test.ts
git commit -m "Define the Beepy emoji asset boundary"
```

---

### Task 7: Android Visual QA

**Files:**
- Update if needed: `PROJECT_STATE.md`
- Evidence: `.omx/state/today-send-people-emoji/`

**Step 1: Run standard verification**

```powershell
npm.cmd run typecheck
npm.cmd test -- --runInBand
npx.cmd --yes expo-doctor
git diff --check
```

Expected: all pass, with only known CRLF warnings if present.

**Step 2: Build Android debug APK**

```powershell
npx.cmd expo export:embed --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res
android\gradlew.bat -p android :app:assembleDebug -PreactNativeArchitectures=x86_64 --console=plain --no-daemon
```

Expected: pass.

**Step 3: Emulator tap QA**

Install and verify:

```powershell
adb -s emulator-5554 install -r android/app/build/outputs/apk/debug/app-debug.apk
```

Capture screenshots for:

- `TODAY` signal desk
- `SEND` signal deck
- `PEOPLE` close circuit
- `MY` pack detail after emoji boundary still renders

**Step 4: Check crash buffer**

```powershell
adb -s emulator-5554 logcat -b crash -d
```

Expected: no app crash.

**Step 5: Update project state**

Update `PROJECT_STATE.md` with the final verification evidence and remaining gaps.

**Step 6: Commit**

```powershell
git add PROJECT_STATE.md .omx/state/today-send-people-emoji
git commit -m "Record Today Send People emoji QA evidence"
```

---

## PR And Merge

Open a PR:

```powershell
git push -u origin codex/today-send-people-emoji
gh pr create --base master --head codex/today-send-people-emoji --title "Strengthen Today Send People and Beepy emoji system" --body-file <body>
```

Merge only after CI passes.

Known gaps to report:

- Real final Beepy emote assets are not included unless a designer or image generation pass provides production images.
- iOS runtime remains unverified without macOS.
- StoreKit / Google Play Billing remains out of scope.
