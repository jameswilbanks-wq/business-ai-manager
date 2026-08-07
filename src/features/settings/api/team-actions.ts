"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/features/identity/api/get-current-business";
import { getCurrentUser } from "@/features/identity/api/get-current-user";
import { sendInviteEmail } from "@/lib/email/send-invite-email";
import type { AuthActionResult } from "@/features/identity/types/auth";

function inviteAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export async function inviteTeamMemberAction(
  _prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const roleId = String(formData.get("roleId") ?? "");

  if (!email || !email.includes("@") || !roleId) {
    return { status: "error", message: "invalid_invite" };
  }

  const currentBusiness = await getCurrentBusiness();
  const user = await getCurrentUser();
  if (!currentBusiness || !user) {
    return { status: "error", message: "not_found" };
  }

  const supabase = await createClient();
  const { data: invitation, error } = await supabase
    .from("invitations")
    .insert({
      business_id: currentBusiness.business.id,
      email,
      role_id: roleId,
      invited_by: user.id,
    })
    .select("token")
    .single();

  if (error || !invitation) {
    return { status: "error", message: "invite_failed" };
  }

  const inviteUrl = `${inviteAppUrl()}/invite/${invitation.token}`;
  await sendInviteEmail({
    to: email,
    businessName: currentBusiness.business.name,
    inviterName: user.profile?.displayName ?? "Un compañero de equipo",
    inviteUrl,
  });

  revalidatePath("/settings");
  return { status: "success" };
}

export async function revokeInvitationAction(invitationId: string) {
  const supabase = await createClient();
  await supabase.from("invitations").update({ status: "revoked" }).eq("id", invitationId);
  revalidatePath("/settings");
}

export async function removeMemberAction(memberId: string) {
  const supabase = await createClient();
  await supabase.from("business_members").update({ is_active: false }).eq("id", memberId);
  revalidatePath("/settings");
}
