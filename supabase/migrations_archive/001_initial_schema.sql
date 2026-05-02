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

-- Users: read/update own profile, search by beep_id
create policy "users_select_own" on users for select using (auth.uid() = id);
create policy "users_update_own" on users for update using (auth.uid() = id);
create policy "users_insert_own" on users for insert with check (auth.uid() = id);
create policy "users_select_by_beep_id" on users for select using (true);

-- Friendships: own only
create policy "friendships_select" on friendships for select using (auth.uid() = user_id);
create policy "friendships_insert" on friendships for insert with check (auth.uid() = user_id);
create policy "friendships_delete" on friendships for delete using (auth.uid() = user_id);
create policy "friendships_update" on friendships for update using (auth.uid() = user_id);

-- Messages: sent/received
create policy "messages_select" on messages for select using (auth.uid() = to_user or auth.uid() = from_user);
create policy "messages_insert" on messages for insert with check (auth.uid() = from_user);
create policy "messages_update" on messages for update using (auth.uid() = to_user);

-- Code Dictionary: own only
create policy "dict_select" on code_dictionary for select using (auth.uid() = user_id);
create policy "dict_insert" on code_dictionary for insert with check (auth.uid() = user_id);
create policy "dict_update" on code_dictionary for update using (auth.uid() = user_id);
create policy "dict_delete" on code_dictionary for delete using (auth.uid() = user_id);

-- Skins: public read
create policy "skins_select_all" on skins for select using (true);

-- User Skins: own only
create policy "user_skins_select" on user_skins for select using (auth.uid() = user_id);
create policy "user_skins_insert" on user_skins for insert with check (auth.uid() = user_id);

-- Icons: public read
create policy "icons_select_all" on icons for select using (true);

-- User Icons: own only
create policy "user_icons_select" on user_icons for select using (auth.uid() = user_id);

-- Status Broadcasts: public read, own write
create policy "status_select" on status_broadcasts for select using (true);
create policy "status_upsert" on status_broadcasts for insert with check (auth.uid() = user_id);
create policy "status_update" on status_broadcasts for update using (auth.uid() = user_id);

-- Seed: default free skin
insert into skins (name, slug, category, assets_url, is_free)
values ('neumorphism', 'neumorphism', 'default', '/skins/neumorphism', true);

-- Enable Realtime
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table status_broadcasts;
