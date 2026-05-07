-- Persist real Blink thumbnail/strip keys and allow private signed Storage access.

revoke execute on function public.create_blink_metadata(uuid, text, text, int, int, text, text) from public;
revoke execute on function public.create_blink_metadata(uuid, text, text, int, int, text, text) from authenticated;
drop function if exists public.create_blink_metadata(uuid, text, text, int, int, text, text);

create or replace function public.create_blink_metadata(
  p_receiver_id uuid,
  p_code text,
  p_memo text,
  p_duration_ms int,
  p_byte_size int,
  p_object_key text,
  p_thumbnail_key text default null,
  p_strip_keys text[] default '{}'::text[]
)
returns table(signal_id uuid, media_id uuid, object_key text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sender_id uuid := (select auth.uid());
  v_signal_id uuid;
  v_media_id uuid;
  v_blink_count int;
  v_strip_keys text[] := coalesce(p_strip_keys, '{}'::text[]);
  v_thumbnail_key text := nullif(btrim(coalesce(p_thumbnail_key, '')), '');
begin
  if v_sender_id is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  if p_duration_ms <= 0 or p_duration_ms > 2000 then
    raise exception 'Blink duration must be 2 seconds or less' using errcode = '22023';
  end if;

  if p_byte_size <= 0 or p_byte_size > 750000 then
    raise exception 'Blink file is too large' using errcode = '22023';
  end if;

  if cardinality(v_strip_keys) > 3 then
    raise exception 'Blink strip can include at most 3 frames' using errcode = '22023';
  end if;

  if exists (
    select 1
    from unnest(v_strip_keys || coalesce(array[v_thumbnail_key], '{}'::text[])) as key(name)
    where key.name is not null
      and (
        btrim(key.name) = ''
        or key.name like '/%'
        or key.name like '%..%'
        or key.name like '%\%'
      )
  ) then
    raise exception 'Blink preview object key is invalid' using errcode = '22023';
  end if;

  if v_thumbnail_key is null and cardinality(v_strip_keys) > 0 then
    v_thumbnail_key := v_strip_keys[1];
  end if;

  if not exists (
    select 1
    from public.relationships r
    where r.owner_id = v_sender_id
    and r.friend_id = p_receiver_id
  ) then
    raise exception 'Receiver is not in your Beep-get relationships' using errcode = '42501';
  end if;

  insert into public.usage_daily (
    user_id,
    usage_date,
    blink_sent_count,
    bytes_uploaded
  )
  values (v_sender_id, current_date, 1, p_byte_size)
  on conflict (user_id, usage_date) do update
    set blink_sent_count = public.usage_daily.blink_sent_count + 1,
        bytes_uploaded = public.usage_daily.bytes_uploaded + p_byte_size,
        updated_at = now()
  returning blink_sent_count into v_blink_count;

  if v_blink_count > 10 then
    raise exception 'Daily Blink limit exceeded' using errcode = '54000';
  end if;

  insert into public.signals (kind, sender_id, receiver_id, code, memo)
  values ('blink', v_sender_id, p_receiver_id, p_code, nullif(p_memo, ''))
  returning id into v_signal_id;

  insert into public.signal_media (
    signal_id,
    provider,
    bucket,
    object_key,
    thumbnail_key,
    strip_keys,
    duration_ms,
    byte_size,
    status
  )
  values (
    v_signal_id,
    'supabase_storage',
    'blink-originals',
    p_object_key,
    v_thumbnail_key,
    v_strip_keys,
    p_duration_ms,
    p_byte_size,
    'pending_upload'
  )
  returning id into v_media_id;

  return query select v_signal_id, v_media_id, p_object_key;
end;
$$;

revoke execute on function public.create_blink_metadata(uuid, text, text, int, int, text, text, text[]) from public;
grant execute on function public.create_blink_metadata(uuid, text, text, int, int, text, text, text[]) to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'blink_originals_insert_own_folder'
  ) then
    create policy "blink_originals_insert_own_folder"
    on storage.objects for insert
    to authenticated
    with check (
      bucket_id = 'blink-originals'
      and (storage.foldername(name))[1] = (select auth.uid()::text)
    );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'blink_thumbs_insert_own_folder'
  ) then
    create policy "blink_thumbs_insert_own_folder"
    on storage.objects for insert
    to authenticated
    with check (
      bucket_id = 'blink-thumbs'
      and (storage.foldername(name))[1] = (select auth.uid()::text)
    );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'blink_media_select_participant'
  ) then
    create policy "blink_media_select_participant"
    on storage.objects for select
    to authenticated
    using (
      exists (
        select 1
        from public.signal_media sm
        join public.signals s on s.id = sm.signal_id
        where sm.deleted_at is null
          and (
            (storage.objects.bucket_id = sm.bucket and storage.objects.name = sm.object_key)
            or (
              storage.objects.bucket_id = 'blink-thumbs'
              and (
                storage.objects.name = sm.thumbnail_key
                or storage.objects.name = any(sm.strip_keys)
              )
            )
          )
          and (
            s.sender_id = (select auth.uid())
            or s.receiver_id = (select auth.uid())
          )
      )
    );
  end if;
end $$;
