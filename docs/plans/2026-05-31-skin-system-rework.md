# Skin System Rework + Signal/Friend Badges (2026-05-31)

> v2 — Codex adversarial review(2026-05-31) 반영: identity-main을 테마 축소보다 **먼저**, active 저장은 신규 컬럼, DESIGN.md SSoT 재작성 필수.

## 배경

beep-get에 "스킨" 개념이 두 갈래로 분리·중복돼 있다.

- **palette** (`src/design/skinPacks.ts` + `src/design/appTheme.ts`): 색상 테마 5종
  (Classic Paper / Soft Pager / Glass Mode / Cyber Neon / Retro Future).
  MY 메인 "Skin Packs" picker가 이것. PR #95에서 전면화, PR #96에서 base 명칭 통일.
- **identity pack** (`src/design/identityPacks.ts`): 위젯 꾸밈 5종
  (Classic Paper / School Desk / Cherry Dot / Photo Booth Blink / Night Signal)
  + emote PNG 30종 + 민아 person strip. IAP 상품(`identity_pack_entitlements`),
  현재 `WidgetStatesScreen`에서만 picker 노출.

두 시스템은 `appTheme.ts`의 `skinAliases`로 매핑돼 있다(`school-desk→neumorphism` 등).

**핵심 결합(Codex):** `useAppPalette()`(`appTheme.ts:116-140`)가 `useSkinStore.activeSkinSlug`를
직접 읽고, 그 slug가 동시에 MY picker active 상태이자 apply 타겟(`MyScreen.tsx:61-70,112-139`).
즉 palette 렌더·MY 선택·apply가 단일 slug에 결합. 시그니처 유지만으로 안전하지 않다.

## 사용자 의도 (2026-05-31)

- **시스템 테마 = light/dark 2개만.** palette 5종은 과한 설계.
- **identity pack = 위젯 스킨이자 메인.** 사용자가 공들인 것(이모티콘/여자)이 전면.
- 빨간 점: **Today 탭 = unread 수신 시그널**, **Friends 탭 = 새 친구**.

## 설계

### A. 시스템 테마 (palette 5 → light/dark 2) — 마지막 단계에서
- `appTheme.ts`: `paletteBySkin`(5) → `lightPalette`/`darkPalette`(2). 기존 swiss(light)/neon(dark) 베이스.
- 테마 상태: `useColorScheme()`(OS) + 사용자 수동 토글(선택).
- `useAppPalette()` 반환 타입 `AppPalette` 유지 → 42 호출처는 변경 없음. **단 내부가 activeSkinSlug 의존을 끊은 뒤에만 안전**(아래 순서 참조).

### B. identity pack = 위젯 스킨 메인 (먼저)
- MY "Skin Packs" sheet: palette → `identityPacks` 5종 picker. emote/person strip 미리보기.
- `skinStore`: palette `activeSkinSlug`와 **별개로** identity pack 상태(`activeIdentityPackSlug`) 분리.
- 소유 판정: `identity_pack_entitlements`(기존) + `pack.isFree`. IAP 흐름(`purchaseService.ts:19-27,63-82`) 보존, checkout 검증 없이 premium 부여 금지(DESIGN.md:157).
- active 저장: **`profiles` 신규 컬럼**(`active_identity_pack` text/slug) + entitlement 검증 RPC.
  - `profiles.active_skin_id`(skins FK, `20260502163001:26-32`) **재사용 금지** — skins 테이블 오염 / 가짜 palette-identity 매핑 영구화 위험(Codex).
- `WidgetStatesScreen`의 identity picker(`:181-230,309-372`)와 MY picker를 **공유 컴포넌트**로 (SSoT, 중복 제거).

### C. 빨간 점
- Today 탭: `messageStore.received.some(m => !m.is_read)` → unread dot.
- Friends 탭: 새 친구.
  - **권장**: `relationships.seen_at` 컬럼 추가(account-level, reinstall/다기기 일관). 마이그레이션 필요.
  - 대안(M1 throwaway): 로컬 last-seen(AsyncStorage). 단 `friendStore` Friend 타입에 `created_at` 노출 추가 필요(`friendStore.ts:13-25` ↔ `friendService` order by created_at). 기기별·reinstall-hostile.
- `RootNavigator` TabIcon: Today/Friends 각각 조건부 dot. 기존 `tabUnreadDot` 스타일 재활용.

## 단계 (마일스톤, 각 1 PR) — Codex 반영 순서

1. **M1 — 빨간 점 재배치** (작음, 독립). Today unread + Friends 새 친구.
   - seen_at 컬럼 우선 검토(권장). 로컬은 임시면만.
2. **M2 — identity pack 메인** (테마 축소보다 **먼저**). MY picker → identity pack, `skinStore` identity 상태 분리, WidgetStates와 picker 공유, `profiles.active_identity_pack` 신규 컬럼 + 검증 RPC.
3. **M3 — 시스템 테마** (M2 완료 후). palette → light/dark, `useAppPalette` 내부 전환. **user-facing이 palette slug 의존을 끊은 뒤에만** 축소(안 그러면 picker가 theme가 안 따르는 slug를 적용하는 silent break).
4. **M4 — 정리**. DB `skins`/DESIGN.md SSoT 최종, 잔여 palette 제거, IAP 흐름 재확인.

## 리스크 / 주의 (Codex 보강)

- **순서 역전 = silent break (최우선).** M3(테마)를 M2(identity)보다 먼저 하면, MY는 palette 적용한다고 믿지만 앱은 렌더 안 함. 반드시 identity-main(M2) → theme(M3).
- **DESIGN.md 정면 모순.** 현재 "skins는 지원 제품, useAppPalette로 모든 surface recolor"(`DESIGN.md:100-115`) + "standalone light/dark 토글 피하라"(`:168`). 이 계획과 충돌 → M3에서 DESIGN.md를 SSoT로 재작성 필수(stale 금지).
- **`create_profile` auto-assign.** 신규 프로필에 첫 free `skins` 행 자동 배정(`20260502163001:223-238`). DB skins 정리 시 무해하지 않음 — 프로필 생성 경로 확인.
- **active_skin_id 재사용 금지** (위 B). 신규 컬럼 + entitlement RPC.
- **42 호출처**: `useAppPalette` 인터페이스 유지가 깨지면 광범위 회귀. M3 타입/렌더 검증 필수.
- **PR #95(palette)·#96(명칭통일) 되돌림** — 재작업 비용. 매몰비용 감수.
- codex/OMX 공동 레포 → 각 M 완료 즉시 커밋(외부 git 리셋 race).

## Codex review 메모
- Verdict: "do not start by shrinking palette. First introduce active_identity_pack with entitlement validation, move MY to identity packs, share picker with WidgetStates, THEN reduce useAppPalette to light/dark."
- file:line 근거 전부 검증됨(appTheme:116-140, MyScreen:61-70/112-139, migrations, DESIGN.md:100-115/157/168).
