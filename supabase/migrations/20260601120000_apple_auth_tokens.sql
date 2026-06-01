create table if not exists public.apple_auth_tokens (
  user_id uuid primary key references auth.users(id) on delete cascade,
  client_id text not null,
  token_type text not null,
  token_ciphertext text not null,
  token_iv text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  revoked_at timestamptz,
  constraint apple_auth_tokens_type check (
    token_type = 'refresh_token'
  )
);

create index if not exists apple_auth_tokens_updated_idx
on public.apple_auth_tokens (updated_at desc);

alter table public.apple_auth_tokens enable row level security;

revoke all privileges on table public.apple_auth_tokens from anon;
revoke all privileges on table public.apple_auth_tokens from authenticated;

alter table public.account_deletion_requests
add column if not exists apple_revoke_status text,
add column if not exists apple_revoke_error text;

do $$
begin
  alter table public.account_deletion_requests
  add constraint account_deletion_requests_apple_revoke_status check (
    apple_revoke_status is null
    or apple_revoke_status in (
      'not_available',
      'completed',
      'already_revoked',
      'failed'
    )
  );
exception
  when duplicate_object then null;
end $$;
