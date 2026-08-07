import { getInvitationPreview } from "@/features/settings/api/invite-accept-actions";
import { getCurrentUser } from "@/features/identity/api/get-current-user";
import { AcceptInvitationView } from "@/features/settings/components/accept-invitation-view";
import { AuthShell } from "@/features/identity/components/auth-shell";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const [preview, user] = await Promise.all([getInvitationPreview(token), getCurrentUser()]);

  if (!preview) {
    return (
      <AuthShell title="Invitación no encontrada">
        <p className="text-sm text-muted-foreground">
          Este enlace de invitación no es válido. Verifica que lo copiaste completo.
        </p>
      </AuthShell>
    );
  }

  return <AcceptInvitationView token={token} preview={preview} isAuthenticated={!!user} />;
}
