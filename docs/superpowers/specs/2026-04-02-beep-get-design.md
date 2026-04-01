# Beep-Get (비프젯) — Product Design Spec

> Widget-First Pager Communication App
> Version 1.0 | 2026-04-02

## 1. 프로젝트 개요

앱을 열지 않고 홈 화면 위젯만으로 숫자 코드 기반의 가벼운 소통이 가능한 90년대 삐삐 감성 커뮤니케이션 서비스.

| 항목 | 내용 |
|------|------|
| 타겟 | MZ/알파 세대 (뉴트로 감성 + 폰꾸미기 관심층) |
| 플랫폼 | iOS + Android 동시 출시 |
| 핵심 컨셉 | Widget-First — 위젯이 메인, 앱은 설정/아카이브/친구관리 |
| 기술 스택 | Expo Bare Workflow + Supabase |

### 핵심 UX 원칙

| 원칙 | 설명 | 예시 |
|------|------|------|
| 신호 (Signal) | 텍스트 대신 숫자 코드 중심 소통 | 012486 = 영원히 사랑해, 1004 = 천사 |
| 촉각 (Haptic) | 커스텀 진동 패턴으로 발신자 식별 | 어머니 = 긴 진동 2회, 친구 = 짧은 진동 3회 |
| 디자인 (Retro) | 90년대 삐삐 기기 감성 | LCD 디스플레이 + 픽셀 폰트 + 도트 아이콘 |

## 2. 아키텍처

```
┌─────────────────────────────────────┐
│           홈 화면 위젯               │
│  iOS: WidgetKit (SwiftUI)           │
│  Android: AppWidget (Kotlin/Glance) │
└──────────┬──────────────────────────┘
           │ App Group / SharedPrefs
┌──────────▼──────────────────────────┐
│        React Native (Bare)          │
│  Expo Modules Bridge               │
│  ├── 앱 UI (설정/아카이브/친구관리)   │
│  ├── 스킨 엔진 (테마 전환)           │
│  ├── 수집 시스템                     │
│  └── Zustand (상태관리)              │
└──────────┬──────────────────────────┘
           │ HTTPS / Realtime WS
┌──────────▼──────────────────────────┐
│         Supabase Backend            │
│  ├── Auth (소셜 로그인)              │
│  ├── Realtime (메시지 수신)          │
│  ├── Database (PostgreSQL)          │
│  ├── Storage (스킨 에셋)             │
│  └── Edge Functions (푸시/로직)      │
└─────────────────────────────────────┘
```

### 기술 스택

| 레이어 | 기술 |
|--------|------|
| Framework | Expo Bare Workflow (React Native) |
| Language | TypeScript + Swift (iOS 위젯) + Kotlin (Android 위젯) |
| Backend | Supabase (Auth + Realtime DB + Storage + Edge Functions) |
| Push | FCM (Android) + APNs (iOS) via expo-notifications |
| Native Bridge | expo-modules (RN ↔ 네이티브 위젯 브릿지) |
| State Mgmt | Zustand |

### 위젯 기술 스택

| | iOS | Android |
|---|---|---|
| 위젯 프레임워크 | WidgetKit (SwiftUI) | AppWidget (Kotlin/Jetpack Glance) |
| 브릿지 | expo-modules (Swift) | expo-modules (Kotlin) |
| 데이터 공유 | App Group + UserDefaults | SharedPreferences |
| 업데이트 트리거 | WidgetCenter.shared.reloadTimelines | AppWidgetManager.notifyUpdate |

### 위젯 데이터 플로우

```
푸시 수신
→ 네이티브 푸시 핸들러
→ SharedDefaults(iOS) / SharedPreferences(Android)에 데이터 저장
→ 위젯 리로드 트리거
→ LCD 화면에 최신 수신 코드 표시
```

## 3. 데이터베이스 스키마

### users
| Column | Type | Constraint | Description |
|--------|------|-----------|-------------|
| id | uuid | PK (auth.uid()) | 사용자 고유 ID |
| beep_id | varchar(8) | UNIQUE NOT NULL | 삐삐 번호 (8자리) |
| nickname | varchar(20) | NOT NULL | 닉네임 |
| status_icon | varchar(10) | DEFAULT 'online' | 도트 상태 아이콘 key |
| active_skin_id | uuid | FK → skins | 적용 중인 스킨 |
| created_at | timestamptz | DEFAULT now() | 가입일 |

### friendships
| Column | Type | Constraint | Description |
|--------|------|-----------|-------------|
| id | uuid | PK | |
| user_id | uuid | FK → users | |
| friend_id | uuid | FK → users | |
| nickname | varchar(20) | | 내가 붙인 별명 |
| vibration_pattern | varchar(50) | | 커스텀 진동 패턴 (예: "L,S,S" = 긴-짧-짧) |
| created_at | timestamptz | DEFAULT now() | |
| | | UNIQUE(user_id, friend_id) | |

### messages
| Column | Type | Constraint | Description |
|--------|------|-----------|-------------|
| id | uuid | PK | |
| from_user | uuid | FK → users | 발신자 |
| to_user | uuid | FK → users | 수신자 |
| number_code | varchar(20) | NOT NULL | 숫자 코드 |
| memo | varchar(30) | NULLABLE | 짧은 메모 |
| is_read | boolean | DEFAULT false | 읽음 여부 |
| is_saved | boolean | DEFAULT false | 저장 여부 |
| expires_at | timestamptz | | 수신 + 24시간 (INSERT 시 앱에서 `now() + interval '24 hours'` 설정) |
| created_at | timestamptz | DEFAULT now() | |

### code_dictionary
| Column | Type | Constraint | Description |
|--------|------|-----------|-------------|
| id | uuid | PK | |
| user_id | uuid | FK → users | 소유자 |
| code | varchar(20) | NOT NULL | 숫자 코드 |
| meaning | varchar(50) | NOT NULL | 의미 설명 |
| created_at | timestamptz | DEFAULT now() | |

### skins
| Column | Type | Constraint | Description |
|--------|------|-----------|-------------|
| id | uuid | PK | |
| name | varchar(30) | NOT NULL | 스킨 이름 |
| slug | varchar(30) | UNIQUE | 'cyber-neon' 등 |
| category | varchar(20) | | 'default', 'premium', 'season', 'collab' |
| assets_url | text | NOT NULL | Storage URL |
| is_free | boolean | DEFAULT false | 무료 여부 |
| price_tier | varchar(10) | | IAP 가격 티어 ('tier1'=1,100원, 'tier2'=2,200원 등) |
| season_id | uuid | FK → seasons | 시즌 한정이면 |
| created_at | timestamptz | DEFAULT now() | |

### user_skins
| Column | Type | Constraint | Description |
|--------|------|-----------|-------------|
| id | uuid | PK | |
| user_id | uuid | FK → users | |
| skin_id | uuid | FK → skins | |
| acquired_type | varchar(20) | | 'purchase', 'drop', 'season', 'default' |
| acquired_at | timestamptz | DEFAULT now() | |
| | | UNIQUE(user_id, skin_id) | |

### icons
| Column | Type | Constraint | Description |
|--------|------|-----------|-------------|
| id | uuid | PK | |
| name | varchar(30) | NOT NULL | |
| image_url | text | NOT NULL | |
| rarity | varchar(10) | NOT NULL | 'common', 'rare', 'epic', 'legendary' |
| drop_condition | jsonb | | {"type":"streak","days":7} |
| season_id | uuid | FK → seasons | |
| created_at | timestamptz | DEFAULT now() | |

### user_icons
| Column | Type | Constraint | Description |
|--------|------|-----------|-------------|
| id | uuid | PK | |
| user_id | uuid | FK → users | |
| icon_id | uuid | FK → icons | |
| acquired_at | timestamptz | DEFAULT now() | |
| | | UNIQUE(user_id, icon_id) | |

### seasons
| Column | Type | Constraint | Description |
|--------|------|-----------|-------------|
| id | uuid | PK | |
| name | varchar(50) | NOT NULL | |
| starts_at | timestamptz | NOT NULL | |
| ends_at | timestamptz | NOT NULL | |
| created_at | timestamptz | DEFAULT now() | |

### status_broadcasts
| Column | Type | Constraint | Description |
|--------|------|-----------|-------------|
| id | uuid | PK | |
| user_id | uuid | FK → users | |
| status_icon | varchar(10) | NOT NULL | 도트 아이콘 key |
| label | varchar(20) | | '공부중' 등 |
| updated_at | timestamptz | DEFAULT now() | |

## 4. 핵심 기능 상세

### 4-1. 위젯 시스템

**2x2 위젯**: 마지막 수신 코드 1건. LCD 디스플레이 + 확인/답장 버튼. 발신자 별명 + 시간.

**4x2 위젯**: 대표 1건 LCD + 우측 친구 리스트 (최근 수신 3명). 탭으로 친구 전환 (스와이프 불가 — OS 제약).

**업데이트 전략**:
- iOS: 푸시 수신 시 `WidgetCenter.shared.reloadAllTimelines()`. 백그라운드 리프레시 15분 간격 보조.
- Android: `AppWidgetManager.notifyAppWidgetViewDataChanged()`. 푸시 수신 시 즉시 갱신.

### 4-2. 메시징

- 숫자 코드 (최대 20자리) + 선택적 메모 (30자)
- 수신 시 친구별 커스텀 진동 패턴 발동
- 24시간 후 자동 삭제 — Supabase Edge Function cron으로 `expires_at < now() AND is_saved = false` 삭제
- '저장' 누르면 `is_saved = true` → 암호 수첩으로 이동, 삭제 대상 제외

### 4-3. 스킨 엔진

```
skins/
  cyber-neon/
    theme.json        -- 컬러, 폰트, border-radius, 그림자
    widget-2x2.svg    -- 위젯 배경 에셋
    widget-4x2.svg
    lcd-overlay.png   -- LCD 텍스처
    button-style.json -- 버튼 스타일
  retro-future/
    ...
```

- `theme.json` → Zustand 스토어 로드 → 앱 UI 전체 테마 전환
- 위젯: `App Group`(iOS) / `SharedPreferences`(Android)에 현재 스킨 slug 저장 → SwiftUI/Kotlin에서 에셋 분기
- 스킨 변경 시 위젯 리로드 트리거

**기본 스킨 라인업 (4종)**:

| 스킨 | 스타일 | 가격 |
|------|--------|------|
| 뉴모피즘 | 라이트, 소프트 섀도우, 미니멀 | 무료 (기본) |
| 사이버 네온 | 다크, 네온 글로우 보더, 기하학적 | 프리미엄 |
| 레트로 퓨처 | 올리브 LCD, 우드 텍스처, 미드센추리 | 프리미엄 |
| 글래스모피즘 | 퍼플/블루 그라디언트, 딥 블러 | 프리미엄 |

### 4-4. 수집 시스템

**획득 경로**:

| 경로 | 예시 | 희귀도 |
|------|------|--------|
| 상점 구매 | 아이콘 팩 3종 세트 | 선택 가능 |
| 조건 달성 드롭 | 7일 연속 접속 → 랜덤 드롭 | common~epic |
| 시즌 한정 | 시즌 내 미션 완료 | epic~legendary |

- `drop_condition` jsonb: `{"type":"streak","days":7}`, `{"type":"friends","count":5}`, `{"type":"messages_sent","count":100}`
- Edge Function이 조건 체크 → 달성 시 `user_icons` 삽입 + 푸시 알림
- 중복 획득 불가 (UNIQUE 제약)

### 4-5. 상태 브로드캐스트

- 도트 아이콘 + 라벨로 내 상태 설정 (공부중, 수면중, 이동중 등)
- 변경 시 Supabase Realtime으로 친구들에게 실시간 전파
- 4x2 위젯 친구 리스트에 상태 아이콘 표시

### 4-6. 연결 시스템

- **삐삐 번호 입력**: 8자리 beep_id로 친구 추가
- **QR 코드**: 앱 내 QR 생성/스캔 (expo-camera)
- **초대 링크**: 딥링크 `beepget://add/{beep_id}` → 미설치 시 스토어 리다이렉트
- **연락처 동기화 (옵션)**: 권한 동의 시 연락처에서 기존 가입자 자동 발견

### 4-7. 인증

- 소셜 로그인: Google + Apple (Supabase Auth)
- 가입 시 8자리 beep_id 자동 생성: 랜덤 숫자 8자리, 충돌 시 재생성 (최대 5회 재시도)
- 삐삐 번호는 프로필에서 확인 + 공유
- beep_id는 변경 불가 (영구 고유 식별자)

## 5. 수익 모델

| 모델 | 설명 | 우선순위 |
|------|------|----------|
| 스킨 판매 | 프리미엄 스킨 3종 + 시즌/콜라보 한정 스킨 | MVP 핵심 |
| 아이콘 팩 | 상점에서 도트 아이콘 세트 구매 | MVP 핵심 |
| 시즌 이벤트 | 기간 한정 스킨 + legendary 아이콘 | Post-MVP |
| 네이티브 광고 | 앱 내 픽셀 아트 스타일 광고 | Post-MVP |

## 6. 개발 로드맵

### Phase 1: 앱 코어 (3주)
- Expo Bare Workflow 프로젝트 초기화 (TypeScript)
- Supabase Auth (Google/Apple 소셜 로그인)
- 삐삐 번호 자동 생성 (8자리 유니크)
- 숫자 코드 전송/수신 (Supabase Realtime)
- 푸시 알림 (expo-notifications + FCM/APNs)
- 메인 화면 UI (LCD 디자인, 뉴모피즘 기본 스킨)
- 나만의 암호표 CRUD
- 친구 추가 (beep_id 직접 입력 + QR + 딥링크)
- 휘발성 메모 (24시간 TTL + 저장 버튼)

### Phase 2: 위젯 (3주)
- expo-modules로 네이티브 브릿지 생성
- iOS WidgetKit 구현 (SwiftUI, App Group 데이터 공유)
- Android AppWidget 구현 (Kotlin, SharedPreferences)
- 2x2 위젯: 마지막 수신 코드 표시
- 4x2 위젯: 대표 1건 + 친구 리스트
- 푸시 수신 → 위젯 리로드 파이프라인
- 위젯 버튼 인터랙션 (확인/답장 → 딥링크)

### Phase 3: 스킨 + 수집 (2주)
- 스킨 엔진 (theme.json → Zustand → UI 전환)
- 기본 스킨 4종 제작 (뉴모피즘 무료 + 3종 프리미엄)
- 위젯 스킨 연동 (네이티브 에셋 분기)
- 아이콘 수집 시스템 (조건 드롭 + 상점)
- 시즌 테이블 + 시즌 한정 아이콘
- 인앱결제 연동 (expo-iap)

### Phase 4: 소셜 + 감성 (2주)
- 상태 브로드캐스트 (Realtime 전파)
- 커스텀 진동 패턴 (Haptics API, 친구별 설정)
- 연락처 동기화 (옵션)
- 초대 링크 딥링크 처리
- LCD 픽셀 폰트 적용 (DungGeunMo, VT323)

### Phase 5: 출시 준비 (1주)
- 스토어 스크린샷 + 프리뷰 영상
- 개인정보처리방침 / 이용약관
- App Store / Google Play 심사 대응
- 베타 테스트 (TestFlight + 내부 테스트)
- 스킨 커스터마이징 스크린샷 에셋 (폰꾸미기 바이럴용)

**총 예상: 11주 (약 2.5개월)**

## 7. 리스크

| 리스크 | 심각도 | 대응 |
|--------|--------|------|
| iOS 위젯 실시간 업데이트 제약 (Timeline 기반) | 높음 | 푸시 트리거 + 15분 백그라운드 리프레시 병행 |
| Expo Bare Workflow 초기 세팅 복잡도 | 중간 | Day 1부터 Bare로 시작하여 전환 리스크 제거 |
| Swift/Kotlin 네이티브 위젯 AI 코드 생성 품질 | 높음 | react-native-widget-extension 참고 + 수동 디버깅 예산 확보 |
| 스킨 에셋이 위젯/앱 양쪽에서 일관성 유지 | 중간 | theme.json 단일 소스 + 네이티브 에셋 자동 생성 파이프라인 |
| 인앱결제 심사 리젝 | 중간 | Apple/Google 가이드라인 사전 검토, 디지털 상품만 IAP 사용 |

## 8. 디자인 레퍼런스

### 오픈소스 라이브러리
- [NES.css](https://github.com/nostalgic-css/NES.css) — 픽셀 CSS 프레임워크 (21.7K stars)
- [8bitcn/ui](https://github.com/TheOrcDev/8bitcn-ui) — 8비트 레트로 컴포넌트 (1.8K stars)
- [React95-Native](https://github.com/react95-io/React95-Native) — RN 레트로 컴포넌트
- [react-native-widget-extension](https://github.com/bndkt/react-native-widget-extension) — RN 위젯 브릿지

### 디자인 영감
- [1bit-ui](https://github.com/jcontini/1bit-ui) — Palm Pilot/Game Boy 모노크롬
- [PIPPO Pager Concept](https://www.yankodesign.com/2025/08/12/pippo-pager-concept-fuses-retro-tactility-with-digital-emotion/) — 레트로 페이저 컨셉
- [Y2K Design System (Figma)](https://www.figma.com/community/file/1088531660789691371/y2k-design-system)
- [Pxlkit](https://pxlkit.xyz/) — 픽셀 SVG 아이콘

### 컬러 팔레트 (스킨별)

**뉴모피즘 (기본 무료)**:
라이트 배경, 소프트 섀도우, 미니멀 톤

**사이버 네온**:
다크 배경 + 네온 핑크/시안 글로우 보더

**레트로 퓨처**:
올리브 LCD + 우드/브라운 따뜻한 톤

**글래스모피즘**:
퍼플~블루 그라디언트 + 딥 블러 유리

### 참고 폰트
- 픽셀: Press Start 2P, Silkscreen, DungGeunMo (둥근모)
- LCD: VT323, DS-Digital
- UI: Space Mono, Inter
