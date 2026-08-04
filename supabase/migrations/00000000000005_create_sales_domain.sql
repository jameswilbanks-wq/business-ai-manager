-- ============================================================================
-- Sales Domain — Orders, Order Items
-- Ref: Architecture Playbook — Sales Domain ("Owns: Quotes, Orders,
--      Discounts, Sales Pipeline, Revenue Metrics, Order Status, Order
--      History"). Quotes/Discounts/Pipeline are future scope — this
--      migration covers Orders, the core of the module.
-- Product Glossary — Order statuses: Draft, Awaiting Payment, Paid,
--      Preparing, Ready, Shipped, Delivered, Completed, Cancelled.
-- ============================================================================

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  customer_id uuid not null references public.customers (id) on delete restrict,
  conversation_id uuid references public.conversations (id) on delete set null,
  order_number text not null,
  status text not null default 'draft' check (status in (
    'draft', 'awaiting_payment', 'paid', 'preparing', 'ready',
    'shipped', 'delivered', 'completed', 'cancelled'
  )),
  currency text not null default 'COP',
  subtotal numeric(12, 2) not null default 0,
  discount numeric(12, 2) not null default 0,
  total numeric(12, 2) not null default 0,
  notes text,
  delivery_address text,
  delivery_date date,
  paid_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, order_number)
);

create index if not exists idx_orders_business_id on public.orders (business_id);
create index if not exists idx_orders_customer_id on public.orders (customer_id);
create index if not exists idx_orders_status on public.orders (business_id, status);
create index if not exists idx_orders_created_at on public.orders (created_at desc);

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
  before update on public.orders
  for each row
  execute function public.set_updated_at();

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_name text not null,
  description text,
  quantity int not null default 1 check (quantity > 0),
  unit_price numeric(12, 2) not null default 0,
  line_total numeric(12, 2) not null default 0,
  sort_order int not null default 0
);

create index if not exists idx_order_items_order_id on public.order_items (order_id);

-- ----------------------------------------------------------------------------
-- Row Level Security — same is_business_member() helper as every other
-- business-owned table (see 00000000000004: avoids the self-referential
-- recursion bug that broke business_members earlier).
-- ----------------------------------------------------------------------------
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "Members can view their business's orders" on public.orders;
create policy "Members can view their business's orders"
  on public.orders for select
  using (public.is_business_member(business_id));

drop policy if exists "Members can manage their business's orders" on public.orders;
create policy "Members can manage their business's orders"
  on public.orders for all
  using (public.is_business_member(business_id))
  with check (public.is_business_member(business_id));

drop policy if exists "Members can view items on their business's orders" on public.order_items;
create policy "Members can view items on their business's orders"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and public.is_business_member(o.business_id)
    )
  );

drop policy if exists "Members can manage items on their business's orders" on public.order_items;
create policy "Members can manage items on their business's orders"
  on public.order_items for all
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and public.is_business_member(o.business_id)
    )
  )
  with check (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and public.is_business_member(o.business_id)
    )
  );
