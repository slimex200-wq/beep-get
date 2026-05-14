-- Revenue, push delivery, and cleanup foundation.
-- Store verification stays behind Edge Functions; clients must not grant paid packs directly.

create table if not exists public.identity_pack_entitlements (
  user_id uuid not null references auth.users(id) on delete cascade,
  pack_slug text not null,
  acquired_type text not null default 'purchase'
    check (acquired_type in ('free', 'purchase', 'promo', 'admin')),
  product_id text,
  platform text check (platform in ('ios', 'android', 'web', 'internal')),
  store_transaction_id text,
  acquired_at timestamptz not null default now(),
  expires_at timestamptz,
  primary key (user_id, pack_slug)
);

create table if not exists public.purchase_receipts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  pack_slug text not null,
  platform text not null check (platform in ('ios', 'android')),
  product_id text not null,
  store_transaction_id text,
  store_purchase_token text,
  environment text not null default 'production'
    check (environment in ('sandbox', 'production', 'internal')),
  verified_at timestamptz not null default now(),
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create unique index if not exists purchase_receipts_platform_transaction_idx
  on public.purchase_receipts(platform, store_transaction_id)
  where store_transaction_id is not null;

create table if not exists public.push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  expo_push_token text not null unique,
  device_id text,
  platform text not null check (platform in ('ios', 'android', 'web')),
  enabled boolean not null default true,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists push_tokens_user_enabled_idx
  on public.push_tokens(user_id, enabled, last_seen_at desc);

create table if not exists public.notification_deliveries (
  id uuid primary key default gen_random_uuid(),
  signal_id uuid references public.signals(id) on delete cascade,
  receiver_id uuid references auth.users(id) on delete cascade,
  expo_push_token text,
  status text not null default 'queued'
    check (status in ('queued', 'sent', 'failed', 'skipped')),
  response jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

create index if not exists notification_deliveries_signal_idx
  on public.notification_deliveries(signal_id, created_at desc);

create or replace function public.touch_push_tokens_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_push_tokens_updated_at on public.push_tokens;
create trigger touch_push_tokens_updated_at
before update on public.push_tokens
for each row execute function public.touch_push_tokens_updated_at();

create or replace function public.expire_unsaved_blink_media(p_limit int default 100)
returns table (
  media_id uuid,
  signal_id uuid,
  bucket text,
  object_key text,
  thumbnail_key text,
  strip_keys text[]
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  with candidates as (
    select sm.id
    from public.signal_media sm
    join public.signals s on s.id = sm.signal_id
    where s.is_saved = false
      and s.expires_at < now()
      and sm.status not in ('expired', 'deleted')
    order by s.expires_at asc
    limit greatest(coalesce(p_limit, 100), 1)
  ),
  updated as (
    update public.signal_media sm
    set status = 'expired',
        updated_at = now()
    from candidates c
    where sm.id = c.id
    returning sm.id, sm.signal_id, sm.bucket, sm.object_key, sm.thumbnail_key, sm.strip_keys
  )
  select
    updated.id,
    updated.signal_id,
    updated.bucket,
    updated.object_key,
    updated.thumbnail_key,
    coalesce(updated.strip_keys, array[]::text[])
  from updated;
end;
$$;

alter table public.identity_pack_entitlements enable row level security;
alter table public.purchase_receipts enable row level security;
alter table public.push_tokens enable row level security;
alter table public.notification_deliveries enable row level security;

drop policy if exists "Users can read own identity pack entitlements" on public.identity_pack_entitlements;
create policy "Users can read own identity pack entitlements"
  on public.identity_pack_entitlements
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can read own purchase receipts" on public.purchase_receipts;
create policy "Users can read own purchase receipts"
  on public.purchase_receipts
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can read own push tokens" on public.push_tokens;
create policy "Users can read own push tokens"
  on public.push_tokens
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own push tokens" on public.push_tokens;
create policy "Users can insert own push tokens"
  on public.push_tokens
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own push tokens" on public.push_tokens;
create policy "Users can update own push tokens"
  on public.push_tokens
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own push tokens" on public.push_tokens;
create policy "Users can delete own push tokens"
  on public.push_tokens
  for delete
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can read own notification deliveries" on public.notification_deliveries;
create policy "Users can read own notification deliveries"
  on public.notification_deliveries
  for select
  to authenticated
  using (auth.uid() = receiver_id);

grant select on public.identity_pack_entitlements to authenticated;
grant select on public.purchase_receipts to authenticated;
grant select, insert, update, delete on public.push_tokens to authenticated;
grant select on public.notification_deliveries to authenticated;

revoke execute on function public.expire_unsaved_blink_media(int) from public;
