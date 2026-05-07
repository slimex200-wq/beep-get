drop policy if exists "relationships_select_own" on public.relationships;

create policy "relationships_select_participant"
on public.relationships for select
to authenticated
using (
  owner_id = (select auth.uid())
  or friend_id = (select auth.uid())
);

create or replace function public.is_related_profile(target_profile_id uuid)
returns boolean
language sql
stable
security invoker
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
security invoker
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

create or replace function public.get_own_profile()
returns public.profiles
language sql
stable
security invoker
set search_path = public
as $$
  select p.*
  from public.profiles p
  where p.id = (select auth.uid())
  limit 1;
$$;

grant execute on function public.is_related_profile(uuid) to authenticated;
grant execute on function public.can_access_signal(uuid) to authenticated;
grant execute on function public.get_own_profile() to authenticated;
