create or replace function public.get_own_profile()
returns public.profiles
language sql
stable
security definer
set search_path = public
as $$
  select p.*
  from public.profiles p
  where p.id = (select auth.uid())
  limit 1;
$$;

revoke execute on function public.get_own_profile() from public;
revoke execute on function public.get_own_profile() from anon;
grant execute on function public.get_own_profile() to authenticated;
