# BEEP-GET UI/UX Design System

> Version: Original Slip System v2
> Target: Expo / React Native mobile app
> Visual base: Swiss paper slip + private pager object
> Current decision: use the generated board direction, but make the pager/widget silhouette closer to the original user mockup.

---

## 1. Design Thesis

**BEEP-GET is not a chat app. It is a home-screen pager object for close friends.**

The app should feel like the inside of the widget. Every surface is a variation of the same paper slip system:

| Surface | Product metaphor | UI object |
|---|---|---|
| Widget | Incoming Slip | small paper ticket inside pager shell |
| Today | Signal desk | latest slip + compact queue |
| Reply Room | Signal detail | opened slip with Blink proof and quick reply |
| Send Beep | Outgoing Slip | reverse slip prepared for someone else’s widget |
| Send Blink | Signal camera slip | 2-second camera module embedded inside slip |
| People | Close circuit | relationship index, not contact list |
| Studio | Pager tuning desk | widget preview + permission/status checklist |
| Logs | Ticket ledger | saved slips and expired Blink metadata |

The original widget mockup remains the master component. The board UI direction remains the app direction. The implementation must combine both.

---

## 2. Visual Commitments

Keep:

- black stage background
- cream paper UI
- thin black grid lines
- strict internal ticket grid
- rounded pager/shell outer frame
- red notification LED/dot
- monospaced numeric hero code
- radar/dot-field ornaments
- mechanical rectangular action buttons
- short mixed Korean/English labels

Avoid:

- generic smartphone cards
- chat bubbles
- public feed affordances
- purple gradients
- glassmorphism
- cute/bubbly MZ typography
- over-translating product words
- free-text widget input

---

## 3. Language Rules

BEEP-GET should not be fully Koreanized. Product words remain English where they carry identity.

| Keep English | Koreanize |
|---|---|
| `BEEP-GET` | `오늘` |
| `Beep` | `도착한 Beep` |
| `Blink` | `도착한 Blink` |
| `OK` | `열기` |
| `NO.` | `저장` |
| `FROM.` / `TIME.` / `TO.` | `비프 보내기` |
| numeric codes: `8282`, `486`, `000`, `1004` | `기록`, `친구`, `스튜디오` |

Preferred labels:

```txt
도착한 Beep
도착한 Blink
보낼 Beep
보낼 Blink
신호 상세
민아 - NO 04
2초 Blink 있음
OK / 8282 / 열기 / 저장
Blink로 답장
비프 보내기
Blink 보내기
전송 중
보냄
앱 열기
```

---

## 4. Typography

### Target font direction

Do not use round/cute Korean fonts. Use a paper/editorial + technical mix.

| Role | Preferred production font | In this starter code |
|---|---|---|
| Korean display/title | MaruBuri SemiBold or equivalent Korean serif | platform serif fallback |
| English product word | Fraunces SemiBold Italic or warm editorial serif | serif italic fallback |
| UI Korean text | IBM Plex Sans KR / Pretendard | platform sans fallback |
| Code/time/NO | IBM Plex Mono / Space Mono | platform monospace fallback |

Font files are not included. Add them to `assets/fonts` and map them in `src/design/typography.ts` when ready.

---

## 5. Design Tokens

```ts
colors = {
  stage: '#050505',
  stageSoft: '#10100F',
  shell: '#12110F',
  shellEdge: '#282622',
  paper: '#F4EFE5',
  paperDeep: '#E8DDCD',
  paperWarm: '#FFF5E4',
  ink: '#0A0A0A',
  muted: '#6B6259',
  faint: '#BDB3A5',
  rule: 'rgba(10,10,10,0.22)',
  red: '#D8361E',
  redDeep: '#9E2115',
  lcd: '#DCEBCB',
  green: '#6F8762',
  white: '#F7F3EA',
}

radius = {
  pager: 34,
  pagerInner: 24,
  slip: 15,
  control: 8,
  button: 6,
}
```

---

## 6. Component System

### `PagerFrame`

The hardware-like shell. It is not a normal phone frame.

Anatomy:

1. rounded black/cream shell
2. inner cream screen well
3. bottom grille
4. red LED pair
5. tiny `BEEP-GET` emboss label

Variants:

- `dark`: black shell, main app screens
- `cream`: cream hardware shell, Studio/Logs special object mode

### `SlipFrame`

The master paper ticket component.

Anatomy:

1. title row
2. red status dot
3. thin rule
4. grid content
5. optional dashed/perforated edge

Variants:

- `incoming`
- `outgoing`
- `widget`
- `success`
- `danger`

### `SignalCode`

Hero numeric display. Must remain visually dominant.

Rules:

- use mono/tabular numerals
- codes use 68–88px in hero slips
- small widgets use 34–44px
- do not add emoji or decorative icon near code

### `MetaRow`

Ticket metadata row.

Examples:

```txt
FROM. 민아 - NO 04
TIME. 14:56
NOTE. 2초 Blink 있음
```

### `ActionButton`

Mechanical buttons.

Variants:

- `light`
- `dark`
- `danger`
- `success`
- `ghost`

### `BlinkStrip`

2-second Blink proof as 3 frames.

Rules:

- never make it look like a social video feed
- 3-frame strip is enough for preview
- full playback can happen in Reply Room only

### `DotRadar`

Close circuit and sending visualizer.

Use for:

- People screen
- sending state
- empty state
- relationship diagram

### `WidgetCard`

Home-screen widget UI states.

States:

- `empty`
- `incoming-beep`
- `incoming-blink`
- `sending`
- `sent`
- `failed`

### `TicketLogRow`

Ledger row for Logs.

Rules:

- saved Blink can display metadata
- expired Blink leaves metadata only
- no feed, no likes, no comments

### `CameraLensPanel`

Blink capture module.

Rules:

- integrated inside Outgoing Slip
- visible 2-second rule
- no generic media uploader look

---

## 7. Screen System

### 01 First Run

Purpose: make the product premise clear before sign-in.

Hierarchy:

1. BEEP-GET logo
2. `친한 친구끼리 쓰는 작은 호출기`
3. tiny incoming slip preview
4. Apple / Google sign in

### 02 Today

Purpose: latest signal first.

Hierarchy:

1. app header
2. latest incoming slip
3. quick actions
4. compact queue
5. pull-to-refresh note

### 03 Reply Room

Purpose: signal detail, not chat thread.

Hierarchy:

1. `NO. 8282` header
2. incoming slip
3. Blink strip
4. quick replies
5. `Blink로 답장`
6. `기록`

### 04 Send Beep

Purpose: prepare a code to appear on someone’s widget.

Hierarchy:

1. `TO. 민아 - NO 04`
2. hero code input
3. preset chips
4. optional memo
5. `비프 보내기`

### 05 Send Blink

Purpose: send a 2-second moment.

Hierarchy:

1. recipient stamp
2. camera/lens module
3. 2-second rule + timer
4. 3-frame preview
5. retake / send

### 06 People

Purpose: close circuit, not contact list.

Hierarchy:

1. radar/circuit visual
2. friend number cards
3. relationship chips
4. invite + quick send

### 07 Studio

Purpose: tune widget object.

Hierarchy:

1. permission/status checklist
2. widget preview
3. size toggles
4. skin selector
5. direct reply slots
6. test button

### 08 Logs

Purpose: slip ledger.

Hierarchy:

1. saved rows
2. expired metadata rows
3. note explaining Blink expiry

---

## 8. Interaction and Motion

Use short mechanical motion only.

| Interaction | Motion rule |
|---|---|
| new Beep | slip drops 8–12px, red dot pulses once |
| direct reply | button depresses 1px, state changes to `전송 중` |
| sent | LCD green flash, check mark, `보냄` |
| failed | red state, no full-screen shake |
| open Reply Room | slip expands into detail |
| Blink record | timer fills for exactly 2 seconds |
| save | small `기록` stamp appears |

---

## 9. Implementation Notes

This starter code uses pure React Native components and no navigation dependency. It is intentionally modular so it can be copied into an existing Expo app.

Recommended production work:

1. load actual fonts with `expo-font`
2. connect screens to React Navigation or Expo Router
3. replace mock data in `src/data/mockSignals.ts`
4. connect widget states to native widget extension data
5. implement Blink capture using Expo camera/media modules only in the app, never inside widget
6. move direct widget reply logic to native extension / notification action layer

---

## 10. What Not To Build

Do not build:

- a chat thread UI
- a feed
- comments / likes
- public discovery
- long onboarding carousel
- free-text widget reply
- camera capture inside widget
- generic dashboard cards
- reward screen as primary MVP
