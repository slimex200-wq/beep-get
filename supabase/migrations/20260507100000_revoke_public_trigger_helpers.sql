-- Trigger helpers should run only as triggers, not as public RPC endpoints.

do $$
begin
  if exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'set_updated_at'
      and pg_get_function_identity_arguments(p.oid) = ''
  ) then
    revoke execute on function public.set_updated_at() from public;
    revoke execute on function public.set_updated_at() from anon;
    revoke execute on function public.set_updated_at() from authenticated;
  end if;
end $$;
