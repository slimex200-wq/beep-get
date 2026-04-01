# Phase 1: App Core Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** "앱만으로 동작하는 삐삐" — Expo Bare Workflow 기반의 숫자 코드 전송/수신, 인증, 친구관리, 암호표가 작동하는 앱 코어 완성

**Architecture:** Expo Bare Workflow (TypeScript) + Supabase (Auth + Realtime + DB). 앱 UI는 React Native + Zustand 상태관리. 뉴모피즘 기본 스킨으로 LCD 감성 UI 구현.

**Tech Stack:** Expo SDK 52+, TypeScript, Supabase JS Client, Zustand, expo-notifications, expo-camera (QR), React Navigation

**Spec:** `docs/superpowers/specs/2026-04-02-beep-get-design.md`

---

## File Structure

```
beep-get/
├── app.json
├── App.tsx                          # 앱 진입점, NavigationContainer
├── babel.config.js
├── tsconfig.json
├── package.json
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql   # 전체 DB 스키마
├── src/
│   ├── lib/
│   │   ├── supabase.ts              # Supabase 클라이언트 초기화
│   │   └── constants.ts             # 앱 상수 (beep_id 길이 등)
│   ├── stores/
│   │   ├── authStore.ts             # 인증 상태 (user, session)
│   │   ├── messageStore.ts          # 메시지 상태 (수신함, Realtime 구독)
│   │   ├── friendStore.ts           # 친구 목록 상태
│   │   └── dictionaryStore.ts       # 암호표 상태
│   ├── services/
│   │   ├── authService.ts           # 인증 + beep_id 생성 로직
│   │   ├── messageService.ts        # 메시지 전송/수신/삭제
│   │   ├── friendService.ts         # 친구 추가/삭제/검색
│   │   └── dictionaryService.ts     # 암호표 CRUD
│   ├── screens/
│   │   ├── AuthScreen.tsx           # 로그인 화면
│   │   ├── HomeScreen.tsx           # 메인 LCD 화면 (수신 코드 표시)
│   │   ├── SendScreen.tsx           # 코드 전송 화면
│   │   ├── FriendsScreen.tsx        # 친구 목록/추가 화면
│   │   ├── DictionaryScreen.tsx     # 암호표 화면
│   │   └── ProfileScreen.tsx        # 프로필 (beep_id, 설정)
│   ├── components/
│   │   ├── LcdDisplay.tsx           # LCD 디스플레이 컴포넌트
│   │   ├── BeepButton.tsx           # 뉴모피즘 버튼
│   │   ├── CodeInput.tsx            # 숫자 코드 입력
│   │   ├── FriendItem.tsx           # 친구 목록 아이템
│   │   ├── MessageItem.tsx          # 수신 메시지 아이템
│   │   └── QrScanner.tsx            # QR 스캔/생성
│   ├── navigation/
│   │   └── RootNavigator.tsx        # Stack + Tab 네비게이션
│   └── theme/
│       ├── neumorphism.ts           # 뉴모피즘 테마 토큰
│       └── fonts.ts                 # 커스텀 폰트 설정
└── __tests__/
    ├── services/
    │   ├── authService.test.ts
    │   ├── messageService.test.ts
    │   ├── friendService.test.ts
    │   └── dictionaryService.test.ts
    └── stores/
        ├── authStore.test.ts
        ├── messageStore.test.ts
        └── friendStore.test.ts
```

---

## Task 1: 프로젝트 초기화 + Supabase 연결

**Files:**
- Create: `app.json`, `tsconfig.json`, `babel.config.js`, `src/lib/supabase.ts`, `src/lib/constants.ts`
- Create: `.env`, `.env.example`

- [ ] **Step 1: Expo Bare Workflow 프로젝트 생성**

```bash
cd /c/Users/slime/claude-projects
npx create-expo-app@latest beep-get --template bare-minimum
cd beep-get
```

- [ ] **Step 2: TypeScript + 핵심 의존성 설치**

```bash
npx expo install typescript @types/react @types/react-native
npm install @supabase/supabase-js zustand react-native-url-polyfill
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
npx expo install react-native-screens react-native-safe-area-context
npx expo install expo-secure-store expo-notifications expo-camera expo-linking expo-font
```

- [ ] **Step 3: tsconfig.json 설정**

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

- [ ] **Step 4: .env.example 생성**

```bash
# .env.example
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

- [ ] **Step 5: Supabase 클라이언트 생성**

Create `src/lib/supabase.ts`:

```typescript
import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

- [ ] **Step 6: 상수 파일 생성**

Create `src/lib/constants.ts`:

```typescript
export const BEEP_ID_LENGTH = 8;
export const MAX_CODE_LENGTH = 20;
export const MAX_MEMO_LENGTH = 30;
export const MESSAGE_TTL_HOURS = 24;
export const MAX_BEEP_ID_RETRIES = 5;
```

- [ ] **Step 7: 빌드 확인**

```bash
npx tsc --noEmit
```

Expected: 에러 없이 통과

- [ ] **Step 8: 커밋**

```bash
git init
echo "node_modules/\n.env\n.expo/\nios/\nandroid/\n*.jks\n*.p8\n*.p12\n*.key\n*.mobileprovision\n*.orig.*\nweb-build/\ndist/" > .gitignore
git add .
git commit -m "feat: init Expo Bare Workflow + Supabase client"
```

---

## Task 2: DB 스키마 마이그레이션

**Files:**
- Create: `supabase/migrations/001_initial_schema.sql`

- [ ] **Step 1: 마이그레이션 파일 생성**

Create `supabase/migrations/001_initial_schema.sql`:

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Seasons (referenced by skins and icons)
create table seasons (
  id uuid primary key default uuid_generate_v4(),
  name varchar(50) not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  created_at timestamptz default now()
);

-- Skins
create table skins (
  id uuid primary key default uuid_generate_v4(),
  name varchar(30) not null,
  slug varchar(30) unique,
  category varchar(20),
  assets_url text not null,
  is_free boolean default false,
  price_tier varchar(10),
  season_id uuid references seasons(id),
  created_at timestamptz default now()
);

-- Users
create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  beep_id varchar(8) unique not null,
  nickname varchar(20) not null,
  status_icon varchar(10) default 'online',
  active_skin_id uuid references skins(id),
  created_at timestamptz default now()
);

-- Friendships
create table friendships (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  friend_id uuid not null references users(id) on delete cascade,
  nickname varchar(20),
  vibration_pattern varchar(50),
  created_at timestamptz default now(),
  unique(user_id, friend_id),
  check (user_id != friend_id)
);

-- Messages
create table messages (
  id uuid primary key default uuid_generate_v4(),
  from_user uuid not null references users(id) on delete cascade,
  to_user uuid not null references users(id) on delete cascade,
  number_code varchar(20) not null,
  memo varchar(30),
  is_read boolean default false,
  is_saved boolean default false,
  expires_at timestamptz not null,
  created_at timestamptz default now()
);

-- Code Dictionary
create table code_dictionary (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  code varchar(20) not null,
  meaning varchar(50) not null,
  created_at timestamptz default now()
);

-- User Skins
create table user_skins (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  skin_id uuid not null references skins(id) on delete cascade,
  acquired_type varchar(20),
  acquired_at timestamptz default now(),
  unique(user_id, skin_id)
);

-- Icons
create table icons (
  id uuid primary key default uuid_generate_v4(),
  name varchar(30) not null,
  image_url text not null,
  rarity varchar(10) not null check (rarity in ('common', 'rare', 'epic', 'legendary')),
  drop_condition jsonb,
  season_id uuid references seasons(id),
  created_at timestamptz default now()
);

-- User Icons
create table user_icons (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  icon_id uuid not null references icons(id) on delete cascade,
  acquired_at timestamptz default now(),
  unique(user_id, icon_id)
);

-- Status Broadcasts
create table status_broadcasts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  status_icon varchar(10) not null,
  label varchar(20),
  updated_at timestamptz default now()
);

-- Indexes
create index idx_messages_to_user on messages(to_user, created_at desc);
create index idx_messages_expires on messages(expires_at) where is_saved = false;
create index idx_friendships_user on friendships(user_id);
create index idx_users_beep_id on users(beep_id);
create index idx_code_dictionary_user on code_dictionary(user_id);

-- RLS Policies
alter table users enable row level security;
alter table friendships enable row level security;
alter table messages enable row level security;
alter table code_dictionary enable row level security;
alter table user_skins enable row level security;
alter table user_icons enable row level security;
alter table status_broadcasts enable row level security;
alter table skins enable row level security;
alter table icons enable row level security;

-- Users: 자기 프로필 읽기/수정, 다른 사용자 beep_id로 검색 허용
create policy "users_select_own" on users for select using (auth.uid() = id);
create policy "users_update_own" on users for update using (auth.uid() = id);
create policy "users_insert_own" on users for insert with check (auth.uid() = id);
create policy "users_select_by_beep_id" on users for select using (true);

-- Friendships: 자기 친구만
create policy "friendships_select" on friendships for select using (auth.uid() = user_id);
create policy "friendships_insert" on friendships for insert with check (auth.uid() = user_id);
create policy "friendships_delete" on friendships for delete using (auth.uid() = user_id);
create policy "friendships_update" on friendships for update using (auth.uid() = user_id);

-- Messages: 보낸/받은 메시지
create policy "messages_select" on messages for select using (auth.uid() = to_user or auth.uid() = from_user);
create policy "messages_insert" on messages for insert with check (auth.uid() = from_user);
create policy "messages_update" on messages for update using (auth.uid() = to_user);

-- Code Dictionary: 자기 것만
create policy "dict_select" on code_dictionary for select using (auth.uid() = user_id);
create policy "dict_insert" on code_dictionary for insert with check (auth.uid() = user_id);
create policy "dict_update" on code_dictionary for update using (auth.uid() = user_id);
create policy "dict_delete" on code_dictionary for delete using (auth.uid() = user_id);

-- Skins: 모든 사용자 읽기 가능
create policy "skins_select_all" on skins for select using (true);

-- User Skins: 자기 것만
create policy "user_skins_select" on user_skins for select using (auth.uid() = user_id);
create policy "user_skins_insert" on user_skins for insert with check (auth.uid() = user_id);

-- Icons: 모든 사용자 읽기 가능
create policy "icons_select_all" on icons for select using (true);

-- User Icons: 자기 것만
create policy "user_icons_select" on user_icons for select using (auth.uid() = user_id);

-- Status Broadcasts: 친구에게 공개
create policy "status_select" on status_broadcasts for select using (true);
create policy "status_upsert" on status_broadcasts for insert with check (auth.uid() = user_id);
create policy "status_update" on status_broadcasts for update using (auth.uid() = user_id);

-- Seed: 기본 무료 스킨
insert into skins (name, slug, category, assets_url, is_free)
values ('뉴모피즘', 'neumorphism', 'default', '/skins/neumorphism', true);

-- Realtime 활성화
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table status_broadcasts;
```

- [ ] **Step 2: Supabase 대시보드에서 SQL 실행 또는 CLI로 마이그레이션**

```bash
# Supabase CLI 사용 시:
npx supabase db push
# 또는 Supabase 대시보드 > SQL Editor에서 직접 실행
```

- [ ] **Step 3: 커밋**

```bash
git add supabase/
git commit -m "feat: add initial DB schema with RLS policies"
```

---

## Task 3: 인증 서비스 + 스토어

**Files:**
- Create: `src/services/authService.ts`, `src/stores/authStore.ts`
- Test: `__tests__/services/authService.test.ts`

- [ ] **Step 1: 테스트 의존성 설치**

```bash
npm install --save-dev jest @types/jest ts-jest @testing-library/react-native @testing-library/jest-native
npx ts-jest config:init
```

Update `jest.config.js`:

```javascript
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testPathIgnorePatterns: ["/node_modules/", "/ios/", "/android/"],
};
```

- [ ] **Step 2: beep_id 생성 테스트 작성**

Create `__tests__/services/authService.test.ts`:

```typescript
import { generateBeepId, isValidBeepId } from "@/services/authService";

describe("generateBeepId", () => {
  it("generates an 8-digit numeric string", () => {
    const id = generateBeepId();
    expect(id).toHaveLength(8);
    expect(/^\d{8}$/.test(id)).toBe(true);
  });

  it("does not start with 0", () => {
    for (let i = 0; i < 100; i++) {
      const id = generateBeepId();
      expect(id[0]).not.toBe("0");
    }
  });
});

describe("isValidBeepId", () => {
  it("returns true for valid 8-digit string", () => {
    expect(isValidBeepId("12345678")).toBe(true);
  });

  it("returns false for too short", () => {
    expect(isValidBeepId("1234567")).toBe(false);
  });

  it("returns false for non-numeric", () => {
    expect(isValidBeepId("1234567a")).toBe(false);
  });

  it("returns false for empty", () => {
    expect(isValidBeepId("")).toBe(false);
  });
});
```

- [ ] **Step 3: 테스트 실패 확인**

```bash
npx jest __tests__/services/authService.test.ts
```

Expected: FAIL — `Cannot find module '@/services/authService'`

- [ ] **Step 4: authService 구현**

Create `src/services/authService.ts`:

```typescript
import { supabase } from "@/lib/supabase";
import { BEEP_ID_LENGTH, MAX_BEEP_ID_RETRIES } from "@/lib/constants";

export function generateBeepId(): string {
  const first = Math.floor(Math.random() * 9) + 1; // 1-9
  const rest = Array.from({ length: BEEP_ID_LENGTH - 1 }, () =>
    Math.floor(Math.random() * 10)
  ).join("");
  return `${first}${rest}`;
}

export function isValidBeepId(id: string): boolean {
  return new RegExp(`^\\d{${BEEP_ID_LENGTH}}$`).test(id);
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
  });
  if (error) throw error;
  return data;
}

export async function signInWithApple() {
  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: "apple",
    token: "", // Apple Sign In token은 네이티브에서 받아옴
  });
  if (error) throw error;
  return data;
}

export async function createUserProfile(userId: string, nickname: string) {
  let beepId = "";
  for (let attempt = 0; attempt < MAX_BEEP_ID_RETRIES; attempt++) {
    beepId = generateBeepId();
    const { error } = await supabase.from("users").insert({
      id: userId,
      beep_id: beepId,
      nickname,
    });
    if (!error) {
      // 기본 무료 스킨 부여
      const { data: freeSkin } = await supabase
        .from("skins")
        .select("id")
        .eq("is_free", true)
        .single();
      if (freeSkin) {
        await supabase.from("user_skins").insert({
          user_id: userId,
          skin_id: freeSkin.id,
          acquired_type: "default",
        });
        await supabase
          .from("users")
          .update({ active_skin_id: freeSkin.id })
          .eq("id", userId);
      }
      return beepId;
    }
    if (error.code !== "23505") throw error; // 23505 = unique violation → retry
  }
  throw new Error("beep_id 생성 실패: 최대 재시도 횟수 초과");
}

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
```

- [ ] **Step 5: 테스트 통과 확인**

```bash
npx jest __tests__/services/authService.test.ts
```

Expected: PASS (2 suites, 5 tests)

- [ ] **Step 6: authStore 생성**

Create `src/stores/authStore.ts`:

```typescript
import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { createUserProfile, getUserProfile } from "@/services/authService";
import type { Session, User } from "@supabase/supabase-js";

interface UserProfile {
  id: string;
  beep_id: string;
  nickname: string;
  status_icon: string;
  active_skin_id: string | null;
}

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  setSession: (session: Session | null) => void;
  fetchProfile: () => Promise<void>;
  initProfile: (nickname: string) => Promise<string>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  loading: true,

  setSession: (session) => {
    set({ session, user: session?.user ?? null, loading: false });
  },

  fetchProfile: async () => {
    const user = get().user;
    if (!user) return;
    try {
      const profile = await getUserProfile(user.id);
      set({ profile });
    } catch {
      set({ profile: null });
    }
  },

  initProfile: async (nickname: string) => {
    const user = get().user;
    if (!user) throw new Error("Not authenticated");
    const beepId = await createUserProfile(user.id, nickname);
    await get().fetchProfile();
    return beepId;
  },
}));
```

- [ ] **Step 7: 커밋**

```bash
git add src/services/authService.ts src/stores/authStore.ts src/lib/ __tests__/ jest.config.js
git commit -m "feat: auth service with beep_id generation + auth store"
```

---

## Task 4: 메시지 서비스 + 스토어

**Files:**
- Create: `src/services/messageService.ts`, `src/stores/messageStore.ts`
- Test: `__tests__/services/messageService.test.ts`

- [ ] **Step 1: 메시지 유효성 검사 테스트 작성**

Create `__tests__/services/messageService.test.ts`:

```typescript
import { validateMessage } from "@/services/messageService";

describe("validateMessage", () => {
  it("accepts valid number code", () => {
    expect(validateMessage("012486")).toEqual({ valid: true });
  });

  it("accepts code with memo", () => {
    expect(validateMessage("012486", "사랑해")).toEqual({ valid: true });
  });

  it("rejects empty code", () => {
    expect(validateMessage("")).toEqual({
      valid: false,
      error: "숫자 코드를 입력하세요",
    });
  });

  it("rejects code over 20 chars", () => {
    expect(validateMessage("123456789012345678901")).toEqual({
      valid: false,
      error: "숫자 코드는 20자리 이하여야 합니다",
    });
  });

  it("rejects non-numeric code", () => {
    expect(validateMessage("abc123")).toEqual({
      valid: false,
      error: "숫자만 입력 가능합니다",
    });
  });

  it("rejects memo over 30 chars", () => {
    const longMemo = "a".repeat(31);
    expect(validateMessage("012486", longMemo)).toEqual({
      valid: false,
      error: "메모는 30자 이하여야 합니다",
    });
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
npx jest __tests__/services/messageService.test.ts
```

Expected: FAIL

- [ ] **Step 3: messageService 구현**

Create `src/services/messageService.ts`:

```typescript
import { supabase } from "@/lib/supabase";
import { MAX_CODE_LENGTH, MAX_MEMO_LENGTH, MESSAGE_TTL_HOURS } from "@/lib/constants";

interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateMessage(code: string, memo?: string): ValidationResult {
  if (!code) return { valid: false, error: "숫자 코드를 입력하세요" };
  if (code.length > MAX_CODE_LENGTH)
    return { valid: false, error: `숫자 코드는 ${MAX_CODE_LENGTH}자리 이하여야 합니다` };
  if (!/^\d+$/.test(code))
    return { valid: false, error: "숫자만 입력 가능합니다" };
  if (memo && memo.length > MAX_MEMO_LENGTH)
    return { valid: false, error: `메모는 ${MAX_MEMO_LENGTH}자 이하여야 합니다` };
  return { valid: true };
}

export async function sendMessage(
  fromUserId: string,
  toUserId: string,
  numberCode: string,
  memo?: string
) {
  const validation = validateMessage(numberCode, memo);
  if (!validation.valid) throw new Error(validation.error);

  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + MESSAGE_TTL_HOURS);

  const { data, error } = await supabase
    .from("messages")
    .insert({
      from_user: fromUserId,
      to_user: toUserId,
      number_code: numberCode,
      memo: memo || null,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getReceivedMessages(userId: string) {
  const { data, error } = await supabase
    .from("messages")
    .select("*, from_user_profile:users!messages_from_user_fkey(nickname, beep_id)")
    .eq("to_user", userId)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function markAsRead(messageId: string) {
  const { error } = await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("id", messageId);
  if (error) throw error;
}

export async function saveMessage(messageId: string) {
  const { error } = await supabase
    .from("messages")
    .update({ is_saved: true })
    .eq("id", messageId);
  if (error) throw error;
}

export async function getSavedMessages(userId: string) {
  const { data, error } = await supabase
    .from("messages")
    .select("*, from_user_profile:users!messages_from_user_fkey(nickname, beep_id)")
    .eq("to_user", userId)
    .eq("is_saved", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npx jest __tests__/services/messageService.test.ts
```

Expected: PASS (6 tests)

- [ ] **Step 5: messageStore 생성**

Create `src/stores/messageStore.ts`:

```typescript
import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import {
  getReceivedMessages,
  getSavedMessages,
  markAsRead,
  saveMessage,
  sendMessage,
} from "@/services/messageService";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface Message {
  id: string;
  from_user: string;
  to_user: string;
  number_code: string;
  memo: string | null;
  is_read: boolean;
  is_saved: boolean;
  expires_at: string;
  created_at: string;
  from_user_profile?: { nickname: string; beep_id: string };
}

interface MessageState {
  received: Message[];
  saved: Message[];
  loading: boolean;
  channel: RealtimeChannel | null;
  fetchReceived: (userId: string) => Promise<void>;
  fetchSaved: (userId: string) => Promise<void>;
  send: (fromId: string, toId: string, code: string, memo?: string) => Promise<void>;
  read: (messageId: string) => Promise<void>;
  save: (messageId: string) => Promise<void>;
  subscribeRealtime: (userId: string) => void;
  unsubscribeRealtime: () => void;
}

export const useMessageStore = create<MessageState>((set, get) => ({
  received: [],
  saved: [],
  loading: false,
  channel: null,

  fetchReceived: async (userId) => {
    set({ loading: true });
    const received = await getReceivedMessages(userId);
    set({ received, loading: false });
  },

  fetchSaved: async (userId) => {
    const saved = await getSavedMessages(userId);
    set({ saved });
  },

  send: async (fromId, toId, code, memo) => {
    await sendMessage(fromId, toId, code, memo);
  },

  read: async (messageId) => {
    await markAsRead(messageId);
    set((state) => ({
      received: state.received.map((m) =>
        m.id === messageId ? { ...m, is_read: true } : m
      ),
    }));
  },

  save: async (messageId) => {
    await saveMessage(messageId);
    const msg = get().received.find((m) => m.id === messageId);
    if (msg) {
      set((state) => ({
        received: state.received.map((m) =>
          m.id === messageId ? { ...m, is_saved: true } : m
        ),
        saved: [{ ...msg, is_saved: true }, ...state.saved],
      }));
    }
  },

  subscribeRealtime: (userId) => {
    const channel = supabase
      .channel(`messages:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `to_user=eq.${userId}`,
        },
        async () => {
          await get().fetchReceived(userId);
        }
      )
      .subscribe();
    set({ channel });
  },

  unsubscribeRealtime: () => {
    const { channel } = get();
    if (channel) {
      supabase.removeChannel(channel);
      set({ channel: null });
    }
  },
}));
```

- [ ] **Step 6: 커밋**

```bash
git add src/services/messageService.ts src/stores/messageStore.ts __tests__/services/messageService.test.ts
git commit -m "feat: message service with validation, TTL, realtime + store"
```

---

## Task 5: 친구 서비스 + 스토어

**Files:**
- Create: `src/services/friendService.ts`, `src/stores/friendStore.ts`
- Test: `__tests__/services/friendService.test.ts`

- [ ] **Step 1: 친구 서비스 테스트 작성**

Create `__tests__/services/friendService.test.ts`:

```typescript
import { isValidBeepId } from "@/services/authService";

describe("friend lookup validation", () => {
  it("accepts valid beep_id for friend search", () => {
    expect(isValidBeepId("12345678")).toBe(true);
  });

  it("rejects invalid beep_id", () => {
    expect(isValidBeepId("abc")).toBe(false);
    expect(isValidBeepId("")).toBe(false);
    expect(isValidBeepId("123")).toBe(false);
  });
});
```

- [ ] **Step 2: 테스트 통과 확인**

```bash
npx jest __tests__/services/friendService.test.ts
```

Expected: PASS (isValidBeepId는 이미 구현됨)

- [ ] **Step 3: friendService 구현**

Create `src/services/friendService.ts`:

```typescript
import { supabase } from "@/lib/supabase";
import { isValidBeepId } from "@/services/authService";

export async function findUserByBeepId(beepId: string) {
  if (!isValidBeepId(beepId)) return null;
  const { data, error } = await supabase
    .from("users")
    .select("id, beep_id, nickname")
    .eq("beep_id", beepId)
    .single();
  if (error) return null;
  return data;
}

export async function addFriend(userId: string, friendId: string, nickname?: string) {
  if (userId === friendId) throw new Error("자기 자신을 친구로 추가할 수 없습니다");

  const { error } = await supabase.from("friendships").insert({
    user_id: userId,
    friend_id: friendId,
    nickname: nickname || null,
  });

  if (error) {
    if (error.code === "23505") throw new Error("이미 친구입니다");
    throw error;
  }
}

export async function removeFriend(userId: string, friendId: string) {
  const { error } = await supabase
    .from("friendships")
    .delete()
    .eq("user_id", userId)
    .eq("friend_id", friendId);
  if (error) throw error;
}

export async function getFriends(userId: string) {
  const { data, error } = await supabase
    .from("friendships")
    .select("*, friend:users!friendships_friend_id_fkey(id, beep_id, nickname, status_icon)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function updateFriendNickname(
  userId: string,
  friendId: string,
  nickname: string
) {
  const { error } = await supabase
    .from("friendships")
    .update({ nickname })
    .eq("user_id", userId)
    .eq("friend_id", friendId);
  if (error) throw error;
}

export async function updateVibrationPattern(
  userId: string,
  friendId: string,
  pattern: string
) {
  const { error } = await supabase
    .from("friendships")
    .update({ vibration_pattern: pattern })
    .eq("user_id", userId)
    .eq("friend_id", friendId);
  if (error) throw error;
}
```

- [ ] **Step 4: friendStore 생성**

Create `src/stores/friendStore.ts`:

```typescript
import { create } from "zustand";
import {
  addFriend,
  findUserByBeepId,
  getFriends,
  removeFriend,
  updateFriendNickname,
  updateVibrationPattern,
} from "@/services/friendService";

interface Friend {
  id: string;
  user_id: string;
  friend_id: string;
  nickname: string | null;
  vibration_pattern: string | null;
  friend: {
    id: string;
    beep_id: string;
    nickname: string;
    status_icon: string;
  };
}

interface FriendState {
  friends: Friend[];
  loading: boolean;
  fetch: (userId: string) => Promise<void>;
  add: (userId: string, friendBeepId: string, nickname?: string) => Promise<void>;
  remove: (userId: string, friendId: string) => Promise<void>;
  updateNickname: (userId: string, friendId: string, nickname: string) => Promise<void>;
  updateVibration: (userId: string, friendId: string, pattern: string) => Promise<void>;
}

export const useFriendStore = create<FriendState>((set, get) => ({
  friends: [],
  loading: false,

  fetch: async (userId) => {
    set({ loading: true });
    const friends = await getFriends(userId);
    set({ friends, loading: false });
  },

  add: async (userId, friendBeepId, nickname) => {
    const found = await findUserByBeepId(friendBeepId);
    if (!found) throw new Error("존재하지 않는 삐삐 번호입니다");
    await addFriend(userId, found.id, nickname);
    await get().fetch(userId);
  },

  remove: async (userId, friendId) => {
    await removeFriend(userId, friendId);
    set((state) => ({
      friends: state.friends.filter((f) => f.friend_id !== friendId),
    }));
  },

  updateNickname: async (userId, friendId, nickname) => {
    await updateFriendNickname(userId, friendId, nickname);
    set((state) => ({
      friends: state.friends.map((f) =>
        f.friend_id === friendId ? { ...f, nickname } : f
      ),
    }));
  },

  updateVibration: async (userId, friendId, pattern) => {
    await updateVibrationPattern(userId, friendId, pattern);
    set((state) => ({
      friends: state.friends.map((f) =>
        f.friend_id === friendId ? { ...f, vibration_pattern: pattern } : f
      ),
    }));
  },
}));
```

- [ ] **Step 5: 커밋**

```bash
git add src/services/friendService.ts src/stores/friendStore.ts __tests__/services/friendService.test.ts
git commit -m "feat: friend service with beep_id lookup, vibration patterns + store"
```

---

## Task 6: 암호표 서비스 + 스토어

**Files:**
- Create: `src/services/dictionaryService.ts`, `src/stores/dictionaryStore.ts`
- Test: `__tests__/services/dictionaryService.test.ts`

- [ ] **Step 1: 암호표 유효성 검사 테스트 작성**

Create `__tests__/services/dictionaryService.test.ts`:

```typescript
import { validateDictionaryEntry } from "@/services/dictionaryService";

describe("validateDictionaryEntry", () => {
  it("accepts valid entry", () => {
    expect(validateDictionaryEntry("012486", "영원히 사랑해")).toEqual({ valid: true });
  });

  it("rejects empty code", () => {
    expect(validateDictionaryEntry("", "의미")).toEqual({
      valid: false,
      error: "숫자 코드를 입력하세요",
    });
  });

  it("rejects empty meaning", () => {
    expect(validateDictionaryEntry("012486", "")).toEqual({
      valid: false,
      error: "의미를 입력하세요",
    });
  });

  it("rejects meaning over 50 chars", () => {
    expect(validateDictionaryEntry("012486", "a".repeat(51))).toEqual({
      valid: false,
      error: "의미는 50자 이하여야 합니다",
    });
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
npx jest __tests__/services/dictionaryService.test.ts
```

Expected: FAIL

- [ ] **Step 3: dictionaryService 구현**

Create `src/services/dictionaryService.ts`:

```typescript
import { supabase } from "@/lib/supabase";
import { MAX_CODE_LENGTH } from "@/lib/constants";

interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateDictionaryEntry(code: string, meaning: string): ValidationResult {
  if (!code) return { valid: false, error: "숫자 코드를 입력하세요" };
  if (code.length > MAX_CODE_LENGTH)
    return { valid: false, error: `숫자 코드는 ${MAX_CODE_LENGTH}자리 이하여야 합니다` };
  if (!meaning) return { valid: false, error: "의미를 입력하세요" };
  if (meaning.length > 50)
    return { valid: false, error: "의미는 50자 이하여야 합니다" };
  return { valid: true };
}

export async function getDictionary(userId: string) {
  const { data, error } = await supabase
    .from("code_dictionary")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function addEntry(userId: string, code: string, meaning: string) {
  const validation = validateDictionaryEntry(code, meaning);
  if (!validation.valid) throw new Error(validation.error);

  const { data, error } = await supabase
    .from("code_dictionary")
    .insert({ user_id: userId, code, meaning })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateEntry(entryId: string, code: string, meaning: string) {
  const validation = validateDictionaryEntry(code, meaning);
  if (!validation.valid) throw new Error(validation.error);

  const { error } = await supabase
    .from("code_dictionary")
    .update({ code, meaning })
    .eq("id", entryId);
  if (error) throw error;
}

export async function deleteEntry(entryId: string) {
  const { error } = await supabase
    .from("code_dictionary")
    .delete()
    .eq("id", entryId);
  if (error) throw error;
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npx jest __tests__/services/dictionaryService.test.ts
```

Expected: PASS (4 tests)

- [ ] **Step 5: dictionaryStore 생성**

Create `src/stores/dictionaryStore.ts`:

```typescript
import { create } from "zustand";
import {
  addEntry,
  deleteEntry,
  getDictionary,
  updateEntry,
} from "@/services/dictionaryService";

interface DictionaryEntry {
  id: string;
  user_id: string;
  code: string;
  meaning: string;
  created_at: string;
}

interface DictionaryState {
  entries: DictionaryEntry[];
  loading: boolean;
  fetch: (userId: string) => Promise<void>;
  add: (userId: string, code: string, meaning: string) => Promise<void>;
  update: (entryId: string, code: string, meaning: string) => Promise<void>;
  remove: (entryId: string) => Promise<void>;
}

export const useDictionaryStore = create<DictionaryState>((set, get) => ({
  entries: [],
  loading: false,

  fetch: async (userId) => {
    set({ loading: true });
    const entries = await getDictionary(userId);
    set({ entries, loading: false });
  },

  add: async (userId, code, meaning) => {
    const entry = await addEntry(userId, code, meaning);
    set((state) => ({ entries: [entry, ...state.entries] }));
  },

  update: async (entryId, code, meaning) => {
    await updateEntry(entryId, code, meaning);
    set((state) => ({
      entries: state.entries.map((e) =>
        e.id === entryId ? { ...e, code, meaning } : e
      ),
    }));
  },

  remove: async (entryId) => {
    await deleteEntry(entryId);
    set((state) => ({
      entries: state.entries.filter((e) => e.id !== entryId),
    }));
  },
}));
```

- [ ] **Step 6: 커밋**

```bash
git add src/services/dictionaryService.ts src/stores/dictionaryStore.ts __tests__/services/dictionaryService.test.ts
git commit -m "feat: code dictionary CRUD service + store"
```

---

## Task 7: 뉴모피즘 테마 + 공통 컴포넌트

**Files:**
- Create: `src/theme/neumorphism.ts`, `src/theme/fonts.ts`
- Create: `src/components/LcdDisplay.tsx`, `src/components/BeepButton.tsx`, `src/components/CodeInput.tsx`

- [ ] **Step 1: 뉴모피즘 테마 토큰 생성**

Create `src/theme/neumorphism.ts`:

```typescript
export const neumorphism = {
  colors: {
    background: "#E8E8E8",
    surface: "#E0E0E0",
    lcdBackground: "#C8D8C0",
    lcdText: "#1A4A1A",
    lcdSubtext: "#3A7A3A",
    primary: "#6A6A8A",
    secondary: "#8A8AAA",
    accent: "#C47080",
    textPrimary: "#3A3A5A",
    textSecondary: "#8A8A9A",
    border: "rgba(180,160,220,0.2)",
  },
  shadows: {
    raised: {
      shadowColor: "#FFFFFF",
      shadowOffset: { width: -4, height: -4 },
      shadowOpacity: 0.7,
      shadowRadius: 6,
      elevation: 4,
    },
    raisedDark: {
      shadowColor: "#B8B8C8",
      shadowOffset: { width: 4, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 6,
      elevation: 4,
    },
    inset: {
      shadowColor: "#B8B8C8",
      shadowOffset: { width: 2, height: 2 },
      shadowOpacity: 0.4,
      shadowRadius: 4,
      elevation: 2,
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 8,
    md: 14,
    lg: 20,
    round: 999,
  },
  fonts: {
    lcd: "VT323",
    pixel: "Silkscreen",
    ui: "Inter",
    mono: "SpaceMono",
  },
} as const;

export type Theme = typeof neumorphism;
```

- [ ] **Step 2: 폰트 설정**

Create `src/theme/fonts.ts`:

```typescript
export const customFonts = {
  VT323: require("../../assets/fonts/VT323-Regular.ttf"),
  Silkscreen: require("../../assets/fonts/Silkscreen-Regular.ttf"),
  "Silkscreen-Bold": require("../../assets/fonts/Silkscreen-Bold.ttf"),
  SpaceMono: require("../../assets/fonts/SpaceMono-Regular.ttf"),
  Inter: require("../../assets/fonts/Inter-Regular.ttf"),
  "Inter-Bold": require("../../assets/fonts/Inter-Bold.ttf"),
};
```

- [ ] **Step 3: LCD 디스플레이 컴포넌트**

Create `src/components/LcdDisplay.tsx`:

```tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { neumorphism as theme } from "@/theme/neumorphism";

interface LcdDisplayProps {
  fromName: string;
  code: string;
  time: string;
  isNew?: boolean;
}

export function LcdDisplay({ fromName, code, time, isNew }: LcdDisplayProps) {
  return (
    <View style={styles.container}>
      <View style={styles.lcd}>
        <View style={styles.header}>
          <Text style={styles.from}>FROM: {fromName}</Text>
          {isNew && <Text style={styles.newBadge}>NEW</Text>}
        </View>
        <Text style={styles.code}>{code}</Text>
        <Text style={styles.time}>{time}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.md,
    padding: 3,
    backgroundColor: theme.colors.surface,
    ...theme.shadows.inset,
  },
  lcd: {
    backgroundColor: theme.colors.lcdBackground,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.xs,
  },
  from: {
    fontFamily: theme.fonts.lcd,
    fontSize: 14,
    color: theme.colors.lcdSubtext,
    opacity: 0.8,
  },
  newBadge: {
    fontFamily: theme.fonts.lcd,
    fontSize: 12,
    color: theme.colors.accent,
  },
  code: {
    fontFamily: theme.fonts.lcd,
    fontSize: 40,
    color: theme.colors.lcdText,
    textAlign: "center",
    letterSpacing: 4,
    paddingVertical: theme.spacing.sm,
  },
  time: {
    fontFamily: theme.fonts.lcd,
    fontSize: 12,
    color: theme.colors.lcdSubtext,
    textAlign: "right",
    opacity: 0.6,
  },
});
```

- [ ] **Step 4: 뉴모피즘 버튼 컴포넌트**

Create `src/components/BeepButton.tsx`:

```tsx
import React from "react";
import { Pressable, Text, StyleSheet, ViewStyle } from "react-native";
import { neumorphism as theme } from "@/theme/neumorphism";

interface BeepButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger";
  style?: ViewStyle;
  disabled?: boolean;
}

export function BeepButton({
  title,
  onPress,
  variant = "primary",
  style,
  disabled,
}: BeepButtonProps) {
  const variantColors = {
    primary: theme.colors.primary,
    secondary: theme.colors.secondary,
    danger: theme.colors.accent,
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        pressed ? styles.pressed : styles.raised,
        { opacity: disabled ? 0.5 : 1 },
        style,
      ]}
    >
      <Text style={[styles.text, { color: variantColors[variant] }]}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.sm,
    paddingVertical: theme.spacing.sm + 2,
    paddingHorizontal: theme.spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  raised: {
    ...theme.shadows.raised,
  },
  pressed: {
    ...theme.shadows.inset,
  },
  text: {
    fontFamily: theme.fonts.pixel,
    fontSize: 12,
    fontWeight: "600",
  },
});
```

- [ ] **Step 5: 숫자 코드 입력 컴포넌트**

Create `src/components/CodeInput.tsx`:

```tsx
import React from "react";
import { TextInput, StyleSheet, View, Text } from "react-native";
import { neumorphism as theme } from "@/theme/neumorphism";
import { MAX_CODE_LENGTH } from "@/lib/constants";

interface CodeInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  maxLength?: number;
  label?: string;
}

export function CodeInput({
  value,
  onChangeText,
  placeholder = "숫자 코드 입력",
  maxLength = MAX_CODE_LENGTH,
  label,
}: CodeInputProps) {
  const handleChange = (text: string) => {
    const numericOnly = text.replace(/[^0-9]/g, "");
    onChangeText(numericOnly);
  };

  return (
    <View>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={handleChange}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textSecondary}
          keyboardType="number-pad"
          maxLength={maxLength}
        />
      </View>
      <Text style={styles.counter}>
        {value.length}/{maxLength}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.sm,
    ...theme.shadows.inset,
  },
  label: {
    fontFamily: theme.fonts.pixel,
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
    letterSpacing: 1,
  },
  input: {
    fontFamily: theme.fonts.lcd,
    fontSize: 28,
    color: theme.colors.lcdText,
    textAlign: "center",
    padding: theme.spacing.md,
    letterSpacing: 4,
  },
  counter: {
    fontFamily: theme.fonts.mono,
    fontSize: 10,
    color: theme.colors.textSecondary,
    textAlign: "right",
    marginTop: theme.spacing.xs,
  },
});
```

- [ ] **Step 6: 커밋**

```bash
git add src/theme/ src/components/
git commit -m "feat: neumorphism theme tokens + LCD display, button, code input components"
```

---

## Task 8: 네비게이션 + 화면 레이아웃

**Files:**
- Create: `src/navigation/RootNavigator.tsx`, `App.tsx`
- Create: `src/screens/AuthScreen.tsx`, `src/screens/HomeScreen.tsx`, `src/screens/SendScreen.tsx`
- Create: `src/screens/FriendsScreen.tsx`, `src/screens/DictionaryScreen.tsx`, `src/screens/ProfileScreen.tsx`

- [ ] **Step 1: RootNavigator 생성**

Create `src/navigation/RootNavigator.tsx`:

```tsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useAuthStore } from "@/stores/authStore";
import { AuthScreen } from "@/screens/AuthScreen";
import { HomeScreen } from "@/screens/HomeScreen";
import { SendScreen } from "@/screens/SendScreen";
import { FriendsScreen } from "@/screens/FriendsScreen";
import { DictionaryScreen } from "@/screens/DictionaryScreen";
import { ProfileScreen } from "@/screens/ProfileScreen";
import { neumorphism as theme } from "@/theme/neumorphism";
import { Text } from "react-native";

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Send: { friendId: string; friendName: string };
};

export type MainTabParamList = {
  Home: undefined;
  Friends: undefined;
  Dictionary: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text
      style={{
        fontFamily: theme.fonts.pixel,
        fontSize: 10,
        color: focused ? theme.colors.primary : theme.colors.textSecondary,
      }}
    >
      {label}
    </Text>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.border,
          paddingTop: 8,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="HOME" focused={focused} /> }}
      />
      <Tab.Screen
        name="Friends"
        component={FriendsScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="FRIENDS" focused={focused} /> }}
      />
      <Tab.Screen
        name="Dictionary"
        component={DictionaryScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="CODES" focused={focused} /> }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="MY" focused={focused} /> }}
      />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const { session, profile } = useAuthStore();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!session || !profile ? (
        <Stack.Screen name="Auth" component={AuthScreen} />
      ) : (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen
            name="Send"
            component={SendScreen}
            options={{ presentation: "modal" }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
```

- [ ] **Step 2: AuthScreen (로그인) 생성**

Create `src/screens/AuthScreen.tsx`:

```tsx
import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, Alert } from "react-native";
import { neumorphism as theme } from "@/theme/neumorphism";
import { BeepButton } from "@/components/BeepButton";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/lib/supabase";

export function AuthScreen() {
  const { setSession, initProfile } = useAuthStore();
  const [nickname, setNickname] = useState("");
  const [step, setStep] = useState<"login" | "nickname">("login");

  const handleGoogleLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
      });
      if (error) throw error;
    } catch (err: any) {
      Alert.alert("로그인 실패", err.message);
    }
  };

  const handleSetNickname = async () => {
    if (!nickname.trim()) {
      Alert.alert("닉네임을 입력하세요");
      return;
    }
    try {
      const beepId = await initProfile(nickname.trim());
      Alert.alert("가입 완료", `삐삐 번호: ${beepId}`);
    } catch (err: any) {
      Alert.alert("오류", err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.brand}>BEEP-GET</Text>
      <Text style={styles.subtitle}>홈 화면에 삐삐 한 대를 놓다</Text>

      {step === "login" ? (
        <View style={styles.buttons}>
          <BeepButton title="Google로 시작" onPress={handleGoogleLogin} />
          <BeepButton
            title="Apple로 시작"
            onPress={() => {}}
            variant="secondary"
          />
        </View>
      ) : (
        <View style={styles.nicknameForm}>
          <Text style={styles.label}>닉네임</Text>
          <TextInput
            style={styles.input}
            value={nickname}
            onChangeText={setNickname}
            placeholder="2~20자"
            placeholderTextColor={theme.colors.textSecondary}
            maxLength={20}
          />
          <BeepButton title="시작하기" onPress={handleSetNickname} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.xl,
  },
  brand: {
    fontFamily: theme.fonts.pixel,
    fontSize: 28,
    color: theme.colors.primary,
    letterSpacing: 4,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontFamily: theme.fonts.lcd,
    fontSize: 18,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl * 2,
  },
  buttons: {
    width: "100%",
    gap: theme.spacing.md,
  },
  nicknameForm: {
    width: "100%",
    gap: theme.spacing.md,
  },
  label: {
    fontFamily: theme.fonts.pixel,
    fontSize: 11,
    color: theme.colors.textSecondary,
    letterSpacing: 1,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.md,
    fontFamily: theme.fonts.lcd,
    fontSize: 20,
    color: theme.colors.textPrimary,
    textAlign: "center",
  },
});
```

- [ ] **Step 3: HomeScreen (메인 LCD) 생성**

Create `src/screens/HomeScreen.tsx`:

```tsx
import React, { useEffect } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { neumorphism as theme } from "@/theme/neumorphism";
import { LcdDisplay } from "@/components/LcdDisplay";
import { BeepButton } from "@/components/BeepButton";
import { useAuthStore } from "@/stores/authStore";
import { useMessageStore } from "@/stores/messageStore";

export function HomeScreen() {
  const { profile } = useAuthStore();
  const { received, loading, fetchReceived, read, save, subscribeRealtime, unsubscribeRealtime } =
    useMessageStore();

  useEffect(() => {
    if (!profile) return;
    fetchReceived(profile.id);
    subscribeRealtime(profile.id);
    return () => unsubscribeRealtime();
  }, [profile?.id]);

  const latestMessage = received[0];

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const h = d.getHours();
    const m = d.getMinutes().toString().padStart(2, "0");
    return `${h >= 12 ? "PM" : "AM"} ${h % 12 || 12}:${m}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>BEEP-GET</Text>

      {latestMessage ? (
        <View style={styles.lcdArea}>
          <LcdDisplay
            fromName={latestMessage.from_user_profile?.nickname ?? "???"}
            code={latestMessage.number_code}
            time={formatTime(latestMessage.created_at)}
            isNew={!latestMessage.is_read}
          />
          <View style={styles.actions}>
            <BeepButton
              title="확인"
              onPress={() => read(latestMessage.id)}
              style={{ flex: 1 }}
            />
            <BeepButton
              title="저장"
              onPress={() => save(latestMessage.id)}
              variant="secondary"
              style={{ flex: 1 }}
            />
          </View>
        </View>
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>수신된 신호 없음</Text>
        </View>
      )}

      {received.length > 1 && (
        <FlatList
          data={received.slice(1)}
          keyExtractor={(item) => item.id}
          style={styles.list}
          renderItem={({ item }) => (
            <View style={styles.listItem}>
              <Text style={styles.listName}>
                {item.from_user_profile?.nickname ?? "???"}
              </Text>
              <Text style={styles.listCode}>{item.number_code}</Text>
              <Text style={styles.listTime}>{formatTime(item.created_at)}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  header: {
    fontFamily: theme.fonts.pixel,
    fontSize: 14,
    color: theme.colors.textSecondary,
    letterSpacing: 2,
    textAlign: "center",
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.xl,
  },
  lcdArea: {
    gap: theme.spacing.md,
  },
  actions: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  empty: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.xl * 2,
    alignItems: "center",
    ...theme.shadows.inset,
  },
  emptyText: {
    fontFamily: theme.fonts.lcd,
    fontSize: 18,
    color: theme.colors.textSecondary,
  },
  list: {
    marginTop: theme.spacing.lg,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  listName: {
    fontFamily: theme.fonts.lcd,
    fontSize: 16,
    color: theme.colors.textPrimary,
    flex: 1,
  },
  listCode: {
    fontFamily: theme.fonts.lcd,
    fontSize: 16,
    color: theme.colors.lcdText,
    marginRight: theme.spacing.md,
  },
  listTime: {
    fontFamily: theme.fonts.lcd,
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
});
```

- [ ] **Step 4: SendScreen, FriendsScreen, DictionaryScreen, ProfileScreen 스텁 생성**

Create `src/screens/SendScreen.tsx`:

```tsx
import React, { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { neumorphism as theme } from "@/theme/neumorphism";
import { CodeInput } from "@/components/CodeInput";
import { BeepButton } from "@/components/BeepButton";
import { useMessageStore } from "@/stores/messageStore";
import { useAuthStore } from "@/stores/authStore";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/navigation/RootNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "Send">;

export function SendScreen({ route, navigation }: Props) {
  const { friendId, friendName } = route.params;
  const { profile } = useAuthStore();
  const { send } = useMessageStore();
  const [code, setCode] = useState("");
  const [memo, setMemo] = useState("");

  const handleSend = async () => {
    if (!profile || !code) return;
    try {
      await send(profile.id, friendId, code, memo || undefined);
      Alert.alert("전송 완료", `${friendName}에게 ${code} 전송`);
      navigation.goBack();
    } catch (err: any) {
      Alert.alert("전송 실패", err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.to}>TO: {friendName}</Text>
      <CodeInput value={code} onChangeText={setCode} label="숫자 코드" />
      <CodeInput
        value={memo}
        onChangeText={setMemo}
        label="메모 (선택)"
        placeholder="짧은 메모"
        maxLength={30}
      />
      <BeepButton title="전송" onPress={handleSend} disabled={!code} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  to: {
    fontFamily: theme.fonts.lcd,
    fontSize: 20,
    color: theme.colors.primary,
    textAlign: "center",
    marginTop: theme.spacing.xl,
  },
});
```

Create `src/screens/FriendsScreen.tsx`:

```tsx
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TextInput, Alert } from "react-native";
import { neumorphism as theme } from "@/theme/neumorphism";
import { BeepButton } from "@/components/BeepButton";
import { useAuthStore } from "@/stores/authStore";
import { useFriendStore } from "@/stores/friendStore";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/navigation/RootNavigator";

export function FriendsScreen() {
  const { profile } = useAuthStore();
  const { friends, loading, fetch, add } = useFriendStore();
  const [beepIdInput, setBeepIdInput] = useState("");
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    if (profile) fetch(profile.id);
  }, [profile?.id]);

  const handleAdd = async () => {
    if (!profile || !beepIdInput) return;
    try {
      await add(profile.id, beepIdInput);
      setBeepIdInput("");
      Alert.alert("친구 추가 완료");
    } catch (err: any) {
      Alert.alert("오류", err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>FRIENDS</Text>
      <View style={styles.addRow}>
        <TextInput
          style={styles.input}
          value={beepIdInput}
          onChangeText={setBeepIdInput}
          placeholder="삐삐 번호 8자리"
          placeholderTextColor={theme.colors.textSecondary}
          keyboardType="number-pad"
          maxLength={8}
        />
        <BeepButton title="추가" onPress={handleAdd} />
      </View>
      <FlatList
        data={friends}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.friendItem}>
            <View style={styles.friendInfo}>
              <Text style={styles.friendName}>
                {item.nickname || item.friend.nickname}
              </Text>
              <Text style={styles.friendBeepId}>{item.friend.beep_id}</Text>
            </View>
            <BeepButton
              title="신호"
              onPress={() =>
                navigation.navigate("Send", {
                  friendId: item.friend_id,
                  friendName: item.nickname || item.friend.nickname,
                })
              }
              variant="secondary"
            />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  header: {
    fontFamily: theme.fonts.pixel,
    fontSize: 14,
    color: theme.colors.textSecondary,
    letterSpacing: 2,
    textAlign: "center",
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.xl,
  },
  addRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    fontFamily: theme.fonts.lcd,
    fontSize: 18,
    color: theme.colors.textPrimary,
    textAlign: "center",
    letterSpacing: 2,
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  friendInfo: { flex: 1 },
  friendName: {
    fontFamily: theme.fonts.lcd,
    fontSize: 18,
    color: theme.colors.textPrimary,
  },
  friendBeepId: {
    fontFamily: theme.fonts.mono,
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
});
```

Create `src/screens/DictionaryScreen.tsx`:

```tsx
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TextInput, Alert } from "react-native";
import { neumorphism as theme } from "@/theme/neumorphism";
import { BeepButton } from "@/components/BeepButton";
import { useAuthStore } from "@/stores/authStore";
import { useDictionaryStore } from "@/stores/dictionaryStore";

export function DictionaryScreen() {
  const { profile } = useAuthStore();
  const { entries, loading, fetch, add, remove } = useDictionaryStore();
  const [code, setCode] = useState("");
  const [meaning, setMeaning] = useState("");

  useEffect(() => {
    if (profile) fetch(profile.id);
  }, [profile?.id]);

  const handleAdd = async () => {
    if (!profile || !code || !meaning) return;
    try {
      await add(profile.id, code, meaning);
      setCode("");
      setMeaning("");
    } catch (err: any) {
      Alert.alert("오류", err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>CODES</Text>
      <View style={styles.form}>
        <TextInput
          style={styles.codeInput}
          value={code}
          onChangeText={(t) => setCode(t.replace(/[^0-9]/g, ""))}
          placeholder="숫자 코드"
          placeholderTextColor={theme.colors.textSecondary}
          keyboardType="number-pad"
          maxLength={20}
        />
        <TextInput
          style={styles.meaningInput}
          value={meaning}
          onChangeText={setMeaning}
          placeholder="의미"
          placeholderTextColor={theme.colors.textSecondary}
          maxLength={50}
        />
        <BeepButton title="등록" onPress={handleAdd} />
      </View>
      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.entry}>
            <Text style={styles.entryCode}>{item.code}</Text>
            <Text style={styles.entryMeaning}>{item.meaning}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  header: {
    fontFamily: theme.fonts.pixel,
    fontSize: 14,
    color: theme.colors.textSecondary,
    letterSpacing: 2,
    textAlign: "center",
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.xl,
  },
  form: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  codeInput: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    fontFamily: theme.fonts.lcd,
    fontSize: 20,
    color: theme.colors.lcdText,
    textAlign: "center",
    letterSpacing: 3,
  },
  meaningInput: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    fontFamily: theme.fonts.lcd,
    fontSize: 16,
    color: theme.colors.textPrimary,
    textAlign: "center",
  },
  entry: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    gap: theme.spacing.md,
  },
  entryCode: {
    fontFamily: theme.fonts.lcd,
    fontSize: 20,
    color: theme.colors.lcdText,
    minWidth: 80,
  },
  entryMeaning: {
    fontFamily: theme.fonts.lcd,
    fontSize: 16,
    color: theme.colors.textPrimary,
    flex: 1,
  },
});
```

Create `src/screens/ProfileScreen.tsx`:

```tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { neumorphism as theme } from "@/theme/neumorphism";
import { BeepButton } from "@/components/BeepButton";
import { useAuthStore } from "@/stores/authStore";
import { signOut } from "@/services/authService";

export function ProfileScreen() {
  const { profile, setSession } = useAuthStore();

  const handleLogout = async () => {
    await signOut();
    setSession(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>MY</Text>
      <View style={styles.card}>
        <Text style={styles.label}>삐삐 번호</Text>
        <Text style={styles.beepId}>{profile?.beep_id}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>닉네임</Text>
        <Text style={styles.nickname}>{profile?.nickname}</Text>
      </View>
      <BeepButton title="로그아웃" onPress={handleLogout} variant="danger" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  header: {
    fontFamily: theme.fonts.pixel,
    fontSize: 14,
    color: theme.colors.textSecondary,
    letterSpacing: 2,
    textAlign: "center",
    marginBottom: theme.spacing.lg,
    marginTop: theme.spacing.xl,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.raised,
  },
  label: {
    fontFamily: theme.fonts.pixel,
    fontSize: 10,
    color: theme.colors.textSecondary,
    letterSpacing: 1,
    marginBottom: theme.spacing.xs,
  },
  beepId: {
    fontFamily: theme.fonts.lcd,
    fontSize: 32,
    color: theme.colors.lcdText,
    letterSpacing: 4,
  },
  nickname: {
    fontFamily: theme.fonts.lcd,
    fontSize: 24,
    color: theme.colors.textPrimary,
  },
});
```

- [ ] **Step 5: App.tsx 진입점 생성**

Create/overwrite `App.tsx`:

```tsx
import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { RootNavigator } from "@/navigation/RootNavigator";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/lib/supabase";
import { customFonts } from "@/theme/fonts";

SplashScreen.preventAutoHideAsync();

export default function App() {
  const { setSession, fetchProfile } = useAuthStore();
  const [fontsLoaded] = useFonts(customFonts);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile();
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile();
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
}
```

- [ ] **Step 6: 타입체크**

```bash
npx tsc --noEmit
```

Expected: 에러 없이 통과 (폰트 파일 누락 경고는 OK — 에셋은 별도로 추가)

- [ ] **Step 7: 커밋**

```bash
git add App.tsx src/navigation/ src/screens/
git commit -m "feat: navigation + all screens (auth, home, send, friends, dictionary, profile)"
```

---

## Task 9: QR 스캐너 + 딥링크

**Files:**
- Create: `src/components/QrScanner.tsx`
- Modify: `src/screens/FriendsScreen.tsx` (QR 버튼 추가)
- Modify: `App.tsx` (딥링크 설정)

- [ ] **Step 1: QR 스캐너 컴포넌트 생성**

Create `src/components/QrScanner.tsx`:

```tsx
import React, { useState } from "react";
import { View, Text, StyleSheet, Modal } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { neumorphism as theme } from "@/theme/neumorphism";
import { BeepButton } from "@/components/BeepButton";
import { isValidBeepId } from "@/services/authService";

interface QrScannerProps {
  visible: boolean;
  onClose: () => void;
  onScan: (beepId: string) => void;
}

export function QrScanner({ visible, onClose, onScan }: QrScannerProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    // beepget://add/12345678 또는 순수 8자리
    const match = data.match(/beepget:\/\/add\/(\d{8})/) || data.match(/^(\d{8})$/);
    if (match && isValidBeepId(match[1])) {
      setScanned(true);
      onScan(match[1]);
      onClose();
    }
  };

  if (!permission?.granted) {
    return (
      <Modal visible={visible} onRequestClose={onClose}>
        <View style={styles.center}>
          <Text style={styles.text}>카메라 권한이 필요합니다</Text>
          <BeepButton title="권한 허용" onPress={requestPermission} />
          <BeepButton title="닫기" onPress={onClose} variant="secondary" />
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} onRequestClose={onClose}>
      <CameraView
        style={StyleSheet.absoluteFill}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />
      <View style={styles.overlay}>
        <BeepButton title="닫기" onPress={onClose} variant="danger" />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
    gap: theme.spacing.md,
  },
  text: {
    fontFamily: theme.fonts.lcd,
    fontSize: 18,
    color: theme.colors.textPrimary,
  },
  overlay: {
    position: "absolute",
    bottom: 60,
    left: 0,
    right: 0,
    alignItems: "center",
  },
});
```

- [ ] **Step 2: FriendsScreen에 QR 버튼 추가**

`src/screens/FriendsScreen.tsx`의 `addRow` 섹션 뒤에 QR 버튼 추가:

```tsx
// import 추가
import { QrScanner } from "@/components/QrScanner";

// state 추가 (FriendsScreen 함수 내)
const [showQr, setShowQr] = useState(false);

// addRow 뒤에 추가
<BeepButton title="QR 스캔" onPress={() => setShowQr(true)} variant="secondary" />
<QrScanner
  visible={showQr}
  onClose={() => setShowQr(false)}
  onScan={async (beepId) => {
    if (profile) {
      try {
        await add(profile.id, beepId);
        Alert.alert("QR로 친구 추가 완료");
      } catch (err: any) {
        Alert.alert("오류", err.message);
      }
    }
  }}
/>
```

- [ ] **Step 3: app.json에 딥링크 스킴 추가**

```json
{
  "expo": {
    "scheme": "beepget"
  }
}
```

- [ ] **Step 4: 커밋**

```bash
git add src/components/QrScanner.tsx src/screens/FriendsScreen.tsx app.json
git commit -m "feat: QR scanner + deeplink scheme for friend add"
```

---

## Task 10: 전체 테스트 + 최종 정리

- [ ] **Step 1: 전체 테스트 실행**

```bash
npx jest --coverage
```

Expected: 모든 테스트 PASS, 서비스 레이어 80%+ coverage

- [ ] **Step 2: 타입체크**

```bash
npx tsc --noEmit
```

Expected: 에러 없음

- [ ] **Step 3: .gitignore 최종 확인**

`.env`, `node_modules/`, `.expo/`, 빌드 아티팩트가 포함되어야 함

- [ ] **Step 4: 최종 커밋**

```bash
git add -A
git commit -m "chore: Phase 1 complete — app core with auth, messaging, friends, dictionary"
```

---

## Checkpoint: Phase 1 완료 확인

Phase 1이 끝나면 아래가 동작해야 합니다:

- [ ] Google/Apple 소셜 로그인 → 8자리 beep_id 자동 생성
- [ ] 친구 추가 (beep_id 입력 / QR 스캔)
- [ ] 숫자 코드 + 메모 전송 → 수신자 실시간 수신
- [ ] LCD 디스플레이에 최신 수신 코드 표시
- [ ] 24시간 후 자동 삭제, 저장 시 아카이빙
- [ ] 나만의 암호표 CRUD
- [ ] 뉴모피즘 기본 스킨 적용

다음: `Phase 2 (위젯)` 계획서를 별도로 작성합니다.
