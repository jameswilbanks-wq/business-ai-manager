"use client";

import * as React from "react";
import { useActionState } from "react";
import { UserPlus } from "lucide-react";
import { inviteTeamMemberAction } from "@/features/settings/api/team-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FieldError } from "@/features/identity/components/field-error";
import type { RoleOption } from "@/features/settings/api/get-roles";

export function InviteTeamForm({ roles }: { roles: RoleOption[] }) {
  const [state, formAction, isPending] = useActionState(inviteTeamMemberAction, null);
  const [roleId, setRoleId] = React.useState(roles[0]?.id ?? "");

  return (
    <form action={formAction} className="flex flex-col gap-3 sm:flex-row sm:items-start">
      <div className="flex-1">
        <Input name="email" type="email" placeholder="correo@ejemplo.com" required />
      </div>
      <Select value={roleId} onValueChange={setRoleId}>
        <SelectTrigger className="sm:w-40">
          <SelectValue placeholder="Rol" />
        </SelectTrigger>
        <SelectContent>
          {roles.map((r) => (
            <SelectItem key={r.id} value={r.id}>
              {r.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <input type="hidden" name="roleId" value={roleId} />
      <Button type="submit" loading={isPending} disabled={!roleId} className="shrink-0">
        <UserPlus /> Invitar
      </Button>
      {state?.status === "error" && (
        <div className="w-full">
          <FieldError errorKey={state.message} />
        </div>
      )}
      {state?.status === "success" && (
        <p className="w-full text-sm text-success-foreground">Invitación enviada.</p>
      )}
    </form>
  );
}
