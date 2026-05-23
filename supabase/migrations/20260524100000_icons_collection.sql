-- Phase 3 retention catalog ported to the v2 schema: icons collection,
-- ownership, server-validated drop conditions, and status-icon equip RPC.

create table public.icons (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  image_url text,
  rarity text not null check (rarity in ('common', 'rare', 'epic', 'legendary')),
  drop_condition jsonb,
  is_default boolean not null default false,
  status_icon_value text not null,
  created_at timestamptz not null default now()
);

create index icons_rarity_idx on public.icons (rarity);

create table public.user_icons (
  user_id uuid not null references public.profiles(id) on delete cascade,
  icon_id uuid not null references public.icons(id) on delete cascade,
  acquired_at timestamptz not null default now(),
  primary key (user_id, icon_id)
);

create index user_icons_user_idx on public.user_icons (user_id);

alter table public.icons enable row level security;
alter table public.user_icons enable row level security;

create policy icons_authenticated_read on public.icons
  for select to authenticated using (true);

create policy user_icons_owner_read on public.user_icons
  for select to authenticated using (user_id = auth.uid());

-- grant_icon: server-side check of streak/friends/messages_sent so the client
-- cannot fabricate the precondition. Default icons (is_default = true) bypass
-- the condition check and are always claimable.
create or replace function public.grant_icon(p_slug text)
returns public.user_icons
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_icon_id uuid;
  v_condition jsonb;
  v_is_default boolean;
  v_streak int;
  v_friends int;
  v_messages int;
  v_row public.user_icons;
begin
  if v_user_id is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  select id, drop_condition, is_default
    into v_icon_id, v_condition, v_is_default
  from public.icons where slug = p_slug;

  if v_icon_id is null then
    raise exception 'Icon not found: %', p_slug;
  end if;

  if not v_is_default then
    if v_condition is null then
      raise exception 'Icon has no drop condition: %', p_slug;
    end if;

    case v_condition->>'type'
      when 'streak' then
        select count(distinct usage_date) into v_streak
        from public.usage_daily
        where user_id = v_user_id
          and usage_date >= current_date - ((v_condition->>'days')::int - 1);
        if v_streak < (v_condition->>'days')::int then
          raise exception 'Streak not met: % < %', v_streak, v_condition->>'days'
            using errcode = '42501';
        end if;

      when 'friends' then
        select count(*) into v_friends
        from public.relationships
        where owner_id = v_user_id;
        if v_friends < (v_condition->>'count')::int then
          raise exception 'Friends not met: % < %', v_friends, v_condition->>'count'
            using errcode = '42501';
        end if;

      when 'messages_sent' then
        select count(*) into v_messages
        from public.signals
        where sender_id = v_user_id;
        if v_messages < (v_condition->>'count')::int then
          raise exception 'Messages not met: % < %', v_messages, v_condition->>'count'
            using errcode = '42501';
        end if;

      else
        raise exception 'Unknown drop condition type: %', v_condition->>'type';
    end case;
  end if;

  insert into public.user_icons (user_id, icon_id)
  values (v_user_id, v_icon_id)
  on conflict (user_id, icon_id) do update
    set acquired_at = excluded.acquired_at
  returning * into v_row;

  return v_row;
end;
$$;

revoke execute on function public.grant_icon(text) from public;
revoke execute on function public.grant_icon(text) from anon;
grant execute on function public.grant_icon(text) to authenticated;

-- equip_status_icon: pick an owned icon to display on the profile.
create or replace function public.equip_status_icon(p_slug text)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_icon_id uuid;
  v_status_value text;
  v_profile public.profiles;
begin
  if v_user_id is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  select id, status_icon_value into v_icon_id, v_status_value
  from public.icons where slug = p_slug;

  if v_icon_id is null then
    raise exception 'Icon not found: %', p_slug;
  end if;

  if not exists (
    select 1 from public.user_icons
    where user_id = v_user_id and icon_id = v_icon_id
  ) then
    raise exception 'Icon not owned: %', p_slug using errcode = '42501';
  end if;

  update public.profiles
  set status_icon = v_status_value, updated_at = now()
  where id = v_user_id
  returning * into v_profile;

  return v_profile;
end;
$$;

revoke execute on function public.equip_status_icon(text) from public;
revoke execute on function public.equip_status_icon(text) from anon;
grant execute on function public.equip_status_icon(text) to authenticated;

-- Seed: 5 default icons (always claimable) + 5 challenge icons.
insert into public.icons (slug, name, rarity, drop_condition, is_default, status_icon_value) values
  ('online',   'Online',    'common',    null,                                          true,  'online'),
  ('busy',     'Busy',      'common',    null,                                          true,  'busy'),
  ('focus',    'Focus',     'common',    null,                                          true,  'focus'),
  ('away',     'Away',      'common',    null,                                          true,  'away'),
  ('sleeping', 'Sleeping',  'common',    null,                                          true,  'sleeping'),
  ('streak-3', 'Three Days','rare',      '{"type":"streak","days":3}'::jsonb,           false, 'streak-3'),
  ('friend-3', 'Trio',      'rare',      '{"type":"friends","count":3}'::jsonb,         false, 'friend-3'),
  ('msgs-10',  'Chatterbox','epic',      '{"type":"messages_sent","count":10}'::jsonb,  false, 'msgs-10'),
  ('streak-7', 'Week Sage', 'epic',      '{"type":"streak","days":7}'::jsonb,           false, 'streak-7'),
  ('msgs-100', 'Centurion', 'legendary', '{"type":"messages_sent","count":100}'::jsonb, false, 'msgs-100')
on conflict (slug) do nothing;

-- Bootstrap: every existing profile gets the five default icons immediately.
-- New profiles claim them through the client on first MY → COLLECTION open.
insert into public.user_icons (user_id, icon_id)
select p.id, i.id
from public.profiles p
cross join public.icons i
where i.is_default = true
on conflict do nothing;
