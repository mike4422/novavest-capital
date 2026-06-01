-- NovaVest Capital custom email confirmation migration
-- Run this if you already ran the original schema before this feature was added.

create extension if not exists "pgcrypto";

alter table public.profiles
  add column if not exists email_verified_at timestamptz;

create table if not exists public.email_verification_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  email text not null,
  token_hash text unique not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists profiles_email_verified_idx on public.profiles(email_verified_at);
create index if not exists email_verification_tokens_hash_idx on public.email_verification_tokens(token_hash);
create index if not exists email_verification_tokens_user_idx on public.email_verification_tokens(user_id, used_at);

alter table public.email_verification_tokens enable row level security;

drop policy if exists "Admins read email verification tokens" on public.email_verification_tokens;
create policy "Admins read email verification tokens"
  on public.email_verification_tokens
  for select
  using (public.is_admin());

-- Optional: mark existing users as verified so old accounts are not locked out.
-- Remove this update if you want all existing users to confirm manually.
update public.profiles
set email_verified_at = coalesce(email_verified_at, now())
where email_verified_at is null;
