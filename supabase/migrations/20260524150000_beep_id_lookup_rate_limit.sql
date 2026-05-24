-- B1 (security P1): rate-limit find_profile_by_beep_id to block enumeration.
-- 8-digit beep_id space (~9e7) is small enough that an authenticated client
-- could sequential-scan to harvest all (nickname, avatar_url) pairs. Cap
-- per-user lookups at 30 per rolling minute. RPC raises on overflow.

create table if not exists public.beep_id_lookups (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  looked_up_at timestamptz not null default now()
);

create index if not exists beep_id_lookups_user_at_idx
  on public.beep_id_lookups (user_id, looked_up_at desc);

alter table public.beep_id_lookups enable row level security;

-- No client SELECT/INSERT/etc. Only RPC (SECURITY DEFINER) writes here.
revoke all on public.beep_id_lookups from anon, authenticated;

-- Garbage collection: drop rows older than 1 hour. Called from RPC so it
-- piggybacks on real traffic without a cron job.
create or replace function public._gc_beep_id_lookups()
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.beep_id_lookups
  where looked_up_at < now() - interval '1 hour';
$$;

revoke execute on function public._gc_beep_id_lookups() from anon, authenticated;

create or replace function public.find_profile_by_beep_id(target_beep_id text)
returns table(id uuid, beep_id text, nickname text, avatar_url text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_recent_count integer;
begin
  if v_user_id is null then
    raise exception 'unauthenticated' using errcode = '42501';
  end if;

  select count(*) into v_recent_count
  from public.beep_id_lookups
  where user_id = v_user_id
    and looked_up_at > now() - interval '1 minute';

  if v_recent_count >= 30 then
    raise exception 'rate_limit_exceeded' using errcode = 'P0001';
  end if;

  insert into public.beep_id_lookups (user_id) values (v_user_id);

  -- Opportunistic cleanup: 1-in-50 chance on each call.
  if random() < 0.02 then
    perform public._gc_beep_id_lookups();
  end if;

  return query
    select p.id, p.beep_id, p.nickname, p.avatar_url
    from public.profiles p
    where p.beep_id = target_beep_id
    limit 1;
end;
$$;

revoke execute on function public.find_profile_by_beep_id(text) from anon;
grant execute on function public.find_profile_by_beep_id(text) to authenticated;
