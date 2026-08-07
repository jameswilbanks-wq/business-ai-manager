import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/features/identity/api/get-current-business";

export interface BusinessMemberItem {
  id: string;
  displayName: string;
  email: string | null;
  roleName: string;
  isOwner: boolean;
  joinedAt: string;
}

export async function getBusinessMembers(): Promise<BusinessMemberItem[]> {
  const currentBusiness = await getCurrentBusiness();
  if (!currentBusiness) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("business_members")
    .select(
      `
      id, is_owner, joined_at,
      roles ( name ),
      profiles ( display_name, first_name, last_name )
    `
    )
    .eq("business_id", currentBusiness.business.id)
    .eq("is_active", true)
    .order("joined_at", { ascending: true });

  if (error || !data) return [];

  return data.map((row) => {
    const profile = row.profiles as unknown as {
      display_name: string | null;
      first_name: string | null;
      last_name: string | null;
    } | null;
    const role = row.roles as unknown as { name: string } | null;

    return {
      id: row.id,
      displayName:
        profile?.display_name ??
        [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ??
        "Miembro",
      email: null,
      roleName: role?.name ?? "Miembro",
      isOwner: row.is_owner,
      joinedAt: row.joined_at,
    };
  });
}
