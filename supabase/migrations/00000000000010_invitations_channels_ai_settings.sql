-- ============================================================================
-- Team invitations (Identity Domain Schema — "invitations" table, already
-- specified in the docs but never built).
-- ============================================================================

create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  email text not null,
  role_id uuid not null references public.roles (id),
  invited_by uuid references public.profiles (id),
  token uuid not null default gen_random_uuid(),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'revoked', 'expired')),
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  unique (business_id, email, status)
);

create index if not exists idx_invitations_business_id on public.invitations (business_id);
create unique index if not exists idx_invitations_token on public.invitations (token);

alter table public.invitations enable row level security;

drop policy if exists "Members can view their business's invitations" on public.invitations;
create policy "Members can view their business's invitations"
  on public.invitations for select
  using (public.is_business_member(business_id));

drop policy if exists "Owners and admins can manage invitations" on public.invitations;
create policy "Owners and admins can manage invitations"
  on public.invitations for all
  using (
    exists (
      select 1 from public.business_members bm
      join public.roles r on r.id = bm.role_id
      where bm.business_id = invitations.business_id
        and bm.profile_id = auth.uid()
        and r.name in ('Owner', 'Administrator')
    )
  )
  with check (
    exists (
      select 1 from public.business_members bm
      join public.roles r on r.id = bm.role_id
      where bm.business_id = invitations.business_id
        and bm.profile_id = auth.uid()
        and r.name in ('Owner', 'Administrator')
    )
  );

-- ============================================================================
-- Communication channels (Architecture Playbook — Communication Domain
-- "Channel"). Real structure for connecting WhatsApp/Email/etc; connection
-- itself requires external credentials this migration cannot provide.
-- ============================================================================

create table if not exists public.communication_channels (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  channel_type text not null check (channel_type in ('whatsapp', 'email', 'instagram', 'sms', 'voice')),
  label text not null,
  identifier text,
  status text not null default 'not_connected' check (status in ('not_connected', 'pending', 'connected', 'error')),
  ai_gatekeeper_enabled boolean not null default false,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_communication_channels_business_id on public.communication_channels (business_id);

drop trigger if exists communication_channels_set_updated_at on public.communication_channels;
create trigger communication_channels_set_updated_at
  before update on public.communication_channels
  for each row
  execute function public.set_updated_at();

alter table public.communication_channels enable row level security;

drop policy if exists "Members can view their business's channels" on public.communication_channels;
create policy "Members can view their business's channels"
  on public.communication_channels for select
  using (public.is_business_member(business_id));

drop policy if exists "Owners and admins can manage channels" on public.communication_channels;
create policy "Owners and admins can manage channels"
  on public.communication_channels for all
  using (
    exists (
      select 1 from public.business_members bm
      join public.roles r on r.id = bm.role_id
      where bm.business_id = communication_channels.business_id
        and bm.profile_id = auth.uid()
        and r.name in ('Owner', 'Administrator')
    )
  )
  with check (
    exists (
      select 1 from public.business_members bm
      join public.roles r on r.id = bm.role_id
      where bm.business_id = communication_channels.business_id
        and bm.profile_id = auth.uid()
        and r.name in ('Owner', 'Administrator')
    )
  );

-- ============================================================================
-- Business-level AI settings (gatekeeper rules live here — a per-business
-- policy, not a per-channel toggle, since "only let business-related
-- messages through" is a business-wide intent).
-- ============================================================================

create table if not exists public.business_ai_settings (
  business_id uuid primary key references public.businesses (id) on delete cascade,
  gatekeeper_enabled boolean not null default false,
  gatekeeper_instructions text,
  updated_at timestamptz not null default now()
);

drop trigger if exists business_ai_settings_set_updated_at on public.business_ai_settings;
create trigger business_ai_settings_set_updated_at
  before update on public.business_ai_settings
  for each row
  execute function public.set_updated_at();

alter table public.business_ai_settings enable row level security;

drop policy if exists "Members can view their business's AI settings" on public.business_ai_settings;
create policy "Members can view their business's AI settings"
  on public.business_ai_settings for select
  using (public.is_business_member(business_id));

drop policy if exists "Owners and admins can manage AI settings" on public.business_ai_settings;
create policy "Owners and admins can manage AI settings"
  on public.business_ai_settings for all
  using (
    exists (
      select 1 from public.business_members bm
      join public.roles r on r.id = bm.role_id
      where bm.business_id = business_ai_settings.business_id
        and bm.profile_id = auth.uid()
        and r.name in ('Owner', 'Administrator')
    )
  )
  with check (
    exists (
      select 1 from public.business_members bm
      join public.roles r on r.id = bm.role_id
      where bm.business_id = business_ai_settings.business_id
        and bm.profile_id = auth.uid()
        and r.name in ('Owner', 'Administrator')
    )
  );
