import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentBusiness } from "@/features/identity/api/get-current-business";
import { getBusinessMembers } from "@/features/settings/api/get-business-members";
import { getPendingInvitations } from "@/features/settings/api/get-invitations";
import { getSystemRoles } from "@/features/settings/api/get-roles";
import { BusinessProfileForm } from "@/features/settings/components/business-profile-form";
import { TeamMembersList } from "@/features/settings/components/team-members-list";
import { PendingInvitationsList } from "@/features/settings/components/pending-invitations-list";
import { InviteTeamForm } from "@/features/settings/components/invite-team-form";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SettingsPage() {
  const currentBusiness = await getCurrentBusiness();
  if (!currentBusiness) redirect("/onboarding");

  const [members, invitations, roles] = await Promise.all([
    getBusinessMembers(),
    getPendingInvitations(),
    getSystemRoles(),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Configuración</h1>
        <p className="text-sm text-muted-foreground">
          Administra el perfil y el equipo de {currentBusiness.business.name}.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Perfil del negocio</CardTitle>
        </CardHeader>
        <CardContent>
          <BusinessProfileForm business={currentBusiness.business} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Equipo</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-0 p-0">
          <div className="p-5">
            <InviteTeamForm roles={roles} />
          </div>
          <TeamMembersList members={members} />
          <PendingInvitationsList invitations={invitations} />
        </CardContent>
      </Card>
    </div>
  );
}
