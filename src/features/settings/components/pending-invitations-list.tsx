"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { revokeInvitationAction } from "@/features/settings/api/team-actions";
import type { InvitationItem } from "@/features/settings/api/get-invitations";

export function PendingInvitationsList({ invitations }: { invitations: InvitationItem[] }) {
  const [isPending, startTransition] = React.useTransition();

  if (invitations.length === 0) return null;

  return (
    <div className="border-t border-border">
      <p className="px-5 pt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Invitaciones pendientes
      </p>
      {invitations.map((inv) => (
        <div key={inv.id} className="flex items-center gap-3 px-5 py-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{inv.email}</p>
            <p className="text-xs text-muted-foreground">Invitado como {inv.roleName}</p>
          </div>
          <Badge variant="outline">Pendiente</Badge>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            disabled={isPending}
            onClick={() => startTransition(async () => revokeInvitationAction(inv.id))}
          >
            <X className="size-3.5" />
          </Button>
        </div>
      ))}
    </div>
  );
}
