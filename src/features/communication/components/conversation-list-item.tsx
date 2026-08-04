import Link from "next/link";
import { formatDistanceToNowStrict } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { Sparkles } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ConversationListItem as ConversationListItemType } from "@/features/communication/types/conversation";
import {
  ConversationPriorityBadge,
} from "@/features/communication/components/conversation-badges";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function ConversationListItemCard({
  conversation,
  active,
  locale,
}: {
  conversation: ConversationListItemType;
  active: boolean;
  locale: "es" | "en";
}) {
  const unread = conversation.unreadCount > 0;

  return (
    <Link
      href={`/communication/${conversation.id}`}
      className={cn(
        "flex items-start gap-3 border-b border-border px-4 py-3 transition-colors hover:bg-accent/50",
        active && "bg-accent"
      )}
    >
      <Avatar className="mt-0.5 size-10">
        <AvatarFallback className={conversation.customer.isVip ? "bg-primary/15 text-primary" : undefined}>
          {initials(conversation.customer.name)}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className={cn("truncate text-sm", unread ? "font-semibold" : "font-medium")}>
            {conversation.customer.name}
          </span>
          <span className="shrink-0 text-xs text-muted-foreground">
            {formatDistanceToNowStrict(new Date(conversation.lastMessageAt), {
              locale: locale === "es" ? es : enUS,
              addSuffix: false,
            })}
          </span>
        </div>

        <p className={cn("mt-0.5 truncate text-xs", unread ? "text-foreground" : "text-muted-foreground")}>
          {conversation.aiSummary ?? "—"}
        </p>

        <div className="mt-1.5 flex flex-wrap items-center gap-1">
          <ConversationPriorityBadge priority={conversation.priority} />
          {conversation.customer.isVip && <Badge variant="secondary">VIP</Badge>}
          {conversation.hasAiDraft && (
            <Badge variant="outline" className="gap-1 text-primary">
              <Sparkles className="size-3" /> IA
            </Badge>
          )}
          {unread && (
            <span className="ml-auto flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
              {conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
