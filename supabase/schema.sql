-- NovaVest Capital Supabase schema
-- Run this in Supabase SQL Editor after creating your project.

create extension if not exists "pgcrypto";

-- -----------------------------
-- Enums
-- -----------------------------
do $$ begin
  create type public.user_status as enum ('ACTIVE', 'SUSPENDED', 'PENDING_REVIEW');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.request_status as enum ('PENDING_REVIEW', 'APPROVED', 'REJECTED');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.investment_status as enum ('PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.transaction_status as enum ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.admin_role as enum ('admin', 'super_admin');
exception when duplicate_object then null; end $$;

-- -----------------------------
-- Core tables
-- -----------------------------
create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  description text,
  created_at timestamptz not null default now()
);

insert into public.roles (name, description) values
('user', 'Standard investor account'),
('admin', 'Admin dashboard access'),
('super_admin', 'Full platform owner access')
on conflict (name) do nothing;

create table if not exists public.admin_roles (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  role public.admin_role not null default 'admin',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text unique not null,
  email_verified_at timestamptz,
  avatar_url text,
  balance numeric(18,2) not null default 0 check (balance >= 0),
  referral_earnings numeric(18,2) not null default 0 check (referral_earnings >= 0),
  referral_code text unique not null,
  referred_by uuid references public.profiles(id) on delete set null,
  status public.user_status not null default 'ACTIVE',
  kyc_status public.request_status not null default 'PENDING_REVIEW',
  two_factor_enabled boolean not null default false,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.investment_plans (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  invest_amount numeric(18,2) not null,
  return_amount numeric(18,2) not null,
  profit_amount numeric(18,2) not null,
  duration_hours int not null,
  min_investment numeric(18,2) not null,
  max_investment numeric(18,2) not null,
  risk_level text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.investments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan_slug text not null,
  plan_name text not null,
  amount numeric(18,2) not null check (amount > 0),
  expected_profit numeric(18,2) not null,
  return_amount numeric(18,2) not null,
  roi_percent numeric(8,2) not null,
  start_date timestamptz not null,
  end_date timestamptz not null,
  completed_at timestamptz,
  status public.investment_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.wallets (
  id uuid primary key default gen_random_uuid(),
  asset text not null,
  network text not null,
  label text not null,
  address text not null,
  qr_code_url text,
  minimum_deposit numeric(18,2) not null default 100,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(asset, network)
);

create table if not exists public.deposits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric(18,2) not null check (amount > 0),
  asset text not null,
  network text not null,
  tx_hash text,
  proof_url text,
  status public.request_status not null default 'PENDING_REVIEW',
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.withdrawals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric(18,2) not null check (amount > 0),
  asset text not null,
  network text not null,
  wallet_address text not null,
  status public.request_status not null default 'PENDING_REVIEW',
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  amount numeric(18,2) not null,
  asset text not null default 'USD',
  status public.transaction_status not null default 'PENDING',
  reference text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null default 'SYSTEM',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null,
  referred_id uuid not null,
  commission_amount numeric(18,2) not null default 0,
  status text not null default 'REGISTERED',
  created_at timestamptz not null default now(),
  constraint referrals_referrer_id_fkey foreign key (referrer_id) references public.profiles(id) on delete cascade,
  constraint referrals_referred_id_fkey foreign key (referred_id) references public.profiles(id) on delete cascade,
  unique(referrer_id, referred_id)
);

create table if not exists public.settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text not null,
  active boolean not null default true,
  audience text not null default 'all',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  ip_address text,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.kyc_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  document_type text not null,
  document_url text not null,
  status public.request_status not null default 'PENDING_REVIEW',
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.promo_codes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  discount_percent numeric(8,2) not null default 0,
  bonus_amount numeric(18,2) not null default 0,
  max_uses int,
  used_count int not null default 0,
  active boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.user_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  device_name text,
  ip_address text,
  last_active_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.email_verification_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  email text not null,
  token_hash text unique not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

-- -----------------------------
-- Indexes
-- -----------------------------
create index if not exists profiles_email_idx on public.profiles(email);
create index if not exists profiles_email_verified_idx on public.profiles(email_verified_at);
create index if not exists email_verification_tokens_hash_idx on public.email_verification_tokens(token_hash);
create index if not exists email_verification_tokens_user_idx on public.email_verification_tokens(user_id, used_at);
create index if not exists deposits_user_status_idx on public.deposits(user_id, status);
create index if not exists withdrawals_user_status_idx on public.withdrawals(user_id, status);
create index if not exists investments_user_status_idx on public.investments(user_id, status);
create index if not exists transactions_user_created_idx on public.transactions(user_id, created_at desc);
create index if not exists notifications_user_created_idx on public.notifications(user_id, created_at desc);
create index if not exists activity_logs_created_idx on public.activity_logs(created_at desc);

-- -----------------------------
-- Helper functions
-- -----------------------------
create or replace function public.is_admin_email(check_email text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_roles
    where lower(email) = lower(check_email)
      and active = true
      and role in ('admin', 'super_admin')
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select public.is_admin_email(coalesce(auth.jwt() ->> 'email', ''));
$$;

create or replace function public.increment_user_balance(p_user_id uuid, p_amount numeric)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_is_service boolean;
  v_is_allowed boolean;
begin
  v_is_service := coalesce(auth.jwt() ->> 'role', '') = 'service_role';
  v_is_allowed := v_is_service or public.is_admin() or (auth.uid() = p_user_id and p_amount < 0);

  if not v_is_allowed then
    raise exception 'Not authorized to update balance';
  end if;

  update public.profiles
  set balance = balance + p_amount,
      updated_at = now()
  where id = p_user_id
    and balance + p_amount >= 0;

  if not found then
    raise exception 'Insufficient balance or user not found';
  end if;
end;
$$;

grant execute on function public.increment_user_balance(uuid, numeric) to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_admin_email(text) to authenticated;

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at before update on public.profiles for each row execute function public.touch_updated_at();
drop trigger if exists deposits_touch_updated_at on public.deposits;
create trigger deposits_touch_updated_at before update on public.deposits for each row execute function public.touch_updated_at();
drop trigger if exists withdrawals_touch_updated_at on public.withdrawals;
create trigger withdrawals_touch_updated_at before update on public.withdrawals for each row execute function public.touch_updated_at();
drop trigger if exists investments_touch_updated_at on public.investments;
create trigger investments_touch_updated_at before update on public.investments for each row execute function public.touch_updated_at();
drop trigger if exists wallets_touch_updated_at on public.wallets;
create trigger wallets_touch_updated_at before update on public.wallets for each row execute function public.touch_updated_at();

-- -----------------------------
-- Seed data
-- -----------------------------
insert into public.investment_plans (slug, name, invest_amount, return_amount, profit_amount, duration_hours, min_investment, max_investment, risk_level)
values
('starter', 'Starter Plan', 100, 125, 25, 24, 100, 199, 'Conservative'),
('silver', 'Silver Plan', 200, 250, 50, 24, 200, 499, 'Balanced'),
('bronze', 'Bronze Plan', 500, 650, 150, 48, 500, 999, 'Growth'),
('platinum', 'Platinum Plan', 1000, 1400, 400, 72, 1000, 4999, 'Advanced'),
('diamond-vip', 'Diamond VIP Plan', 5000, 9500, 4500, 120, 5000, 19999, 'VIP'),
('gold-vip', 'Gold VIP Plan', 20000, 45500, 25500, 168, 20000, 1000000, 'VIP')
on conflict (slug) do update set
  name = excluded.name,
  invest_amount = excluded.invest_amount,
  return_amount = excluded.return_amount,
  profit_amount = excluded.profit_amount,
  duration_hours = excluded.duration_hours,
  min_investment = excluded.min_investment,
  max_investment = excluded.max_investment,
  risk_level = excluded.risk_level;

insert into public.wallets (asset, network, label, address, minimum_deposit, enabled)
values
('USDT', 'TRC20', 'USDT TRC20 Deposit Wallet', 'TXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', 100, true),
('USDT', 'BEP20', 'USDT BEP20 Deposit Wallet', '0xXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', 100, true),
('USDT', 'ERC20', 'USDT ERC20 Deposit Wallet', '0xYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY', 100, true),
('ETH', 'ETH', 'Ethereum Deposit Wallet', '0xZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ', 100, true),
('BTC', 'BTC', 'Bitcoin Deposit Wallet', 'bc1qxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 100, true)
on conflict (asset, network) do nothing;

insert into public.settings (key, value) values
('platform', '{"name":"NovaVest Capital","maintenance":false,"referralCommissionPercent":5}'::jsonb),
('limits', '{"minimumWithdrawal":50,"dailyWithdrawalLimit":100000}'::jsonb)
on conflict (key) do nothing;

-- -----------------------------
-- Storage buckets
-- -----------------------------
insert into storage.buckets (id, name, public)
values ('payment-proofs', 'payment-proofs', true), ('kyc-documents', 'kyc-documents', false)
on conflict (id) do nothing;

-- -----------------------------
-- Row Level Security
-- -----------------------------
alter table public.roles enable row level security;
alter table public.admin_roles enable row level security;
alter table public.profiles enable row level security;
alter table public.investment_plans enable row level security;
alter table public.investments enable row level security;
alter table public.wallets enable row level security;
alter table public.deposits enable row level security;
alter table public.withdrawals enable row level security;
alter table public.transactions enable row level security;
alter table public.notifications enable row level security;
alter table public.referrals enable row level security;
alter table public.settings enable row level security;
alter table public.announcements enable row level security;
alter table public.activity_logs enable row level security;
alter table public.kyc_documents enable row level security;
alter table public.promo_codes enable row level security;
alter table public.user_sessions enable row level security;
alter table public.email_verification_tokens enable row level security;

-- Public/readable reference data
create policy "Anyone can read active plans" on public.investment_plans for select using (active = true);
create policy "Anyone can read enabled wallets" on public.wallets for select using (enabled = true);
create policy "Anyone can read active announcements" on public.announcements for select using (active = true);

-- Admin broad access
create policy "Admins read admin roles" on public.admin_roles for select using (public.is_admin());
create policy "Admins manage admin roles" on public.admin_roles for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage profiles" on public.profiles for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage plans" on public.investment_plans for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage wallets" on public.wallets for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage deposits" on public.deposits for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage withdrawals" on public.withdrawals for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage investments" on public.investments for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage transactions" on public.transactions for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage notifications" on public.notifications for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage referrals" on public.referrals for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage settings" on public.settings for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage announcements" on public.announcements for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins read activity logs" on public.activity_logs for select using (public.is_admin());
create policy "Admins manage KYC" on public.kyc_documents for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage promo codes" on public.promo_codes for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage sessions" on public.user_sessions for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins read email verification tokens" on public.email_verification_tokens for select using (public.is_admin());

-- User scoped access
create policy "Users read own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "Users read own deposits" on public.deposits for select using (auth.uid() = user_id);
create policy "Users create own deposits" on public.deposits for insert with check (auth.uid() = user_id);

create policy "Users read own withdrawals" on public.withdrawals for select using (auth.uid() = user_id);
create policy "Users create own withdrawals" on public.withdrawals for insert with check (auth.uid() = user_id);

create policy "Users read own investments" on public.investments for select using (auth.uid() = user_id);
create policy "Users create own investments" on public.investments for insert with check (auth.uid() = user_id);

create policy "Users read own transactions" on public.transactions for select using (auth.uid() = user_id);
create policy "Users create own transactions" on public.transactions for insert with check (auth.uid() = user_id);

create policy "Users read own notifications" on public.notifications for select using (auth.uid() = user_id);
create policy "Users update own notifications" on public.notifications for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users read own referrals" on public.referrals for select using (auth.uid() = referrer_id or auth.uid() = referred_id);
create policy "Users create own KYC docs" on public.kyc_documents for insert with check (auth.uid() = user_id);
create policy "Users read own KYC docs" on public.kyc_documents for select using (auth.uid() = user_id);
create policy "Users read own sessions" on public.user_sessions for select using (auth.uid() = user_id);

-- Storage policies
create policy "Authenticated users upload payment proofs" on storage.objects for insert to authenticated with check (bucket_id = 'payment-proofs');
create policy "Authenticated users read payment proofs" on storage.objects for select to authenticated using (bucket_id = 'payment-proofs');
create policy "Authenticated users upload KYC documents" on storage.objects for insert to authenticated with check (bucket_id = 'kyc-documents');
create policy "Users read own KYC documents" on storage.objects for select to authenticated using (bucket_id = 'kyc-documents' and (storage.foldername(name))[1] = auth.uid()::text);

-- Realtime publication helpers
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.transactions;
alter publication supabase_realtime add table public.investments;
