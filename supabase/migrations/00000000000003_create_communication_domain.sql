-- ============================================================================
-- Communication Domain — Customers, Conversations, Messages
-- Ref: Architecture Playbook — Communication Domain
--      ("Owns: Conversations, Messages, Attachments, Message templates,
--        AI summaries, Conversation assignment")
-- Note: `customers` is minimal here (just enough to support the Inbox UI).
-- The full Customer domain (leads, segments, timeline, VIP rules) is its
-- own future milestone — this table will grow into that, not be replaced.
-- ============================================================================

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  name text not null,
  phone text,
  email text,
  avatar_url text,
  tags text[] not null default '{}',
  is_vip boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_customers_business_id on public.customers (business_id);

drop trigger if exists customers_set_updated_at on public.customers;
create trigger customers_set_updated_at
  before update on public.customers
  for each row
  execute function public.set_updated_at();

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  customer_id uuid not null references public.customers (id) on delete cascade,
  channel text not null default 'whatsapp',
  status text not null default 'open' check (status in ('open', 'pending', 'resolved')),
  priority text not null default 'normal' check (priority in ('normal', 'high', 'urgent')),
  assigned_to_name text,
  tags text[] not null default '{}',
  unread_count int not null default 0,
  ai_summary text,
  sentiment text check (sentiment in ('positive', 'neutral', 'negative')),
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_conversations_business_id on public.conversations (business_id);
create index if not exists idx_conversations_customer_id on public.conversations (customer_id);
create index if not exists idx_conversations_last_message_at on public.conversations (last_message_at desc);

drop trigger if exists conversations_set_updated_at on public.conversations;
create trigger conversations_set_updated_at
  before update on public.conversations
  for each row
  execute function public.set_updated_at();

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_type text not null check (sender_type in ('customer', 'agent', 'ai', 'system')),
  sender_name text,
  body text not null,
  media_url text,
  media_type text,
  is_internal_note boolean not null default false,
  ai_confidence numeric(3, 2),
  ai_status text check (ai_status in ('draft', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create index if not exists idx_messages_conversation_id on public.messages (conversation_id, created_at);

-- ----------------------------------------------------------------------------
-- Row Level Security — scoped to business membership, same pattern as
-- every other business-owned table.
-- ----------------------------------------------------------------------------
alter table public.customers enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

drop policy if exists "Members can view their business's customers" on public.customers;
create policy "Members can view their business's customers"
  on public.customers for select
  using (
    exists (
      select 1 from public.business_members bm
      where bm.business_id = customers.business_id and bm.profile_id = auth.uid()
    )
  );

drop policy if exists "Members can manage their business's customers" on public.customers;
create policy "Members can manage their business's customers"
  on public.customers for all
  using (
    exists (
      select 1 from public.business_members bm
      where bm.business_id = customers.business_id and bm.profile_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.business_members bm
      where bm.business_id = customers.business_id and bm.profile_id = auth.uid()
    )
  );

drop policy if exists "Members can view their business's conversations" on public.conversations;
create policy "Members can view their business's conversations"
  on public.conversations for select
  using (
    exists (
      select 1 from public.business_members bm
      where bm.business_id = conversations.business_id and bm.profile_id = auth.uid()
    )
  );

drop policy if exists "Members can manage their business's conversations" on public.conversations;
create policy "Members can manage their business's conversations"
  on public.conversations for all
  using (
    exists (
      select 1 from public.business_members bm
      where bm.business_id = conversations.business_id and bm.profile_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.business_members bm
      where bm.business_id = conversations.business_id and bm.profile_id = auth.uid()
    )
  );

drop policy if exists "Members can view messages in their business's conversations" on public.messages;
create policy "Members can view messages in their business's conversations"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations c
      join public.business_members bm on bm.business_id = c.business_id
      where c.id = messages.conversation_id and bm.profile_id = auth.uid()
    )
  );

drop policy if exists "Members can send messages in their business's conversations" on public.messages;
create policy "Members can send messages in their business's conversations"
  on public.messages for insert
  with check (
    exists (
      select 1 from public.conversations c
      join public.business_members bm on bm.business_id = c.business_id
      where c.id = messages.conversation_id and bm.profile_id = auth.uid()
    )
  );

drop policy if exists "Members can update messages in their business's conversations" on public.messages;
create policy "Members can update messages in their business's conversations"
  on public.messages for update
  using (
    exists (
      select 1 from public.conversations c
      join public.business_members bm on bm.business_id = c.business_id
      where c.id = messages.conversation_id and bm.profile_id = auth.uid()
    )
  );
