create table if not exists public.account_deletion_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  user_id_hash text not null,
  status text not null default 'processing',
  requested_at timestamptz not null default now(),
  completed_at timestamptz,
  error_message text,
  constraint account_deletion_requests_status check (
    status in ('processing', 'completed', 'failed')
  ),
  constraint account_deletion_requests_hash_format check (
    user_id_hash ~ '^[a-f0-9]{64}$'
  )
);

create index if not exists account_deletion_requests_user_idx
on public.account_deletion_requests (user_id)
where user_id is not null;

create index if not exists account_deletion_requests_requested_idx
on public.account_deletion_requests (requested_at desc);

alter table public.account_deletion_requests enable row level security;

drop policy if exists "account_deletion_requests_select_own"
on public.account_deletion_requests;

create policy "account_deletion_requests_select_own"
on public.account_deletion_requests for select
to authenticated
using (user_id = (select auth.uid()));

revoke all privileges on table public.account_deletion_requests from anon;
revoke all privileges on table public.account_deletion_requests from authenticated;

grant select on table public.account_deletion_requests to authenticated;
