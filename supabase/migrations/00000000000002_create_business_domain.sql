-- ============================================================================
-- Identity Domain — Businesses, Roles, Permissions, Membership
-- Ref: Identity Domain Schema — "businesses", "roles", "permissions",
--      "role_permissions", "business_members"
-- Roadmap M2 — Business Onboarding
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Table: businesses (tenants)
-- ----------------------------------------------------------------------------
create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  legal_name text,
  slug text not null unique,
  logo_url text,
  default_language text not null default 'es' check (default_language in ('es', 'en')),
  currency text not null default 'COP',
  timezone text not null default 'America/Bogota',
  country text,
  subscription_plan text not null default 'free',
  subscription_status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists businesses_set_updated_at on public.businesses;
create trigger businesses_set_updated_at
  before update on public.businesses
  for each row
  execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- Table: roles
-- System roles have business_id = null and are shared read-only templates.
-- ----------------------------------------------------------------------------
create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses (id) on delete cascade,
  name text not null,
  description text,
  is_system_role boolean not null default false,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- Table: permissions
-- ----------------------------------------------------------------------------
create table if not exists public.permissions (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  category text not null,
  description text
);

-- ----------------------------------------------------------------------------
-- Table: role_permissions (many-to-many)
-- ----------------------------------------------------------------------------
create table if not exists public.role_permissions (
  role_id uuid not null references public.roles (id) on delete cascade,
  permission_id uuid not null references public.permissions (id) on delete cascade,
  primary key (role_id, permission_id)
);

-- ----------------------------------------------------------------------------
-- Table: business_members
-- Associates a profile with a business under a role.
-- ----------------------------------------------------------------------------
create table if not exists public.business_members (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  role_id uuid not null references public.roles (id),
  is_owner boolean not null default false,
  is_active boolean not null default true,
  joined_at timestamptz not null default now(),
  invited_by uuid references public.profiles (id),
  unique (business_id, profile_id)
);

create index if not exists idx_business_members_business_id on public.business_members (business_id);
create index if not exists idx_business_members_profile_id on public.business_members (profile_id);

-- ----------------------------------------------------------------------------
-- Seed: system roles (shared templates, business_id = null)
-- ----------------------------------------------------------------------------
insert into public.roles (name, description, is_system_role)
select * from (values
  ('Owner', 'Unrestricted access to the business.', true),
  ('Administrator', 'Full operational access, cannot delete the business.', true),
  ('Manager', 'Manages team and day-to-day operations.', true),
  ('Assistant', 'Supports daily operations with limited administrative access.', true),
  ('Sales', 'Manages customers, quotes, and orders.', true),
  ('Warehouse', 'Manages inventory and fulfillment.', true),
  ('Finance', 'Manages payments, invoices, and financial reports.', true),
  ('Read Only', 'View-only access across the business.', true)
) as v(name, description, is_system_role)
where not exists (
  select 1 from public.roles r where r.name = v.name and r.is_system_role = true
);

-- ----------------------------------------------------------------------------
-- Seed: baseline permissions
-- ----------------------------------------------------------------------------
insert into public.permissions (key, category, description)
select * from (values
  ('manage_business', 'administration', 'Edit business profile and settings'),
  ('manage_team', 'administration', 'Invite, remove, and assign roles to team members'),
  ('manage_billing', 'administration', 'Manage subscription and billing'),
  ('view_customers', 'customers', 'View customer records'),
  ('edit_customers', 'customers', 'Create and edit customer records'),
  ('view_orders', 'sales', 'View orders'),
  ('edit_orders', 'sales', 'Create and edit orders'),
  ('view_reports', 'analytics', 'View dashboards and reports')
) as v(key, category, description)
where not exists (select 1 from public.permissions p where p.key = v.key);

-- Wire baseline role -> permission grants.
do $$
declare
  r_owner uuid; r_admin uuid; r_manager uuid; r_assistant uuid;
  r_sales uuid; r_warehouse uuid; r_finance uuid; r_readonly uuid;
begin
  select id into r_owner from public.roles where name = 'Owner' and is_system_role limit 1;
  select id into r_admin from public.roles where name = 'Administrator' and is_system_role limit 1;
  select id into r_manager from public.roles where name = 'Manager' and is_system_role limit 1;
  select id into r_assistant from public.roles where name = 'Assistant' and is_system_role limit 1;
  select id into r_sales from public.roles where name = 'Sales' and is_system_role limit 1;
  select id into r_warehouse from public.roles where name = 'Warehouse' and is_system_role limit 1;
  select id into r_finance from public.roles where name = 'Finance' and is_system_role limit 1;
  select id into r_readonly from public.roles where name = 'Read Only' and is_system_role limit 1;

  -- Owner + Administrator: everything.
  insert into public.role_permissions (role_id, permission_id)
  select r_owner, id from public.permissions
  on conflict do nothing;

  insert into public.role_permissions (role_id, permission_id)
  select r_admin, id from public.permissions
  on conflict do nothing;

  -- Manager: everything except billing.
  insert into public.role_permissions (role_id, permission_id)
  select r_manager, id from public.permissions where key <> 'manage_billing'
  on conflict do nothing;

  -- Sales: customers + orders.
  insert into public.role_permissions (role_id, permission_id)
  select r_sales, id from public.permissions
  where key in ('view_customers', 'edit_customers', 'view_orders', 'edit_orders')
  on conflict do nothing;

  -- Finance: orders (view) + reports.
  insert into public.role_permissions (role_id, permission_id)
  select r_finance, id from public.permissions
  where key in ('view_orders', 'view_reports')
  on conflict do nothing;

  -- Warehouse: orders (view only).
  insert into public.role_permissions (role_id, permission_id)
  select r_warehouse, id from public.permissions where key = 'view_orders'
  on conflict do nothing;

  -- Assistant: view-level access.
  insert into public.role_permissions (role_id, permission_id)
  select r_assistant, id from public.permissions
  where key in ('view_customers', 'view_orders', 'view_reports')
  on conflict do nothing;

  -- Read Only: every view_* permission.
  insert into public.role_permissions (role_id, permission_id)
  select r_readonly, id from public.permissions where key like 'view_%'
  on conflict do nothing;
end $$;

-- ----------------------------------------------------------------------------
-- Function: create_business_with_owner
-- Atomically creates a business and makes the calling user its Owner.
-- SECURITY DEFINER: bypasses RLS specifically for this one controlled
-- operation (a brand-new business has no members yet, so no RLS policy
-- could ever authorize the very first membership row without this).
-- Still safe: it hardcodes auth.uid() as the owner, ignoring any caller-
-- supplied profile id, so a user can only ever make *themselves* the owner.
-- ----------------------------------------------------------------------------
create or replace function public.create_business_with_owner(
  business_name text,
  business_slug text,
  business_default_language text default 'es'
)
returns public.businesses
language plpgsql
security definer set search_path = public
as $$
declare
  new_business public.businesses;
  owner_role_id uuid;
  caller_id uuid := auth.uid();
begin
  if caller_id is null then
    raise exception 'Not authenticated';
  end if;

  select id into owner_role_id from public.roles
  where name = 'Owner' and is_system_role = true
  limit 1;

  insert into public.businesses (name, slug, default_language)
  values (business_name, business_slug, business_default_language)
  returning * into new_business;

  insert into public.business_members (business_id, profile_id, role_id, is_owner)
  values (new_business.id, caller_id, owner_role_id, true);

  return new_business;
end;
$$;

-- ----------------------------------------------------------------------------
-- Row Level Security
-- ----------------------------------------------------------------------------
alter table public.businesses enable row level security;
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.business_members enable row level security;

-- businesses: visible/editable only to members.
drop policy if exists "Members can view their businesses" on public.businesses;
create policy "Members can view their businesses"
  on public.businesses for select
  using (
    exists (
      select 1 from public.business_members bm
      where bm.business_id = businesses.id and bm.profile_id = auth.uid()
    )
  );

drop policy if exists "Owners and admins can update their business" on public.businesses;
create policy "Owners and admins can update their business"
  on public.businesses for update
  using (
    exists (
      select 1 from public.business_members bm
      join public.roles r on r.id = bm.role_id
      where bm.business_id = businesses.id
        and bm.profile_id = auth.uid()
        and r.name in ('Owner', 'Administrator')
    )
  );

-- roles: system roles are visible to everyone; business-specific roles only
-- to that business's members. (Not yet used — all roles are system roles
-- for now — but the policy is future-proofed.)
drop policy if exists "Roles are visible to relevant users" on public.roles;
create policy "Roles are visible to relevant users"
  on public.roles for select
  using (
    is_system_role = true
    or exists (
      select 1 from public.business_members bm
      where bm.business_id = roles.business_id and bm.profile_id = auth.uid()
    )
  );

-- permissions: readable by any authenticated user (reference data).
drop policy if exists "Permissions are readable by authenticated users" on public.permissions;
create policy "Permissions are readable by authenticated users"
  on public.permissions for select
  to authenticated
  using (true);

drop policy if exists "Role permissions are readable by authenticated users" on public.role_permissions;
create policy "Role permissions are readable by authenticated users"
  on public.role_permissions for select
  to authenticated
  using (true);

-- business_members: visible only to fellow members of the same business.
drop policy if exists "Members can view their own memberships and teammates" on public.business_members;
create policy "Members can view their own memberships and teammates"
  on public.business_members for select
  using (
    exists (
      select 1 from public.business_members bm
      where bm.business_id = business_members.business_id and bm.profile_id = auth.uid()
    )
  );

-- No direct insert/update/delete policies for business_members: membership
-- changes go through security-definer functions (create_business_with_owner
-- today; invite/remove functions in a future milestone).
