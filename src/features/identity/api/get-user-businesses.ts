import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Business, BusinessMembership } from "@/features/identity/types/business";

function mapBusiness(row: {
  id: string;
  name: string;
  legal_name: string | null;
  slug: string;
  logo_url: string | null;
  default_language: "es" | "en";
  currency: string;
  timezone: string;
  country: string | null;
  subscription_plan: string;
  subscription_status: string;
  created_at: string;
  updated_at: string;
}): Business {
  return {
    id: row.id,
    name: row.name,
    legalName: row.legal_name,
    slug: row.slug,
    logoUrl: row.logo_url,
    defaultLanguage: row.default_language,
    currency: row.currency,
    timezone: row.timezone,
    country: row.country,
    subscriptionPlan: row.subscription_plan,
    subscriptionStatus: row.subscription_status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Every business the current session's user belongs to, with their role in
 * each. RLS (business_members select policy) already scopes this to the
 * caller — no explicit .eq("profile_id", ...) needed, but we still filter
 * defensively since Supabase's typed client can't express "this query is
 * already RLS-scoped" at the type level.
 */
export async function getUserBusinesses(): Promise<BusinessMembership[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("business_members")
    .select(
      `
      is_owner,
      roles ( name ),
      businesses ( * )
    `
    )
    .eq("profile_id", user.id)
    .eq("is_active", true);

  if (error || !data) return [];

  return data
    .filter((row): row is typeof row & { businesses: NonNullable<typeof row.businesses> } => !!row.businesses)
    .map((row) => ({
      business: mapBusiness(row.businesses as unknown as Parameters<typeof mapBusiness>[0]),
      roleName: (row.roles as unknown as { name: string } | null)?.name ?? "Member",
      isOwner: row.is_owner,
    }));
}
