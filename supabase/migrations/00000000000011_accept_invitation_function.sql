-- ============================================================================
-- Accepting an invitation is the same chicken-and-egg problem as creating a
-- business: the invited person isn't a business member yet, so normal RLS
-- blocks them from even reading the invitation to see what they're being
-- invited to. SECURITY DEFINER functions solve it the same way
-- create_business_with_owner does — possession of the token itself is the
-- authorization, not existing membership.
-- ============================================================================

create or replace function public.get_invitation_by_token(invite_token uuid)
returns table (
  business_name text,
  role_name text,
  email text,
  status text,
  expires_at timestamptz
)
language sql
security definer set search_path = public
stable
as $$
  select b.name, r.name, i.email, i.status, i.expires_at
  from public.invitations i
  join public.businesses b on b.id = i.business_id
  join public.roles r on r.id = i.role_id
  where i.token = invite_token;
$$;

create or replace function public.accept_invitation(invite_token uuid)
returns uuid  -- returns the business_id joined, or raises on failure
language plpgsql
security definer set search_path = public
as $$
declare
  inv record;
  caller_id uuid := auth.uid();
begin
  if caller_id is null then
    raise exception 'Not authenticated';
  end if;

  select * into inv from public.invitations where token = invite_token;

  if inv is null then
    raise exception 'Invitation not found';
  end if;
  if inv.status <> 'pending' then
    raise exception 'Invitation is no longer valid';
  end if;
  if inv.expires_at < now() then
    update public.invitations set status = 'expired' where id = inv.id;
    raise exception 'Invitation has expired';
  end if;

  insert into public.business_members (business_id, profile_id, role_id, is_owner)
  values (inv.business_id, caller_id, inv.role_id, false)
  on conflict (business_id, profile_id) do update set is_active = true, role_id = excluded.role_id;

  update public.invitations set status = 'accepted', accepted_at = now() where id = inv.id;

  return inv.business_id;
end;
$$;
