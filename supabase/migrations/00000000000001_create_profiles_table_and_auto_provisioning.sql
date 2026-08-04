-- ============================================================================
-- Identity Domain — profiles table + auto-provisioning trigger
-- Ref: Business AI Manager — Identity Domain Schema, "Table: profiles"
-- ============================================================================

-- Extension needed for gen_random_uuid() (usually already enabled on Supabase)
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- Table: profiles
-- Stores application-specific information for authenticated users.
-- Supabase Auth (auth.users) owns authentication; this table owns profile data.
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  first_name text,
  last_name text,
  display_name text,
  avatar_url text,
  phone text,
  preferred_language text not null default 'es' check (preferred_language in ('es', 'en')),
  timezone text not null default 'America/Bogota',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is
  'Extended, application-specific user information. One row per auth.users row, created automatically on signup.';

-- Keep updated_at current on every update.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- Auto-provisioning: create a profile row the moment a new auth.users row
-- is created (Operating Manual — "reduce manual work"; no user should ever
-- exist without a profile).
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, preferred_language)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'preferred_language', 'es')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- Row Level Security
-- Users may only read and update their own profile row.
-- ----------------------------------------------------------------------------
alter table public.profiles enable row level security;

drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- No insert/delete policies for regular users: rows are created exclusively
-- by the on_auth_user_created trigger (security definer) and removed via
-- auth.users cascade delete.
