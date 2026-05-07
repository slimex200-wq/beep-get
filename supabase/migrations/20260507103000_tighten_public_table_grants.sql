revoke all privileges on all tables in schema public from anon;
revoke all privileges on all tables in schema public from authenticated;

grant select on table public.skins to authenticated;

grant select, update on table public.profiles to authenticated;

grant select, insert on table public.user_skins to authenticated;

grant select, insert, update, delete on table public.relationships to authenticated;

grant select, insert, update, delete on table public.code_presets to authenticated;

grant select on table public.signals to authenticated;
grant select on table public.signal_media to authenticated;
grant select on table public.signal_events to authenticated;
grant select on table public.usage_daily to authenticated;
