import "server-only";
import { cookies } from "next/headers";
import { currentBusinessCookieName } from "@/lib/business-context";
import { getUserBusinesses } from "@/features/identity/api/get-user-businesses";
import type { BusinessMembership } from "@/features/identity/types/business";

/**
 * Resolves which business the current request should be scoped to.
 * RLS only guarantees "a business this person belongs to" — it has no
 * concept of "the one currently selected in the switcher" — so every
 * feature query needs this to filter explicitly by business_id.
 */
export async function getCurrentBusiness(): Promise<BusinessMembership | null> {
  const memberships = await getUserBusinesses();
  if (memberships.length === 0) return null;

  const cookieStore = await cookies();
  const currentId = cookieStore.get(currentBusinessCookieName)?.value;

  return memberships.find((m) => m.business.id === currentId) ?? memberships[0];
}
