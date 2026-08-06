-- ============================================================================
-- Supplier Domain — Suppliers, Supplier-Product links
-- Ref: Architecture Playbook — Supplier Domain ("Owns: Suppliers, Purchase
--      Orders, Vendor Pricing, Lead Times, Supplier Performance, Contracts,
--      Supplier Contacts"). Purchase Orders / contracts / performance
--      tracking are future scope — this covers supplier profiles and
--      which products each one supplies.
-- ============================================================================

create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  name text not null,
  contact_name text,
  phone text,
  email text,
  lead_time_days int,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_suppliers_business_id on public.suppliers (business_id);

drop trigger if exists suppliers_set_updated_at on public.suppliers;
create trigger suppliers_set_updated_at
  before update on public.suppliers
  for each row
  execute function public.set_updated_at();

create table if not exists public.supplier_products (
  supplier_id uuid not null references public.suppliers (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  primary key (supplier_id, product_id)
);

alter table public.suppliers enable row level security;
alter table public.supplier_products enable row level security;

drop policy if exists "Members can view their business's suppliers" on public.suppliers;
create policy "Members can view their business's suppliers"
  on public.suppliers for select
  using (public.is_business_member(business_id));

drop policy if exists "Members can manage their business's suppliers" on public.suppliers;
create policy "Members can manage their business's suppliers"
  on public.suppliers for all
  using (public.is_business_member(business_id))
  with check (public.is_business_member(business_id));

drop policy if exists "Members can view their business's supplier products" on public.supplier_products;
create policy "Members can view their business's supplier products"
  on public.supplier_products for select
  using (
    exists (
      select 1 from public.suppliers s
      where s.id = supplier_products.supplier_id and public.is_business_member(s.business_id)
    )
  );

drop policy if exists "Members can manage their business's supplier products" on public.supplier_products;
create policy "Members can manage their business's supplier products"
  on public.supplier_products for all
  using (
    exists (
      select 1 from public.suppliers s
      where s.id = supplier_products.supplier_id and public.is_business_member(s.business_id)
    )
  )
  with check (
    exists (
      select 1 from public.suppliers s
      where s.id = supplier_products.supplier_id and public.is_business_member(s.business_id)
    )
  );
