"use server";

import { createClient } from "@/lib/supabase/server";

export interface InvitationPreview {
  businessName: string;
  roleName: string;
  email: string;
  status: string;
  expiresAt: string;
}

export async function getInvitationPreview(token: string): Promise<InvitationPreview | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_invitation_by_token", { invite_token: token });

  if (error || !data || data.length === 0) return null;
  const row = data[0];
  return {
    businessName: row.business_name,
    roleName: row.role_name,
    email: row.email,
    status: row.status,
    expiresAt: row.expires_at,
  };
}

export async function acceptInvitationAction(
  token: string
): Promise<{ status: "success"; businessId: string } | { status: "error"; message: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("accept_invitation", { invite_token: token });

  if (error || !data) {
    return { status: "error", message: error?.message ?? "invite_failed" };
  }

  return { status: "success", businessId: data };
}
