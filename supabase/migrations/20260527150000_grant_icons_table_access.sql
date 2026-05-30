-- Data API table privileges for the icon collection.
-- RLS policies already constrain authenticated reads in
-- 20260524100000_icons_collection.sql; these grants only make the tables
-- reachable on projects where public table grants are not implicit.

revoke all privileges on table public.icons from anon;
revoke all privileges on table public.user_icons from anon;

grant select on table public.icons to authenticated;
grant select on table public.user_icons to authenticated;

grant all privileges on table public.icons to service_role;
grant all privileges on table public.user_icons to service_role;
