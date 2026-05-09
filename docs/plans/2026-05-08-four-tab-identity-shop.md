# Four Tab IA and Identity Shop Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Reduce BEEP-GET to a clearer four-tab app and turn `MY` into the place where users tune their widget, reply slots, account, and paid-looking identity packs.

**Architecture:** Keep the app widget-first: `TODAY` receives, `SEND` initiates, `PEOPLE` manages close friends, and `MY` owns personalization plus account controls. Reuse the existing Supabase v2 model where possible, but widen Beep preset tokens from numeric-only codes to short reply tokens so slots like `배고픔` and `집중중` can work without turning the app into chat. Keep purchases as locked/mock UI in this phase; real digital item purchase must later use StoreKit / Google Play Billing rather than a web checkout.

**Tech Stack:** Expo 54, React Native, React Navigation bottom tabs/native stack, Zustand stores, Supabase Postgres/RPC/Storage, Jest, Android emulator QA.

---

## Product Decisions

- Primary tabs become `TODAY / SEND / PEOPLE / MY`.
- Remove `STUDIO`, `LOGS`, and `ME` from the tab bar.
- Preserve `LogsScreen`, `StudioScreen`, `WidgetStatesScreen`, and `SettingsScreen` behavior by nesting or linking them from `MY`.
- `MY` is not a boring settings page. It is "My Beep Room": widget preview, skin shop, reply slots, archive, and account.
- Reply slots are user-editable short Beep tokens, not only numbers.
- Reply slots are not free chat. They should stay short, preconfigured, and tappable.
- Paid monetization should start with official identity packs, not seasonal/limited scarcity.
- Identity packs can include widget skin, font style, mascot/emote set, reply-slot visual style, and Blink frame style.
- No user-generated marketplace in the first release. Official packs only.
- No real IAP implementation in this PR. Show locked pack states and document the future StoreKit / Play Billing boundary.

## Target UX

User mental model:

1. `TODAY`: See what arrived, open Reply Room, save/archive.
2. `SEND`: Pick a close friend and send Beep/Blink.
3. `PEOPLE`: Add, invite, and manage close friends.
4. `MY`: Customize my widget, edit quick replies, review archive, manage account.

`MY` sections:

- `My Beep Slip`: Beep ID, nickname, active style, share Beep ID.
- `Widget Studio`: large live widget preview, separate Small and Medium preview cards.
- `Skin Shop`: official packs with free/unlocked/locked/equipped states.
- `Reply Slots`: edit up to 6 slots, mark up to 3 for widget.
- `Archive`: open saved logs.
- `Account`: privacy policy, web deletion request, logout, delete account.

## Reply Slot Rules

- Max saved slots: 6.
- Max widget slots: 3.
- Token length: 1-8 visible characters.
- Allowed content: numbers, Korean, English, common short symbols such as `!`, `?`, `+`, `-`.
- Block: newline, leading/trailing whitespace, URL-like strings, empty strings.
- Examples: `8282`, `OK`, `ㄱㄱ`, `배고픔`, `집중중`, `집가는중`, `오늘X`, `놀자`.
- Send path stores the token in `signals.code` for compatibility with existing message adapters.
- Optional label remains `code_presets.label`, but in the UI the token itself is the primary object.

## Identity Pack Rules

First pass pack catalog:

- `Classic Paper` - free default: cream slip, mono numbers, basic Beepy.
- `School Desk` - locked mock: doodle paper, pencil marks, sleepy/hungry/focus Beepy emotes.
- `LCD Green` - locked mock: retro LCD tint, digital token font, signal/battery/pager icons.
- `Cherry Dot` - locked mock: cream/red-dot skin, rounder typography, shy/waiting/sulking Beepy emotes.

Avoid first-release pack framing:

- No seasonal scarcity.
- No countdowns.
- No "limited drop" pressure.
- No web marketplace for in-app digital unlocks.

Policy references for future purchase work:

- Apple App Review Guidelines: https://developer.apple.com/app-store/review/guidelines/
- Google Play Payments policy: https://support.google.com/googleplay/android-developer/answer/10281818?hl=en-EN

---

### Task 1: Capture Navigation Baseline Tests

**Files:**
- Modify: `src/navigation/RootNavigator.tsx`
- Test: `__tests__/navigation/rootNavigator.test.tsx` or nearest existing navigation test file

**Step 1: Write the failing test**

Add a navigation test that renders an authenticated main navigator and asserts that the bottom tab labels are exactly:

```ts
["TODAY", "SEND", "PEOPLE", "MY"]
```

The test should also assert that `STUDIO`, `LOGS`, and duplicate `ME` tab labels are not present as primary tabs.

**Step 2: Run the test to verify it fails**

Run:

```powershell
npm.cmd test -- --runInBand rootNavigator
```

Expected: fail because the current app still exposes 6 tabs.

**Step 3: Implement the minimal navigation change**

Update `MainTabParamList` and `tabLabels` so primary tabs are:

```ts
export type MainTabParamList = {
  Today: undefined;
  Compose: undefined;
  People: undefined;
  My: undefined;
};
```

Order the screens as `Today`, `Compose`, `People`, `My`.

**Step 4: Run the test to verify it passes**

Run:

```powershell
npm.cmd test -- --runInBand rootNavigator
```

Expected: pass.

**Step 5: Commit**

```powershell
git add src/navigation/RootNavigator.tsx __tests__/navigation/rootNavigator.test.tsx
git commit -m "Simplify BEEP-GET to four primary tabs"
```

---

### Task 2: Build `MY` as My Beep Room

**Files:**
- Create: `src/screens/MyScreen.tsx`
- Modify: `src/navigation/RootNavigator.tsx`
- Reuse: `src/screens/StudioScreen.tsx`
- Reuse: `src/screens/LogsScreen.tsx`
- Reuse: `src/screens/SettingsScreen.tsx`
- Reuse: `src/components/WidgetCard.tsx`

**Step 1: Write the failing screen test**

Add a test that renders `MyScreen` with preview/auth store data and expects these section labels:

```ts
[
  "MY BEEP ROOM",
  "WIDGET STUDIO",
  "SKIN SHOP",
  "REPLY SLOTS",
  "ARCHIVE",
  "ACCOUNT",
]
```

**Step 2: Run the test to verify it fails**

Run:

```powershell
npm.cmd test -- --runInBand MyScreen
```

Expected: fail because `MyScreen` does not exist.

**Step 3: Create `MyScreen`**

Implement a slip-first screen using `AppSurface`, `HeaderBar`, `WidgetCard`, and existing `ActionButton`.

Screen layout:

- Header title: `MY BEEP ROOM`.
- Top slip: Beep ID, nickname, active skin.
- Widget Studio panel: show a large current widget preview and two tappable preview cards labelled `SMALL` and `MEDIUM`.
- Skin Shop panel: show pack cards from a local mock catalog. Free/equipped pack is active; paid packs are locked.
- Reply Slots panel: show current slots and an `EDIT SLOTS` action.
- Archive panel: `OPEN ARCHIVE` navigates to `Logs`.
- Account panel: `OPEN ACCOUNT` navigates to account controls.

**Step 4: Decide nested navigation shape**

Use stack/modal routes, not extra bottom tabs:

```ts
RootStackParamList = {
  Logs: undefined;
  Studio: undefined;
  Account: undefined;
  WidgetStates: { size?: "small" | "medium" } | undefined;
}
```

If duplicating `StudioScreen`/`SettingsScreen` feels clumsy, move their reusable sections into components first.

**Step 5: Run tests**

Run:

```powershell
npm.cmd test -- --runInBand MyScreen rootNavigator
```

Expected: pass.

**Step 6: Commit**

```powershell
git add src/screens/MyScreen.tsx src/navigation/RootNavigator.tsx __tests__/screens/MyScreen.test.tsx
git commit -m "Make MY the widget and identity room"
```

---

### Task 3: Widen Beep Tokens Beyond Numeric Codes

**Files:**
- Modify: `src/lib/constants.ts`
- Modify: `src/services/messageService.ts`
- Modify: `src/services/dictionaryService.ts`
- Modify: `src/lib/widgetActions.ts`
- Create: `supabase/migrations/YYYYMMDDHHMMSS_widen_beep_tokens.sql`
- Test: `__tests__/services/messageService.test.ts`
- Test: `__tests__/services/dictionaryService.test.ts`
- Test: `__tests__/lib/widgetActions.test.ts`

**Step 1: Write validation tests**

Add passing-token cases:

```ts
["8282", "OK", "ㄱㄱ", "배고픔", "집중중", "오늘X"]
```

Add rejected-token cases:

```ts
["", "         ", "집중중집중중집", "https://x.y", "line\nbreak"]
```

**Step 2: Run tests to verify failure**

Run:

```powershell
npm.cmd test -- --runInBand messageService dictionaryService widgetActions
```

Expected: fail because current validation and widget URL builder only accept digits.

**Step 3: Add shared token validation helper**

Create or reuse a small helper, for example:

```ts
export const MAX_BEEP_TOKEN_LENGTH = 8;

export function normalizeBeepToken(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function validateBeepToken(value: string) {
  const token = normalizeBeepToken(value);
  if (!token) return { valid: false, error: "Enter a short Beep." };
  if (token.length > MAX_BEEP_TOKEN_LENGTH) return { valid: false, error: "Keep it to 8 characters or less." };
  if (/[\r\n\t]/.test(value)) return { valid: false, error: "Keep it to one line." };
  if (/https?:\/\/|www\./i.test(token)) return { valid: false, error: "Links are not Beeps." };
  return { valid: true, token };
}
```

Use this in send, quick reply, and dictionary/preset creation.

**Step 4: Update widget URL generation**

Remove the numeric-only filter in `buildWidgetActionUrls`:

```ts
.filter((code) => validateBeepToken(code).valid)
```

Keep `encodeURIComponent` and `parseWidgetActionUrl` as the safety boundary.

**Step 5: Add Supabase migration**

Drop old numeric-only constraints and add short-token constraints:

```sql
alter table public.code_presets
drop constraint if exists code_presets_code_format;

alter table public.code_presets
add constraint code_presets_code_token
check (
  char_length(btrim(code)) between 1 and 8
  and code !~ '[[:cntrl:]]'
  and code !~* '(https?://|www\.)'
);

alter table public.signals
drop constraint if exists signals_code_format;

alter table public.signals
add constraint signals_code_token
check (
  char_length(btrim(code)) between 1 and 8
  and code !~ '[[:cntrl:]]'
  and code !~* '(https?://|www\.)'
);
```

**Step 6: Run tests**

Run:

```powershell
npm.cmd test -- --runInBand messageService dictionaryService widgetActions
```

Expected: pass.

**Step 7: Supabase dry run**

Run only after linking the clean worktree to `beep-get-prod`:

```powershell
$env:SUPABASE_DB_PASSWORD = (Get-Content -Raw supabase\.temp\db-password.txt).Trim()
npm.cmd exec supabase -- db lint --linked
npm.cmd exec supabase -- db push --dry-run --linked
```

Expected: no lint errors; dry-run lists only the new token migration.

**Step 8: Commit**

```powershell
git add src supabase/migrations __tests__
git commit -m "Allow short Beep tokens in reply slots"
```

---

### Task 4: Add Reply Slot Editor UX

**Files:**
- Create: `src/screens/ReplySlotsScreen.tsx`
- Modify: `src/navigation/RootNavigator.tsx`
- Modify: `src/stores/dictionaryStore.ts`
- Modify: `src/services/dictionaryService.ts`
- Test: `__tests__/screens/ReplySlotsScreen.test.tsx`
- Test: `__tests__/services/dictionaryService.test.ts`

**Step 1: Write the failing tests**

Test behaviors:

- Empty state shows default suggestions.
- User can add `배고픔`.
- User cannot add more than 6 slots.
- User cannot mark more than 3 widget slots.
- Removing a slot updates the list.

**Step 2: Run tests to verify failure**

Run:

```powershell
npm.cmd test -- --runInBand ReplySlotsScreen dictionaryService
```

Expected: fail because the editor does not exist.

**Step 3: Extend dictionary service for slot metadata**

Return and update `is_widget_slot` and `sort_order` from `code_presets`.

Add service functions:

```ts
addReplySlot(userId, token, label, isWidgetSlot)
updateReplySlot(entryId, token, label, isWidgetSlot)
deleteEntry(entryId)
```

Keep old dictionary functions as wrappers if other screens still call them.

**Step 4: Create editor screen**

UI shape:

- Header: `REPLY SLOTS`.
- Helper copy: `Short signals, not chat. Pick up to 3 for your widget.`
- Slot rows: token, optional label, widget dot/toggle, delete.
- Add input: short token field and optional label field.
- Suggestions: `OK`, `8282`, `배고픔`, `집중중`, `ㄱㄱ`, `오늘X`.

**Step 5: Wire `MY` to the editor**

`EDIT SLOTS` navigates to `ReplySlots`.

**Step 6: Run tests**

Run:

```powershell
npm.cmd test -- --runInBand ReplySlotsScreen dictionaryService
```

Expected: pass.

**Step 7: Commit**

```powershell
git add src __tests__
git commit -m "Let users edit short reply slots"
```

---

### Task 5: Make Widget Preview Distinguish Small and Medium

**Files:**
- Modify: `src/components/WidgetCard.tsx`
- Modify: `src/screens/MyScreen.tsx`
- Modify: `src/screens/WidgetStatesScreen.tsx`
- Test: `__tests__/components/WidgetCard.test.tsx`

**Step 1: Write failing preview tests**

Assert:

- Small preview has no action chips.
- Small Blink preview prioritizes one thumbnail.
- Medium preview shows up to 3 action chips and 3-frame Blink strip when present.

**Step 2: Run test to verify failure**

Run:

```powershell
npm.cmd test -- --runInBand WidgetCard
```

Expected: fail if current small/medium distinction is weak.

**Step 3: Update preview visuals**

Small:

- Compact slip.
- One thumbnail or simple code.
- No reply buttons.
- Label copy: `Small = glance`.

Medium:

- Larger slip.
- 3-frame strip when Blink.
- Reply chips from widget slots.
- Label copy: `Medium = react`.

**Step 4: Run tests**

Run:

```powershell
npm.cmd test -- --runInBand WidgetCard
```

Expected: pass.

**Step 5: Commit**

```powershell
git add src/components/WidgetCard.tsx src/screens/MyScreen.tsx src/screens/WidgetStatesScreen.tsx __tests__/components/WidgetCard.test.tsx
git commit -m "Clarify small and medium widget previews"
```

---

### Task 6: Add Locked Identity Pack Shop UI

**Files:**
- Create: `src/lib/identityPacks.ts`
- Create: `src/components/IdentityPackCard.tsx`
- Modify: `src/screens/MyScreen.tsx`
- Test: `__tests__/lib/identityPacks.test.ts`
- Test: `__tests__/components/IdentityPackCard.test.tsx`

**Step 1: Write catalog tests**

Assert the first catalog contains:

```ts
["classic-paper", "school-desk", "lcd-green", "cherry-dot"]
```

Assert there are no seasonal/limited/drop labels in this catalog.

**Step 2: Run tests to verify failure**

Run:

```powershell
npm.cmd test -- --runInBand identityPacks IdentityPackCard
```

Expected: fail because catalog/card do not exist.

**Step 3: Create mock catalog**

Example shape:

```ts
export type IdentityPack = {
  slug: string;
  name: string;
  priceLabel: "FREE" | "LOCKED";
  includes: string[];
  previewTokens: string[];
};
```

Use includes like:

- `Widget skin`
- `Font style`
- `Beepy emotes`
- `Reply slot style`
- `Blink frame`

**Step 4: Create card component**

Use paper-slip style, not app-store product cards.

Locked card button copy:

```ts
"COMING LATER"
```

Do not add real purchase buttons yet.

**Step 5: Wire into `MY`**

Show `Classic Paper` as equipped/free and paid packs as locked.

**Step 6: Run tests**

Run:

```powershell
npm.cmd test -- --runInBand identityPacks IdentityPackCard MyScreen
```

Expected: pass.

**Step 7: Commit**

```powershell
git add src __tests__
git commit -m "Frame skins as official identity packs"
```

---

### Task 7: Android UI Preview QA

**Files:**
- No source changes unless QA finds issues.
- Evidence: screenshots under `C:/Users/slime/AppData/Local/Temp/`.

**Step 1: Run standard checks**

```powershell
npm.cmd run typecheck
npm.cmd test -- --runInBand
npx.cmd --yes expo-doctor
git diff --check
```

Expected: all pass; CRLF warnings are acceptable if no whitespace errors appear.

**Step 2: Build/install Android debug**

Preferred:

```powershell
npx.cmd expo prebuild --platform android --no-install
android\gradlew.bat -p android :app:assembleDebug -PreactNativeArchitectures=x86_64 --console=plain --no-daemon
```

If Windows native build friction appears, use the existing proven embedded-JS debug APK workflow documented in `PROJECT_STATE.md`.

**Step 3: Emulator checks**

On `emulator-5554`, verify:

- Primary tab labels show `TODAY / SEND / PEOPLE / MY`.
- `MY` opens My Beep Room.
- Small and Medium previews are visually distinct.
- `Reply Slots` can show Korean text tokens.
- Locked identity packs read as cosmetic, not predatory.
- `Archive` opens Logs.
- `Account` opens logout/delete controls.
- Crash buffer is empty.

**Step 4: Capture screenshots**

Save at least:

- `C:/Users/slime/AppData/Local/Temp/beep-get-four-tab-my-room.png`
- `C:/Users/slime/AppData/Local/Temp/beep-get-reply-slots-editor.png`
- `C:/Users/slime/AppData/Local/Temp/beep-get-identity-pack-shop.png`

**Step 5: Commit QA fixes if needed**

Use one small commit per fix.

---

### Task 8: Release Notes and PR

**Files:**
- Modify: `PROJECT_STATE.md`
- Optional: `.omx/notepad.md`

**Step 1: Update project state**

Record:

- 4-tab IA decision.
- `MY` as personalization/account hub.
- Reply slots now support short tokens.
- Identity shop is mock/locked only; no IAP yet.
- Remaining IAP implementation is future work.

**Step 2: Run final checks**

```powershell
npm.cmd run typecheck
npm.cmd test -- --runInBand
npx.cmd --yes expo-doctor
git status -sb --untracked-files=all
```

**Step 3: Push PR branch**

```powershell
git push -u origin codex/four-tab-identity-shop
```

**Step 4: Create PR**

PR body must include:

- What changed.
- Local verification.
- Android screenshot paths.
- Supabase migration status.
- Explicit gaps: real IAP, iOS, store submission.

**Step 5: Wait for CI before merge**

```powershell
gh pr checks <number> --watch --interval 15
```

Merge only after `validate` passes.

---

## Design Handoff for Office Session

Bring these decisions into visual design:

- `MY` should feel like a private desk/pager room, not settings.
- Skin Shop should feel like a sticker/sample book, not a commerce grid.
- Locked packs should be quiet: `COMING LATER`, no price pressure.
- Reply slots need to look tactile: small labels, stamp/chip buttons, up to 3 widget dots.
- Small widget preview should communicate "glance".
- Medium widget preview should communicate "react".
- Official paid packs should include mascot emotes and font/skin identity, not seasonal scarcity.

Recommended first mockup frames:

- `MY / My Beep Room`
- `MY / Reply Slots Editor`
- `MY / Identity Pack Detail`
- `Widget Small / Classic Paper`
- `Widget Medium / School Desk`
- `Widget Medium / Cherry Dot`

## Completion Criteria

- Primary tabs are reduced to 4.
- `MY` replaces the need for separate `STUDIO`, `LOGS`, and `ME` tabs.
- Korean/English short reply tokens work in app validation, Supabase constraints, and widget action URLs.
- Identity pack UI exists as locked/mock and does not imply external web purchase.
- Android emulator visual QA confirms the new IA is understandable.
- PR passes CI and is merged only after `validate` succeeds.
