-- Identity pack becomes the user-facing "main" skin (M2).
--
-- Identity packs (Classic Paper / School Desk / Cherry Dot / Photo Booth Blink /
-- Night Signal) are stored as a first-class active selection on profiles via the
-- new active_identity_pack column. We intentionally do NOT reuse
-- profiles.active_skin_id as the source of truth for the identity pack:
--   * active_skin_id is a skins FK and reusing it would force a fake 1:1
--     palette<->identity mapping to be permanent in the skins table.
--   * M3 collapses the 5 palette skins into light/dark; once the palette skins
--     disappear, deriving the active identity pack from active_skin_id (reverse
--     lookup) would break. A dedicated text column survives that change.
--
-- The matching palette skin is still derived and written to active_skin_id so
-- useAppPalette() (which reads skinStore.activeSkinSlug, hydrated from
-- profiles.active_skin_id) keeps rendering correctly until M3. The
-- identity->palette mapping mirrors src/design/identityPacks.ts:
--   classic-paper -> swiss-paper, school-desk -> neumorphism,
--   cherry-dot -> glassmorphism, photo-booth-blink -> retro-future,
--   night-signal -> cyber-neon.
--
-- Ownership: a pack is allowed when it is free (classic-paper) or the caller has
-- a row in identity_pack_entitlements (granted only by the verify-iap Edge
-- Function after a verified store purchase). Clients must not grant paid packs.
--
-- Direct client UPDATE on profiles is restricted to avatar_url only
-- (20260529113000_tighten_profile_update_surface), so the active identity pack
-- must be written through this SECURITY DEFINER RPC.

alter table public.profiles
  add column if not exists active_identity_pack text;

comment on column public.profiles.active_identity_pack is
  'User-facing active identity pack slug (e.g. classic-paper). First-class skin selection; the matching palette skin is mirrored into active_skin_id for useAppPalette() until palettes collapse to light/dark. Written via set_active_identity_pack().';

create or replace function public.set_active_identity_pack(p_pack_slug text)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_profile public.profiles;
  v_skin_slug text;
  v_skin_id uuid;
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

  -- Derive the matching palette skin so useAppPalette() keeps rendering until M3.
  v_skin_slug := case p_pack_slug
    when 'classic-paper' then 'swiss-paper'
    when 'school-desk' then 'neumorphism'
    when 'cherry-dot' then 'glassmorphism'
    when 'photo-booth-blink' then 'retro-future'
    when 'night-signal' then 'cyber-neon'
    else null
  end;

  if v_skin_slug is null then
    raise exception 'Unknown identity pack' using errcode = '22023';
  end if;

  select id into v_skin_id
  from public.skins
  where slug = v_skin_slug
  limit 1;

  update public.profiles
  set active_identity_pack = p_pack_slug,
      active_skin_id = coalesce(v_skin_id, active_skin_id),
      updated_at = now()
  where id = v_user_id
  returning * into v_profile;

  return v_profile;
end;
$$;

comment on function public.set_active_identity_pack(text) is
  'Sets the caller''s active identity pack after an ownership check (free pack or identity_pack_entitlements row) and mirrors the matching palette skin into active_skin_id. SECURITY DEFINER because direct profiles UPDATE is limited to avatar_url for authenticated users.';

revoke execute on function public.set_active_identity_pack(text) from public;
revoke execute on function public.set_active_identity_pack(text) from anon;
grant execute on function public.set_active_identity_pack(text) to authenticated;
