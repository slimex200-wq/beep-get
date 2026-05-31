-- Unify the base-skin user-facing display name with the DESIGN.md skin-store SSoT.
--
-- DESIGN.md defines the base skin (slug 'swiss-paper') user-facing name as
-- 'Classic Paper'. The original seed in 20260502163001_beep_blink_core.sql stored
-- the legacy label 'Swiss Paper'. That seed is already applied to beep-get-prod,
-- so this forward-only migration updates the existing row instead of editing the
-- historical seed file.
--
-- Only the display label moves. The slug 'swiss-paper' stays unchanged because it
-- is the store default (skinStore.activeSkinSlug), the profiles.active_skin_id FK
-- target, and the ThemeProvider/appTheme alias key. Renaming the slug would break
-- active-skin resolution, so it is intentionally left alone.
--
-- Idempotent: the WHERE guard makes a re-run a no-op once applied.
update public.skins
set name = 'Classic Paper'
where slug = 'swiss-paper'
  and name <> 'Classic Paper';
