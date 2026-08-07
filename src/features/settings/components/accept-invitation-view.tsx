"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";
import { AuthShell } from "@/features/identity/components/auth-shell";
import { Button } from "@/components/ui/button";
import { acceptInvitationAction } from "@/features/settings/api/invite-accept-actions";
import type { InvitationPreview } from "@/features/settings/api/invite-accept-actions";

export function AcceptInvitationView({
  token,
  preview,
  isAuthenticated,
}: {
  token: string;
  preview: InvitationPreview;
  isAuthenticated: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);

  if (preview.status !== "pending") {
    return (
      <AuthShell title="Invitación no disponible">
        <p className="text-sm text-muted-foreground">
          Esta invitación ya fue utilizada o ya no es válida. Pide a quien te invitó que envíe una
          nueva.
        </p>
      </AuthShell>
    );
  }

  if (!isAuthenticated) {
    return (
      <AuthShell
        title={`Te invitaron a ${preview.businessName}`}
        subtitle={`Como ${preview.roleName}`}
      >
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            Inicia sesión o crea una cuenta con <strong>{preview.email}</strong>, y vuelve a este
            mismo enlace para aceptar.
          </p>
          <Button asChild>
            <a href="/login">Iniciar sesión</a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/register">Crear cuenta</a>
          </Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title={`Te invitaron a ${preview.businessName}`} subtitle={`Como ${preview.roleName}`}>
      <div className="flex flex-col items-center gap-3 py-2 text-center">
        <div className="flex size-11 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <Users className="size-5" />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button
          className="w-full"
          loading={isPending}
          onClick={() =>
            startTransition(async () => {
              const result = await acceptInvitationAction(token);
              if (result.status === "success") {
                router.push("/dashboard");
                router.refresh();
              } else {
                setError("No se pudo aceptar la invitación. Puede que ya haya expirado.");
              }
            })
          }
        >
          Aceptar invitación
        </Button>
      </div>
    </AuthShell>
  );
}
