-- Beep-get v2: widget-first Beep/Blink backend.
--
-- This migration intentionally replaces the earlier users/messages/friendships
-- model for new Supabase projects. The old migrations are archived under
-- supabase/migrations_archive/ and should not be pushed to beep-get-prod.

create extension if not exists "pgcrypto" with schema extensions;

create type public.signal_kind as enum ('beep', 'blink');
create type public.signal_status as enum ('sent', 'delivered', 'read', 'dismissed');
create type public.media_provider as enum ('supabase_storage', 'cloudflare_r2', 'cloudflare_stream');
create type public.media_status as enum ('pending_upload', 'uploaded', 'processed', 'failed', 'expired', 'deleted');
create type public.signal_event_type as enum ('read', 'confirm', 'save', 'reply', 'dismiss');

create table public.skins (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category text not null default 'default',
  is_free boolean not null default false,
  price_tier text,
  created_at timestamptz not null default now(),
  constraint skins_slug_format check (slug ~ '^[a-z0-9][a-z0-9-]{1,48}$')
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  beep_id text not null unique,
  nickname text not null,
  avatar_url text,
  active_skin_id uuid references public.skins(id),
  status_icon text not null default 'online',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_beep_id_format check (beep_id ~ '^[1-9][0-9]{7}$'),
  constraint profiles_nickname_length check (char_length(nickname) between 1 and 20)
);

create table public.user_skins (
  user_id uuid not null references public.profiles(id) on delete cascade,
  skin_id uuid not null references public.skins(id) on delete cascade,
  acquired_type text not null default 'default',
  acquired_at timestamptz not null default now(),
  primary key (user_id, skin_id)
);

create table public.relationships (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  friend_id uuid not null references public.profiles(id) on delete cascade,
  nickname text,
  vibration_pattern text,
  created_at timestamptz not null default now(),
  constraint relationships_no_self check (owner_id <> friend_id),
  constraint relationships_nickname_length check (nickname is null or char_length(nickname) <= 20),
  unique (owner_id, friend_id)
);

create table public.code_presets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  relationship_id uuid references public.relationships(id) on delete cascade,
  code text not null,
  label text not null,
  sort_order int not null default 0,
  is_widget_slot boolean not null default false,
  created_at timestamptz not null default now(),
  constraint code_presets_code_format check (code ~ '^[0-9]{1,20}$'),
  constraint code_presets_label_length check (char_length(label) between 1 and 30)
);

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

create table public.signal_events (
  id uuid primary key default gen_random_uuid(),
  signal_id uuid not null references public.signals(id) on delete cascade,
  actor_id uuid not null references public.profiles(id) on delete cascade,
  event_type public.signal_event_type not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.usage_daily (
  user_id uuid not null references public.profiles(id) on delete cascade,
  usage_date date not null default current_date,
  beep_sent_count int not null default 0,
  blink_sent_count int not null default 0,
  bytes_uploaded bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, usage_date),
  constraint usage_daily_non_negative check (
    beep_sent_count >= 0
    and blink_sent_count >= 0
    and bytes_uploaded >= 0
  )
);

create index profiles_beep_id_idx on public.profiles (beep_id);
create index relationships_owner_idx on public.relationships (owner_id, created_at desc);
create index relationships_friend_idx on public.relationships (friend_id);
create index code_presets_owner_widget_idx on public.code_presets (owner_id, is_widget_slot, sort_order);
create index signals_receiver_inbox_idx on public.signals (receiver_id, created_at desc) where is_saved = false;
create index signals_sender_idx on public.signals (sender_id, created_at desc);
create index signals_expiry_idx on public.signals (expires_at) where is_saved = false;
create index signal_media_expiry_idx on public.signal_media (expires_at) where deleted_at is null;
create index signal_events_signal_idx on public.signal_events (signal_id, created_at desc);
create index signal_events_actor_idx on public.signal_events (actor_id, created_at desc);
create index usage_daily_user_date_idx on public.usage_daily (user_id, usage_date);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger usage_daily_set_updated_at
before update on public.usage_daily
for each row execute function public.set_updated_at();

create or replace function public.is_related_profile(target_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.relationships r
    where (
      r.owner_id = (select auth.uid())
      and r.friend_id = target_profile_id
    )
    or (
      r.friend_id = (select auth.uid())
      and r.owner_id = target_profile_id
    )
  );
$$;

create or replace function public.can_access_signal(target_signal_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.signals s
    where s.id = target_signal_id
    and (
      s.sender_id = (select auth.uid())
      or s.receiver_id = (select auth.uid())
    )
  );
$$;

create or replace function public.create_profile(p_nickname text, p_beep_id text)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_profile public.profiles;
  v_free_skin_id uuid;
begin
  if v_user_id is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  insert into public.profiles (id, beep_id, nickname)
  values (v_user_id, p_beep_id, p_nickname)
  on conflict (id) do update
    set nickname = excluded.nickname,
        updated_at = now()
  returning * into v_profile;

  select id into v_free_skin_id
  from public.skins
  where is_free = true
  order by created_at asc
  limit 1;

  if v_free_skin_id is not null then
    insert into public.user_skins (user_id, skin_id, acquired_type)
    values (v_user_id, v_free_skin_id, 'default')
    on conflict do nothing;

    update public.profiles
    set active_skin_id = coalesce(active_skin_id, v_free_skin_id)
    where id = v_user_id
    returning * into v_profile;
  end if;

  return v_profile;
end;
$$;

create or replace function public.find_profile_by_beep_id(target_beep_id text)
returns table(id uuid, beep_id text, nickname text, avatar_url text)
language sql
stable
security definer
set search_path = public
as $$
  select p.id, p.beep_id, p.nickname, p.avatar_url
  from public.profiles p
  where p.beep_id = target_beep_id
  limit 1;
$$;

create or replace function public.send_beep(
  p_receiver_id uuid,
  p_code text,
  p_memo text default null
)
returns public.signals
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sender_id uuid := (select auth.uid());
  v_signal public.signals;
  v_beep_count int;
begin
  if v_sender_id is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.relationships r
    where r.owner_id = v_sender_id
    and r.friend_id = p_receiver_id
  ) then
    raise exception 'Receiver is not in your Beep-get relationships' using errcode = '42501';
  end if;

  insert into public.usage_daily (user_id, usage_date, beep_sent_count)
  values (v_sender_id, current_date, 1)
  on conflict (user_id, usage_date) do update
    set beep_sent_count = public.usage_daily.beep_sent_count + 1,
        updated_at = now()
  returning beep_sent_count into v_beep_count;

  if v_beep_count > 100 then
    raise exception 'Daily Beep limit exceeded' using errcode = '54000';
  end if;

  insert into public.signals (kind, sender_id, receiver_id, code, memo)
  values ('beep', v_sender_id, p_receiver_id, p_code, nullif(p_memo, ''))
  returning * into v_signal;

  return v_signal;
end;
$$;

create or replace function public.create_blink_metadata(
  p_receiver_id uuid,
  p_code text,
  p_memo text,
  p_duration_ms int,
  p_byte_size int,
  p_object_key text,
  p_thumbnail_key text default null
)
returns table(signal_id uuid, media_id uuid, object_key text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sender_id uuid := (select auth.uid());
  v_signal_id uuid;
  v_media_id uuid;
  v_blink_count int;
begin
  if v_sender_id is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  if p_duration_ms <= 0 or p_duration_ms > 2000 then
    raise exception 'Blink duration must be 2 seconds or less' using errcode = '22023';
  end if;

  if p_byte_size <= 0 or p_byte_size > 750000 then
    raise exception 'Blink file is too large' using errcode = '22023';
  end if;

  if not exists (
    select 1
    from public.relationships r
    where r.owner_id = v_sender_id
    and r.friend_id = p_receiver_id
  ) then
    raise exception 'Receiver is not in your Beep-get relationships' using errcode = '42501';
  end if;

  insert into public.usage_daily (
    user_id,
    usage_date,
    blink_sent_count,
    bytes_uploaded
  )
  values (v_sender_id, current_date, 1, p_byte_size)
  on conflict (user_id, usage_date) do update
    set blink_sent_count = public.usage_daily.blink_sent_count + 1,
        bytes_uploaded = public.usage_daily.bytes_uploaded + p_byte_size,
        updated_at = now()
  returning blink_sent_count into v_blink_count;

  if v_blink_count > 10 then
    raise exception 'Daily Blink limit exceeded' using errcode = '54000';
  end if;

  insert into public.signals (kind, sender_id, receiver_id, code, memo)
  values ('blink', v_sender_id, p_receiver_id, p_code, nullif(p_memo, ''))
  returning id into v_signal_id;

  insert into public.signal_media (
    signal_id,
    provider,
    bucket,
    object_key,
    thumbnail_key,
    duration_ms,
    byte_size,
    status
  )
  values (
    v_signal_id,
    'supabase_storage',
    'blink-originals',
    p_object_key,
    p_thumbnail_key,
    p_duration_ms,
    p_byte_size,
    'pending_upload'
  )
  returning id into v_media_id;

  return query select v_signal_id, v_media_id, p_object_key;
end;
$$;

create or replace function public.mark_signal_read(p_signal_id uuid)
returns public.signals
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_id uuid := (select auth.uid());
  v_signal public.signals;
begin
  update public.signals
  set status = 'read'
  where id = p_signal_id
  and receiver_id = v_actor_id
  returning * into v_signal;

  if v_signal.id is null then
    raise exception 'Signal not found or not readable' using errcode = '42501';
  end if;

  insert into public.signal_events (signal_id, actor_id, event_type)
  values (p_signal_id, v_actor_id, 'read');

  return v_signal;
end;
$$;

create or replace function public.save_signal(p_signal_id uuid)
returns public.signals
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_id uuid := (select auth.uid());
  v_signal public.signals;
begin
  update public.signals
  set is_saved = true
  where id = p_signal_id
  and (receiver_id = v_actor_id or sender_id = v_actor_id)
  returning * into v_signal;

  if v_signal.id is null then
    raise exception 'Signal not found or not saveable' using errcode = '42501';
  end if;

  insert into public.signal_events (signal_id, actor_id, event_type)
  values (p_signal_id, v_actor_id, 'save');

  return v_signal;
end;
$$;

create or replace function public.reply_with_preset(p_signal_id uuid, p_code text)
returns public.signals
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_id uuid := (select auth.uid());
  v_source public.signals;
  v_receiver_id uuid;
  v_reply public.signals;
begin
  select * into v_source
  from public.signals
  where id = p_signal_id
  and (sender_id = v_actor_id or receiver_id = v_actor_id);

  if v_source.id is null then
    raise exception 'Signal not found or not replyable' using errcode = '42501';
  end if;

  if v_source.sender_id = v_actor_id then
    v_receiver_id := v_source.receiver_id;
  else
    v_receiver_id := v_source.sender_id;
  end if;

  insert into public.signals (kind, sender_id, receiver_id, code)
  values ('beep', v_actor_id, v_receiver_id, p_code)
  returning * into v_reply;

  insert into public.signal_events (
    signal_id,
    actor_id,
    event_type,
    payload
  )
  values (
    p_signal_id,
    v_actor_id,
    'reply',
    jsonb_build_object('reply_signal_id', v_reply.id, 'code', p_code)
  );

  return v_reply;
end;
$$;

create or replace function public.expire_unsaved_media(p_limit int default 100)
returns table(media_id uuid, object_key text, thumbnail_key text)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  with expired as (
    select sm.id
    from public.signal_media sm
    join public.signals s on s.id = sm.signal_id
    where sm.deleted_at is null
    and sm.expires_at < now()
    and s.is_saved = false
    order by sm.expires_at asc
    limit greatest(p_limit, 1)
  )
  update public.signal_media sm
  set status = 'expired',
      deleted_at = now()
  from expired
  where sm.id = expired.id
  returning sm.id, sm.object_key, sm.thumbnail_key;
end;
$$;

alter table public.skins enable row level security;
alter table public.profiles enable row level security;
alter table public.user_skins enable row level security;
alter table public.relationships enable row level security;
alter table public.code_presets enable row level security;
alter table public.signals enable row level security;
alter table public.signal_media enable row level security;
alter table public.signal_events enable row level security;
alter table public.usage_daily enable row level security;

create policy "skins_select_all"
on public.skins for select
to authenticated
using (true);

create policy "profiles_select_own_or_related"
on public.profiles for select
to authenticated
using (
  id = (select auth.uid())
  or public.is_related_profile(id)
);

create policy "profiles_update_own"
on public.profiles for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

create policy "user_skins_select_own"
on public.user_skins for select
to authenticated
using (user_id = (select auth.uid()));

create policy "relationships_select_own"
on public.relationships for select
to authenticated
using (owner_id = (select auth.uid()));

create policy "relationships_insert_own"
on public.relationships for insert
to authenticated
with check (owner_id = (select auth.uid()));

create policy "relationships_update_own"
on public.relationships for update
to authenticated
using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));

create policy "relationships_delete_own"
on public.relationships for delete
to authenticated
using (owner_id = (select auth.uid()));

create policy "code_presets_select_own"
on public.code_presets for select
to authenticated
using (owner_id = (select auth.uid()));

create policy "code_presets_insert_own"
on public.code_presets for insert
to authenticated
with check (owner_id = (select auth.uid()));

create policy "code_presets_update_own"
on public.code_presets for update
to authenticated
using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));

create policy "code_presets_delete_own"
on public.code_presets for delete
to authenticated
using (owner_id = (select auth.uid()));

create policy "signals_select_participant"
on public.signals for select
to authenticated
using (
  sender_id = (select auth.uid())
  or receiver_id = (select auth.uid())
);

create policy "signal_media_select_participant"
on public.signal_media for select
to authenticated
using (public.can_access_signal(signal_id));

create policy "signal_events_select_participant"
on public.signal_events for select
to authenticated
using (public.can_access_signal(signal_id));

create policy "usage_daily_select_own"
on public.usage_daily for select
to authenticated
using (user_id = (select auth.uid()));

insert into public.skins (slug, name, category, is_free)
values
  ('swiss-paper', 'Swiss Paper', 'default', true),
  ('pixel-pager', 'Pixel Pager', 'default', true)
on conflict (slug) do update
set name = excluded.name,
    category = excluded.category,
    is_free = excluded.is_free;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values
  (
    'blink-originals',
    'blink-originals',
    false,
    1048576,
    array['video/mp4', 'video/quicktime', 'video/webm']
  ),
  (
    'blink-thumbs',
    'blink-thumbs',
    false,
    262144,
    array['image/jpeg', 'image/png', 'image/webp']
  )
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

revoke execute on function public.is_related_profile(uuid) from public;
revoke execute on function public.can_access_signal(uuid) from public;
revoke execute on function public.create_profile(text, text) from public;
revoke execute on function public.find_profile_by_beep_id(text) from public;
revoke execute on function public.send_beep(uuid, text, text) from public;
revoke execute on function public.create_blink_metadata(uuid, text, text, int, int, text, text) from public;
revoke execute on function public.mark_signal_read(uuid) from public;
revoke execute on function public.save_signal(uuid) from public;
revoke execute on function public.reply_with_preset(uuid, text) from public;
revoke execute on function public.expire_unsaved_media(int) from public;

grant execute on function public.create_profile(text, text) to authenticated;
grant execute on function public.find_profile_by_beep_id(text) to authenticated;
grant execute on function public.send_beep(uuid, text, text) to authenticated;
grant execute on function public.create_blink_metadata(uuid, text, text, int, int, text, text) to authenticated;
grant execute on function public.mark_signal_read(uuid) to authenticated;
grant execute on function public.save_signal(uuid) to authenticated;
grant execute on function public.reply_with_preset(uuid, text) to authenticated;

do $$
begin
  if exists (
    select 1 from pg_publication where pubname = 'supabase_realtime'
  ) then
    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'signals'
    ) then
      alter publication supabase_realtime add table public.signals;
    end if;

    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'signal_events'
    ) then
      alter publication supabase_realtime add table public.signal_events;
    end if;
  end if;
end $$;
