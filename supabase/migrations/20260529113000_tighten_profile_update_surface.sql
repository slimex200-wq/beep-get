-- Keep profile writes narrow. Direct client updates may change only avatar_url;
-- status icons and skins must go through ownership-checking RPCs.

revoke update on table public.profiles from authenticated;
grant update (avatar_url) on table public.profiles to authenticated;

create or replace function public.set_active_skin(p_skin_id uuid)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_profile public.profiles;
begin
  if v_user_id is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.user_skins
    where user_id = v_user_id
      and skin_id = p_skin_id
  ) then
    raise exception 'Skin not owned' using errcode = '42501';
  end if;

  update public.profiles
  set active_skin_id = p_skin_id,
      updated_at = now()
  where id = v_user_id
  returning * into v_profile;

  return v_profile;
end;
$$;

revoke execute on function public.set_active_skin(uuid) from public;
revoke execute on function public.set_active_skin(uuid) from anon;
grant execute on function public.set_active_skin(uuid) to authenticated;
