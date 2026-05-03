-- Mark Blink media as usable only after the client upload succeeds.

create or replace function public.finalize_blink_upload(
  p_signal_id uuid,
  p_object_key text
)
returns public.signal_media
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_id uuid := (select auth.uid());
  v_media public.signal_media;
begin
  if v_actor_id is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  update public.signal_media sm
  set status = 'uploaded'
  from public.signals s
  where sm.signal_id = s.id
    and sm.signal_id = p_signal_id
    and sm.object_key = p_object_key
    and sm.status = 'pending_upload'
    and sm.deleted_at is null
    and s.sender_id = v_actor_id
  returning sm.* into v_media;

  if v_media.id is null then
    raise exception 'Blink media not found or not uploadable' using errcode = '42501';
  end if;

  return v_media;
end;
$$;

revoke execute on function public.finalize_blink_upload(uuid, text) from public;
grant execute on function public.finalize_blink_upload(uuid, text) to authenticated;
