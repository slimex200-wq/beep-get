alter table public.signal_events
add column if not exists client_action_id uuid;

create unique index if not exists signal_events_actor_client_action_uidx
on public.signal_events (actor_id, client_action_id)
where client_action_id is not null;

create or replace function public.reply_with_preset_once(
  p_signal_id uuid,
  p_code text,
  p_client_action_id uuid
)
returns public.signals
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_id uuid := (select auth.uid());
  v_source public.signals;
  v_receiver_id uuid;
  v_reply public.signals;
  v_event_id uuid;
  v_existing_reply_id uuid;
  v_beep_count int;
begin
  if v_actor_id is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  if p_client_action_id is null then
    raise exception 'client_action_id is required' using errcode = '22023';
  end if;

  if p_code is null or p_code !~ '^[0-9]{1,20}$' then
    raise exception 'Preset reply code must be numeric' using errcode = '22023';
  end if;

  select * into v_source
  from public.signals
  where id = p_signal_id
  and receiver_id = v_actor_id;

  if v_source.id is null then
    raise exception 'Signal not found or not replyable' using errcode = '42501';
  end if;

  v_receiver_id := v_source.sender_id;

  insert into public.signal_events (
    signal_id,
    actor_id,
    event_type,
    client_action_id,
    payload
  )
  values (
    p_signal_id,
    v_actor_id,
    'reply',
    p_client_action_id,
    jsonb_build_object('code', p_code, 'status', 'reserved')
  )
  on conflict (actor_id, client_action_id)
  where client_action_id is not null
  do nothing
  returning id into v_event_id;

  if v_event_id is null then
    select (payload->>'reply_signal_id')::uuid into v_existing_reply_id
    from public.signal_events
    where actor_id = v_actor_id
    and client_action_id = p_client_action_id
    limit 1;

    if v_existing_reply_id is not null then
      select * into v_reply
      from public.signals
      where id = v_existing_reply_id
      and sender_id = v_actor_id;

      if v_reply.id is not null then
        return v_reply;
      end if;
    end if;

    raise exception 'Reply action is already in progress' using errcode = '40001';
  end if;

  insert into public.usage_daily (user_id, usage_date, beep_sent_count)
  values (v_actor_id, current_date, 1)
  on conflict (user_id, usage_date) do update
    set beep_sent_count = public.usage_daily.beep_sent_count + 1,
        updated_at = now()
  returning beep_sent_count into v_beep_count;

  if v_beep_count > 100 then
    raise exception 'Daily Beep limit exceeded' using errcode = '54000';
  end if;

  insert into public.signals (kind, sender_id, receiver_id, code)
  values ('beep', v_actor_id, v_receiver_id, p_code)
  returning * into v_reply;

  update public.signal_events
  set payload = jsonb_build_object(
    'reply_signal_id', v_reply.id,
    'code', p_code,
    'status', 'sent'
  )
  where id = v_event_id;

  return v_reply;
end;
$$;

revoke execute on function public.reply_with_preset_once(uuid, text, uuid) from public;
grant execute on function public.reply_with_preset_once(uuid, text, uuid) to authenticated;
