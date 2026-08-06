-- ============================================================================
-- Inventory Domain — Products, Stock
-- Ref: Architecture Playbook — Inventory Domain ("Owns: Products, SKUs,
--      Stock, Warehouses, Categories, Variants, Inventory Movement").
-- Variants/Warehouses/Movement history are future scope — this covers a
-- single-location product catalog with stock levels, enough for real
-- low-stock alerting.
-- ============================================================================

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  name text not null,
  sku text,
  category text,
  description text,
  price numeric(12, 2) not null default 0,
  currency text not null default 'COP',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, sku)
);

create index if not exists idx_products_business_id on public.products (business_id);
create index if not exists idx_products_category on public.products (business_id, category);

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row
  execute function public.set_updated_at();

create table if not exists public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  quantity_on_hand int not null default 0 check (quantity_on_hand >= 0),
  reorder_threshold int not null default 5 check (reorder_threshold >= 0),
  updated_at timestamptz not null default now(),
  unique (product_id)
);

create index if not exists idx_inventory_items_business_id on public.inventory_items (business_id);

drop trigger if exists inventory_items_set_updated_at on public.inventory_items;
create trigger inventory_items_set_updated_at
  before update on public.inventory_items
  for each row
  execute function public.set_updated_at();

alter table public.products enable row level security;
alter table public.inventory_items enable row level security;

drop policy if exists "Members can view their business's products" on public.products;
create policy "Members can view their business's products"
  on public.products for select
  using (public.is_business_member(business_id));

drop policy if exists "Members can manage their business's products" on public.products;
create policy "Members can manage their business's products"
  on public.products for all
  using (public.is_business_member(business_id))
  with check (public.is_business_member(business_id));

drop policy if exists "Members can view their business's inventory" on public.inventory_items;
create policy "Members can view their business's inventory"
  on public.inventory_items for select
  using (public.is_business_member(business_id));

drop policy if exists "Members can manage their business's inventory" on public.inventory_items;
create policy "Members can manage their business's inventory"
  on public.inventory_items for all
  using (public.is_business_member(business_id))
  with check (public.is_business_member(business_id));
