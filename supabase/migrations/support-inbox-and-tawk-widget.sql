-- NovaVest support inbox + AI widget conversation storage

create table if not exists public.support_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  visitor_token text not null,
  guest_name text,
  guest_email text,
  subject text not null default 'Nova AI support conversation',
  status text not null default 'OPEN' check (status in ('OPEN', 'PENDING_ADMIN', 'PENDING_USER', 'CLOSED')),
  priority text not null default 'NORMAL' check (priority in ('LOW', 'NORMAL', 'HIGH', 'URGENT')),
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.support_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.support_conversations(id) on delete cascade,
  sender_type text not null check (sender_type in ('USER', 'ADMIN', 'SYSTEM')),
  sender_id uuid references auth.users(id) on delete set null,
  message text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists support_conversations_user_idx on public.support_conversations(user_id);
create index if not exists support_conversations_token_idx on public.support_conversations(visitor_token);
create index if not exists support_conversations_last_message_idx on public.support_conversations(last_message_at desc);
create index if not exists support_messages_conversation_idx on public.support_messages(conversation_id, created_at);

alter table public.support_conversations enable row level security;
alter table public.support_messages enable row level security;

drop policy if exists "Admins manage support conversations" on public.support_conversations;
create policy "Admins manage support conversations"
  on public.support_conversations
  for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins manage support messages" on public.support_messages;
create policy "Admins manage support messages"
  on public.support_messages
  for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Users read own support conversations" on public.support_conversations;
create policy "Users read own support conversations"
  on public.support_conversations
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users create own support conversations" on public.support_conversations;
create policy "Users create own support conversations"
  on public.support_conversations
  for insert
  with check (auth.uid() = user_id or user_id is null);

drop policy if exists "Users read own support messages" on public.support_messages;
create policy "Users read own support messages"
  on public.support_messages
  for select
  using (
    exists (
      select 1 from public.support_conversations c
      where c.id = conversation_id and c.user_id = auth.uid()
    )
  );

drop policy if exists "Users create support messages" on public.support_messages;
create policy "Users create support messages"
  on public.support_messages
  for insert
  with check (
    sender_type = 'USER'
    and exists (
      select 1 from public.support_conversations c
      where c.id = conversation_id and (c.user_id = auth.uid() or c.user_id is null)
    )
  );

drop trigger if exists support_conversations_touch_updated_at on public.support_conversations;
create trigger support_conversations_touch_updated_at
  before update on public.support_conversations
  for each row
  execute function public.touch_updated_at();

do $$
begin
  alter publication supabase_realtime add table public.support_conversations;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.support_messages;
exception when duplicate_object then null;
end $$;
