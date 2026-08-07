import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/features/identity/api/get-current-business";

export interface InvitationItem {
  id: string;
  email: string;
  roleName: string;
  status: string;
  createdAt: string;
  expiresAt: string;
}

export async function getPendingInvitations(): Promise<InvitationItem[]> {
  const currentBusiness = await getCurrentBusiness();
  if (!currentBusiness) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("invitations")
    .select("id, email, status, created_at, expires_at, roles ( name )")
    .eq("business_id", currentBusiness.business.id)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    email: row.email,
    roleName: (row.roles as unknown as { name: string } | null)?.name ?? "Miembro",
    status: row.status,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
  }));
}
