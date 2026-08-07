import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import type { BusinessMemberItem } from "@/features/settings/api/get-business-members";

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}

export function TeamMembersList({ members }: { members: BusinessMemberItem[] }) {
  if (members.length === 0) {
    return <EmptyState icon={<Users />} title="Sin miembros" className="border-none py-6" />;
  }

  return (
    <div className="divide-y divide-border">
      {members.map((m) => (
        <div key={m.id} className="flex items-center gap-3 px-5 py-3">
          <Avatar className="size-8">
            <AvatarFallback className="text-xs">{initials(m.displayName)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{m.displayName}</p>
            <p className="text-xs text-muted-foreground">
              Desde {format(new Date(m.joinedAt), "MMMM yyyy", { locale: es })}
            </p>
          </div>
          <Badge variant={m.isOwner ? "default" : "secondary"}>{m.roleName}</Badge>
        </div>
      ))}
    </div>
  );
}
