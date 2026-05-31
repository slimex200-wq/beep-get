-- M3 (system theme): stop mirroring a palette skin into profiles.active_skin_id.
--
-- The 5 palette skins (swiss-paper / neumorphism / glassmorphism / retro-future /
-- cyber-neon) have collapsed into a system light/dark theme driven entirely on the
-- client (useColorScheme + an in-app System/Light/Dark toggle). The app palette no
-- longer reads profiles.active_skin_id, so set_active_identity_pack must NOT keep
-- deriving and writing a fake palette skin into active_skin_id. Identity packs are
-- now purely widget skins, decoupled from the app's chrome color.
--
-- This redefinition keeps everything else identical to 20260531140000:
--   * active_identity_pack remains the first-class active selection.
--   * The ownership check stays (free classic-paper or an identity_pack_entitlements
--     row granted server-side after verified store purchase). Clients cannot grant
--     paid packs.
--   * SECURITY DEFINER stays because direct profiles UPDATE is limited to avatar_url
--     for authenticated users (20260529113000_tighten_profile_update_surface).
--
-- We intentionally do NOT drop the profiles.active_skin_id column here; that is a
-- separate M4 cleanup once no historical readers remain.

create or replace function public.set_active_identity_pack(p_pack_slug text)
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

  -- Allow only the free pack or packs the caller actually owns. Paid packs are
  -- only granted server-side after store verification (identity_pack_entitlements).
  if p_pack_slug <> 'classic-paper'
    and not exists (
      select 1
      from public.identity_pack_entitlements e
      where e.user_id = v_user_id
        and e.pack_slug = p_pack_slug
    )
  then
    raise exception 'Identity pack not owned' using errcode = '42501';
  end if;

  -- Identity packs are widget skins only; the app theme is a system light/dark
  -- choice, so we no longer mirror a palette skin into active_skin_id.
  update public.profiles
  set active_identity_pack = p_pack_slug,
      updated_at = now()
  where id = v_user_id
  returning * into v_profile;

  return v_profile;
end;
$$;

comment on function public.set_active_identity_pack(text) is
  'Sets the caller''s active identity pack (widget skin) after an ownership check (free pack or identity_pack_entitlements row). No longer mirrors a palette skin into active_skin_id: the app theme is a system light/dark choice. SECURITY DEFINER because direct profiles UPDATE is limited to avatar_url for authenticated users.';

revoke execute on function public.set_active_identity_pack(text) from public;
revoke execute on function public.set_active_identity_pack(text) from anon;
grant execute on function public.set_active_identity_pack(text) to authenticated;
