-- ============================================================================
-- Fix: infinite recursion in business_members RLS policy (Postgres 42P17)
--
-- The original "Members can view their own memberships and teammates"
-- policy on business_members checked membership via a subquery against
-- business_members itself — but that subquery is ALSO subject to RLS,
-- creating a self-referential loop that Postgres correctly rejects rather
-- than silently looping. Every query touching business_members (directly,
-- or transitively through businesses/roles/customers/conversations/
-- messages policies that check membership) has been failing since this
-- table was created, silently returning empty results to the app.
--
-- Fix: a SECURITY DEFINER helper function bypasses RLS for its own
-- internal lookup, breaking the cycle while remaining just as secure —
-- it still only checks the caller's own auth.uid(), nothing supplied by
-- the caller can widen what it returns.
-- ============================================================================

create or replace function public.is_business_member(target_business_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.business_members
    where business_id = target_business_id
      and profile_id = auth.uid()
      and is_active = true
  );
$$;

-- ----------------------------------------------------------------------------
-- business_members: replace the recursive policy.
-- ----------------------------------------------------------------------------
drop policy if exists "Members can view their own memberships and teammates" on public.business_members;
create policy "Members can view their own memberships and teammates"
  on public.business_members for select
  using (public.is_business_member(business_id));

-- ----------------------------------------------------------------------------
-- businesses: rewrite to use the helper (was already indirectly recursive
-- through its own subquery hitting business_members' broken policy).
-- ----------------------------------------------------------------------------
drop policy if exists "Members can view their businesses" on public.businesses;
create policy "Members can view their businesses"
  on public.businesses for select
  using (public.is_business_member(id));

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

-- ----------------------------------------------------------------------------
-- roles: rewrite.
-- ----------------------------------------------------------------------------
drop policy if exists "Roles are visible to relevant users" on public.roles;
create policy "Roles are visible to relevant users"
  on public.roles for select
  using (
    is_system_role = true
    or (business_id is not null and public.is_business_member(business_id))
  );

-- ----------------------------------------------------------------------------
-- customers: rewrite.
-- ----------------------------------------------------------------------------
drop policy if exists "Members can view their business's customers" on public.customers;
create policy "Members can view their business's customers"
  on public.customers for select
  using (public.is_business_member(business_id));

drop policy if exists "Members can manage their business's customers" on public.customers;
create policy "Members can manage their business's customers"
  on public.customers for all
  using (public.is_business_member(business_id))
  with check (public.is_business_member(business_id));

-- ----------------------------------------------------------------------------
-- conversations: rewrite.
-- ----------------------------------------------------------------------------
drop policy if exists "Members can view their business's conversations" on public.conversations;
create policy "Members can view their business's conversations"
  on public.conversations for select
  using (public.is_business_member(business_id));

drop policy if exists "Members can manage their business's conversations" on public.conversations;
create policy "Members can manage their business's conversations"
  on public.conversations for all
  using (public.is_business_member(business_id))
  with check (public.is_business_member(business_id));

-- ----------------------------------------------------------------------------
-- messages: rewrite (references conversations, which now uses the safe
-- helper internally, so this no longer chains into the broken policy).
-- ----------------------------------------------------------------------------
drop policy if exists "Members can view messages in their business's conversations" on public.messages;
create policy "Members can view messages in their business's conversations"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and public.is_business_member(c.business_id)
    )
  );

drop policy if exists "Members can send messages in their business's conversations" on public.messages;
create policy "Members can send messages in their business's conversations"
  on public.messages for insert
  with check (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and public.is_business_member(c.business_id)
    )
  );

drop policy if exists "Members can update messages in their business's conversations" on public.messages;
create policy "Members can update messages in their business's conversations"
  on public.messages for update
  using (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and public.is_business_member(c.business_id)
    )
  );
