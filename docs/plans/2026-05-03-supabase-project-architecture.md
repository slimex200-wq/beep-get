# Beep-get Supabase Project Architecture

> Date: 2026-05-03
> Scope: 새 Supabase 프로젝트 생성부터 Beep/Blink 백엔드 구조까지 재설계

## 결론

Beep-get은 기존 Weeple/테스트 데이터가 섞인 Supabase 프로젝트를 재사용하지 않는다.

새 Supabase 프로젝트를 만들고, 그 프로젝트를 Beep-get 전용 production backend로 둔다. 기존 `users/messages/friendships` 중심 스키마는 Beep/Blink까지 가기엔 애매하므로, 새 프로젝트에 push하기 전 v2 migration으로 정리한다.

핵심 원칙:

- Supabase는 `Auth + Postgres metadata + Realtime + private Storage MVP`를 담당한다.
- 위젯은 Supabase에 직접 붙는 surface가 아니다. 앱/푸시/네이티브 shared storage를 통해 최신 teaser payload만 받는다.
- 영상 원본은 위젯에 전달하지 않는다. 위젯에는 `thumbnail + 3-frame strip + deep link`만 전달한다.
- 2초 Blink는 제품 포맷이자 비용 제한 장치다.
- RLS는 public schema 전체에 켜고, 공개 lookup은 table select가 아니라 RPC로 제한한다.

## 새 프로젝트 생성 전략

권장 프로젝트:

- Name: `beep-get-prod`
- Region: `ap-northeast-2` Seoul
- Plan: 처음엔 Free/Pro 중 계정 상황에 맞게 시작하되, Storage/Realtime 사용량을 보며 조정
- DB password: 로컬 secret manager 또는 비밀번호 관리자에만 저장

공식 근거:

- Supabase CLI는 `projects create`, `link`, `db push`로 프로젝트 생성/연결/마이그레이션 배포를 지원한다.
- React Native quickstart도 새 Supabase 프로젝트 생성 후 앱에 Project URL과 anon key를 연결하는 흐름을 전제로 한다.
- RLS는 public schema table에 항상 활성화해야 한다.
- Storage upload는 signed upload URL 패턴을 쓸 수 있다.

## 프로젝트 생성 명령 순서

현재 이 repo에는 전역 `supabase` CLI가 없다. Windows에서는 전역 설치보다 `npx supabase@latest`를 우선 사용한다.

### 1. Supabase 계정 로그인

토큰은 채팅에 붙이지 않는다.

```powershell
npx supabase@latest login --token <SUPABASE_ACCESS_TOKEN>
```

또는 브라우저/dashboard로 프로젝트를 만든 뒤 CLI는 link만 해도 된다.

### 2. 새 프로젝트 생성

CLI 생성 방식:

```powershell
npx supabase@latest projects create beep-get-prod `
  --org-id <SUPABASE_ORG_ID> `
  --region ap-northeast-2 `
  --db-password <LOCAL_SECRET_DB_PASSWORD>
```

Dashboard 생성 방식:

1. Supabase dashboard에서 New project.
2. 이름 `beep-get-prod`.
3. region `Northeast Asia (Seoul) ap-northeast-2`.
4. DB password 저장.
5. project ref 복사.

### 3. 로컬 Supabase 초기화/연결

현재 repo에는 `supabase/migrations`는 있지만 `supabase/config.toml`이 없다. 새 프로젝트 연결 전 init이 필요하다.

```powershell
npx supabase@latest init
npx supabase@latest link --project-ref <PROJECT_REF>
```

### 4. v2 migration 정리 후 dry-run

중요: 지금 있는 `001_initial_schema.sql`, `002_security_hardening.sql`은 old schema다. 새 프로젝트에 그대로 push하지 않는다.

권장 흐름:

```powershell
npx supabase@latest db push --dry-run
```

dry-run 전에 해야 할 작업:

- 기존 migration을 archive하거나 새 v2 migration으로 squash.
- 새 프로젝트 첫 push 대상은 `profiles/signals/signal_media/usage_daily` 기반 schema가 되게 만든다.

### 5. 실제 push

```powershell
npx supabase@latest db push
```

### 6. 앱 환경 변수 설정

로컬:

```powershell
EXPO_PUBLIC_SUPABASE_URL=https://<PROJECT_REF>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

EAS:

```powershell
npx eas-cli@latest env:create --environment production --name EXPO_PUBLIC_SUPABASE_URL --value https://<PROJECT_REF>.supabase.co
npx eas-cli@latest env:create --environment production --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value <anon-key>
```

`service_role` key는 앱/EAS public env에 절대 넣지 않는다. Edge Function secret으로만 둔다.

## Backend Responsibility Map

### Supabase Auth

담당:

- Google/Apple 로그인.
- `auth.users` identity.
- JWT 발급.

주의:

- 앱 UI에 Google/Apple 버튼을 보이게 하기 전에 provider 설정과 redirect URL을 끝낸다.
- provider token refresh는 Supabase가 자동으로 대신 관리해주는 개념으로 기대하지 않는다.

### Postgres

담당:

- profile.
- close-friend relationship.
- Beep/Blink metadata.
- read/save/reply state.
- usage quota.
- skin/code preset metadata.

Postgres에 저장하지 않는 것:

- 긴 영상 binary.
- widget render artifact binary.
- service role secret.

### Storage

MVP:

- Supabase private bucket 사용 가능.
- `blink-originals`: 원본 2초 영상.
- `blink-thumbs`: 대표 썸네일/3-frame strip.

중기:

- 사용량이 늘면 Cloudflare R2 또는 Stream으로 media provider 교체.
- 앱 코드는 `mediaStorage` adapter를 통해 provider를 숨긴다.

### Realtime

담당:

- 앱이 foreground일 때 incoming signal 반영.
- Today/Reply Room 갱신.

담당하지 않는 것:

- OS 홈스크린 위젯을 직접 realtime으로 갱신.

### Push Notifications

담당:

- 앱이 background일 때 signal 도착 알림.
- 알림 quick action: confirm/save/reply.
- 알림 tap 시 `beepget://reply/:signalId`로 진입.

### Widget Native Layer

담당:

- 앱이 받은 latest signal teaser payload를 shared storage에 저장.
- widget reload.
- action/deep link dispatch.

## v2 Schema

### `profiles`

Supabase `auth.users`의 app profile.

```sql
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  beep_id text not null unique,
  nickname text not null,
  avatar_url text,
  active_skin_id uuid,
  status_icon text not null default 'online',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_beep_id_format check (beep_id ~ '^[1-9][0-9]{7}$'),
  constraint profiles_nickname_length check (char_length(nickname) between 1 and 20)
);
```

왜 `profiles`인가:

- `auth.users`와 `public.users` 이름 충돌/혼동을 피한다.
- Supabase Auth quickstart/커뮤니티 패턴과 맞다.

### `relationships`

사용자 기준 close-friend edge. 친구 관계는 기본적으로 directional이다.

```sql
create table public.relationships (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  friend_id uuid not null references public.profiles(id) on delete cascade,
  nickname text,
  vibration_pattern text,
  created_at timestamptz not null default now(),
  constraint relationships_no_self check (owner_id <> friend_id),
  unique(owner_id, friend_id)
);
```

### `code_presets`

위젯에서 바로 보낼 코드 슬롯.

```sql
create table public.code_presets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  relationship_id uuid references public.relationships(id) on delete cascade,
  code text not null,
  label text not null,
  sort_order int not null default 0,
  is_widget_slot boolean not null default false,
  created_at timestamptz not null default now(),
  constraint code_presets_code_format check (code ~ '^[0-9]{1,20}$')
);
```

### `signals`

Beep/Blink 공통 metadata.

```sql
create type public.signal_kind as enum ('beep', 'blink');
create type public.signal_status as enum ('sent', 'delivered', 'read', 'dismissed');

create table public.signals (
  id uuid primary key default gen_random_uuid(),
  kind public.signal_kind not null,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  receiver_id uuid not null references public.profiles(id) on delete cascade,
  code text not null,
  memo text,
  status public.signal_status not null default 'sent',
  is_saved boolean not null default false,
  expires_at timestamptz not null default (now() + interval '24 hours'),
  created_at timestamptz not null default now(),
  constraint signals_code_format check (code ~ '^[0-9]{1,20}$'),
  constraint signals_memo_length check (memo is null or char_length(memo) <= 30),
  constraint signals_no_self check (sender_id <> receiver_id)
);
```

### `signal_media`

Blink media metadata. 영상 자체가 아니라 object key와 처리 상태만 저장한다.

```sql
create type public.media_provider as enum ('supabase_storage', 'cloudflare_r2', 'cloudflare_stream');
create type public.media_status as enum ('pending_upload', 'uploaded', 'processed', 'failed', 'expired', 'deleted');

create table public.signal_media (
  id uuid primary key default gen_random_uuid(),
  signal_id uuid not null unique references public.signals(id) on delete cascade,
  provider public.media_provider not null default 'supabase_storage',
  bucket text,
  object_key text not null,
  thumbnail_key text,
  strip_keys text[] not null default '{}',
  duration_ms int not null,
  byte_size int not null,
  status public.media_status not null default 'pending_upload',
  expires_at timestamptz not null default (now() + interval '24 hours'),
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  constraint signal_media_duration_cap check (duration_ms > 0 and duration_ms <= 2000),
  constraint signal_media_size_cap check (byte_size > 0 and byte_size <= 750000)
);
```

### `signal_events`

read/save/reply 등 감사 가능한 event log.

```sql
create type public.signal_event_type as enum ('read', 'confirm', 'save', 'reply', 'dismiss');

create table public.signal_events (
  id uuid primary key default gen_random_uuid(),
  signal_id uuid not null references public.signals(id) on delete cascade,
  actor_id uuid not null references public.profiles(id) on delete cascade,
  event_type public.signal_event_type not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
```

### `usage_daily`

서버비 폭발 방지용 일 단위 quota.

```sql
create table public.usage_daily (
  user_id uuid not null references public.profiles(id) on delete cascade,
  usage_date date not null default current_date,
  beep_sent_count int not null default 0,
  blink_sent_count int not null default 0,
  bytes_uploaded bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, usage_date)
);
```

### `skins` / `user_skins`

기존 개념 유지. 다만 media와 분리한다.

```sql
create table public.skins (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category text not null default 'default',
  is_free boolean not null default false,
  price_tier text,
  created_at timestamptz not null default now()
);

create table public.user_skins (
  user_id uuid not null references public.profiles(id) on delete cascade,
  skin_id uuid not null references public.skins(id) on delete cascade,
  acquired_type text not null default 'default',
  acquired_at timestamptz not null default now(),
  primary key (user_id, skin_id)
);
```

## Index Strategy

필수 index:

```sql
create index profiles_beep_id_idx on public.profiles (beep_id);
create index relationships_owner_idx on public.relationships (owner_id, created_at desc);
create index relationships_friend_idx on public.relationships (friend_id);
create index code_presets_owner_widget_idx on public.code_presets (owner_id, is_widget_slot, sort_order);
create index signals_receiver_inbox_idx on public.signals (receiver_id, created_at desc) where is_saved = false;
create index signals_sender_idx on public.signals (sender_id, created_at desc);
create index signals_expiry_idx on public.signals (expires_at) where is_saved = false;
create index signal_media_expiry_idx on public.signal_media (expires_at) where deleted_at is null;
create index signal_events_signal_idx on public.signal_events (signal_id, created_at desc);
create index usage_daily_user_date_idx on public.usage_daily (user_id, usage_date);
```

이유:

- Inbox는 `receiver_id + created_at`.
- 보낸 기록은 `sender_id + created_at`.
- 만료 job은 `expires_at where not saved/deleted`.
- RLS가 보는 owner/sender/receiver 컬럼은 반드시 index 대상.

## RLS Model

공통:

- 모든 public table에 RLS enable.
- policy는 `to authenticated`를 명시.
- `auth.uid()`는 `(select auth.uid())` 형태로 감싼다.
- 복잡한 friend check는 security definer function으로 뺀다.

예시:

```sql
alter table public.profiles enable row level security;
alter table public.signals enable row level security;
alter table public.signal_media enable row level security;

create policy "profiles_select_own_or_related"
on public.profiles for select
to authenticated
using (
  id = (select auth.uid())
  or public.is_related_profile(id)
);

create policy "signals_select_participant"
on public.signals for select
to authenticated
using (
  sender_id = (select auth.uid())
  or receiver_id = (select auth.uid())
);

create policy "signals_insert_sender"
on public.signals for insert
to authenticated
with check (sender_id = (select auth.uid()));
```

Avoid:

- `users_select_by_beep_id using (true)` 같은 public full read.
- 클라이언트에서 `service_role` 사용.
- media bucket public read.

## RPC / Edge Function Boundary

클라이언트가 직접 table insert/update 해도 되는 것:

- 내 profile 일부 update.
- 내 code preset CRUD.
- 내 relationship nickname/vibration update.
- signal read/save 같은 단순 receiver action.

RPC/Edge Function으로 감싸야 하는 것:

- `create_profile`: profile 생성 + 기본 skin 지급.
- `find_profile_by_beep_id`: beep_id로 limited profile lookup.
- `send_beep`: relationship/quota 검증 후 signal 생성.
- `create_blink_upload`: quota 검증 후 signal + signal_media pending 생성 + signed upload URL 반환.
- `finalize_blink_upload`: 업로드 완료 후 duration/byte/status 반영.
- `reply_with_preset`: widget/notification reply의 정해진 code 전송.
- `expire_unsaved_media`: 만료된 원본 삭제 + metadata 상태 변경.

## Blink Upload Flow

1. 앱에서 2초 이하 영상 녹화.
2. 앱에서 client-side metadata 측정: duration, byte size.
3. `create_blink_upload` RPC/Function 호출.
4. 서버가 quota, relationship, size, duration limit 검증.
5. 서버가 `signals(kind='blink')` + `signal_media(status='pending_upload')` 생성.
6. 서버가 signed upload URL 반환.
7. 앱이 private storage에 업로드.
8. 앱이 `finalize_blink_upload` 호출.
9. 서버/worker가 thumbnail + 3-frame strip 생성. MVP에서는 클라이언트 생성도 허용.
10. receiver에게 push notification 전송.
11. receiver app foreground면 Realtime으로 Today/Reply Room 갱신.
12. app/native layer가 widget shared payload를 갱신.

## Widget Payload

Supabase row를 그대로 widget에 넘기지 않는다. 앱에서 작게 가공한다.

```ts
type WidgetSignalPayload = {
  signalId: string;
  kind: "beep" | "blink";
  code: string;
  senderNickname: string;
  senderBeepId: string;
  receivedAt: string;
  isRead: boolean;
  teaser?: {
    thumbnailUri?: string;
    stripFrameUris?: string[];
    durationMs: 2000;
  };
  actions: {
    openReplyRoomUrl: string;
    confirmUrl: string;
    saveUrl: string;
    quickReplyCodes: string[];
  };
};
```

## Storage Bucket Policy

MVP Supabase Storage buckets:

- `blink-originals`: private, max file size around `1MiB`.
- `blink-thumbs`: private or public-read only if thumbnail privacy risk is accepted. 권장: private.

Rule:

- 앱은 permanent public URL을 저장하지 않는다.
- DB에는 object key만 저장한다.
- playback/detail 진입 시 signed URL을 짧게 발급한다.
- widget은 remote video URL을 갖지 않는다.

## Cost Guardrails

초기값:

- Blink duration: 2 seconds.
- File cap: 750 KB.
- Free blink send: 10/day/user for alpha, 5/day/user if storage가 부담되면 즉시 축소.
- Same receiver cooldown: 30-60 seconds.
- Unsaved original media TTL: 24 hours.
- Saved media retention: 7 days free, longer retention paid/premium later.
- Thumbnail metadata retention: keep after original expiry.

## App Architecture Changes

현재 코드에서 바꿀 방향:

- `users` service naming -> `profiles`.
- `messages` -> `signals`.
- `number_code` -> `code`.
- `is_read/is_saved` 유지 가능하지만 event log를 추가.
- `widgetService.buildWidgetData`는 `WidgetSignalPayload`를 입력으로 받도록 분리.
- Supabase client fallback은 유지하되, production build에서는 env missing을 명확히 보여준다.

권장 파일 추가:

- `src/lib/beepBlinkLimits.ts`
- `src/lib/beepBlinkPresentation.ts`
- `src/services/signalService.ts`
- `src/services/mediaStorage.ts`
- `src/services/usageLimits.ts`
- `src/services/widgetSignalPayload.ts`
- `supabase/migrations/001_beep_blink_core.sql`
- `supabase/functions/create-blink-upload/`
- `supabase/functions/expire-unsaved-media/`

## Implementation Plan

### Phase 1: Supabase project 준비

1. Supabase dashboard 또는 CLI로 `beep-get-prod` 생성.
2. Project ref, URL, anon key 확보.
3. `npx supabase@latest init`.
4. `npx supabase@latest link --project-ref <PROJECT_REF>`.
5. `.env`는 로컬에만 생성. `.env.example`은 placeholder 유지.

### Phase 2: Migration v2 작성

1. 기존 `001/002` old schema를 새 프로젝트에 바로 push하지 않도록 정리.
2. `001_beep_blink_core.sql` 작성.
3. RLS policy는 `to authenticated` + `(select auth.uid())` 패턴.
4. `find_profile_by_beep_id`, `create_profile`, `send_beep` RPC 포함.
5. `db push --dry-run`으로 확인.

### Phase 3: App service refactor

1. `authService` profile 생성 RPC 변경.
2. `friendService`를 `relationships` 기반으로 변경.
3. `messageService`를 `signalService`로 점진 전환.
4. 기존 화면은 preview mode를 유지하며 새 presentation model을 먼저 연결.

### Phase 4: Blink media MVP

1. 2초/750KB limit 상수와 테스트.
2. media storage adapter 작성.
3. Supabase private bucket signed upload 구현.
4. thumbnail/strip은 MVP에서 client-generated fallback 허용.

### Phase 5: Widget/Notification 연결

1. `WidgetSignalPayload` 생성기 작성.
2. Android widget payload 확장.
3. notification deep link를 `beepget://reply/:signalId`로 통일.
4. widget에서 quick reply는 preset code만 허용.

### Phase 6: 운영 guardrail

1. `usage_daily` quota enforcement.
2. `expire_unsaved_media` function.
3. EAS env production 설정.
4. Android build/QA.
5. iOS는 macOS availability에 따라 별도 검증.

## Open Decisions

- 새 프로젝트를 CLI로 만들지, dashboard에서 만들지.
- MVP media를 Supabase Storage로 시작할지, 처음부터 Cloudflare R2로 갈지.
- 무료 Blink quota를 10/day로 둘지 5/day로 둘지.
- Saved media free retention을 7일로 할지 30일로 할지.
- 기존 old migrations를 archive할지, v2 migration으로 forward transition할지.

## Recommended Decision

지금은 이렇게 간다:

1. Dashboard에서 새 Supabase project 생성.
2. Region은 `ap-northeast-2`.
3. MVP media는 Supabase Storage private bucket으로 시작.
4. 코드에서는 `mediaStorage` adapter를 둬서 R2/Stream 이관 가능하게 만든다.
5. 기존 migrations는 새 프로젝트 push 전에 v2 schema로 정리한다.
6. 첫 구현은 `profiles/signals/signal_media/usage_daily` migration부터 시작한다.
