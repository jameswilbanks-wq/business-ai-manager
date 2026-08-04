import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EmptyState } from "@/components/shared/empty-state";
import { CheckCircle2 } from "lucide-react";
import {
  ConversationPriorityBadge,
} from "@/features/communication/components/conversation-badges";
import type { ConversationListItem } from "@/features/communication/types/conversation";

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}

export function NeedsAttentionList({
  conversations,
  title,
  emptyTitle,
  emptyDescription,
}: {
  conversations: ConversationListItem[];
  title: string;
  emptyTitle: string;
  emptyDescription: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {conversations.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={<CheckCircle2 />}
              title={emptyTitle}
              description={emptyDescription}
              className="border-none py-6"
            />
          </div>
        ) : (
          <div className="divide-y divide-border">
            {conversations.map((c) => (
              <Link
                key={c.id}
                href={`/communication?id=${c.id}`}
                className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-accent/50"
              >
                <Avatar className="size-8">
                  <AvatarFallback className="text-xs">{initials(c.customer.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{c.customer.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{c.aiSummary}</p>
                </div>
                <ConversationPriorityBadge priority={c.priority} />
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
