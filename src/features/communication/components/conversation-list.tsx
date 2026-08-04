"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/empty-state";
import { Search, Inbox } from "lucide-react";
import { useLocale } from "@/providers/locale-provider";
import { ConversationListItemCard } from "@/features/communication/components/conversation-list-item";
import type { ConversationListItem } from "@/features/communication/types/conversation";
import { cn } from "@/lib/utils";

type FilterKey = "all" | "unread" | "urgent" | "vip";

export function ConversationList({
  conversations,
  selectedId,
  className,
}: {
  conversations: ConversationListItem[];
  selectedId?: string;
  className?: string;
}) {
  const { locale } = useLocale();
  const [filter, setFilter] = React.useState<FilterKey>("all");
  const [query, setQuery] = React.useState("");

  const filtered = conversations.filter((c) => {
    if (filter === "unread" && c.unreadCount === 0) return false;
    if (filter === "urgent" && c.priority !== "urgent") return false;
    if (filter === "vip" && !c.customer.isVip) return false;
    if (query && !c.customer.name.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  return (
    <div className={cn("flex h-full flex-col", className)}>
      <div className="flex flex-col gap-2 border-b border-border p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar cliente…"
            className="pl-8"
          />
        </div>
        <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterKey)}>
          <TabsList className="w-full">
            <TabsTrigger value="all" className="flex-1">
              Todas
            </TabsTrigger>
            <TabsTrigger value="unread" className="flex-1">
              No leídas
            </TabsTrigger>
            <TabsTrigger value="urgent" className="flex-1">
              Urgentes
            </TabsTrigger>
            <TabsTrigger value="vip" className="flex-1">
              VIP
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Inbox />}
            title="No hay conversaciones"
            description="Ninguna conversación coincide con este filtro."
            className="mx-3 mt-4 border-none"
          />
        ) : (
          filtered.map((c) => (
            <ConversationListItemCard
              key={c.id}
              conversation={c}
              active={c.id === selectedId}
              locale={locale}
            />
          ))
        )}
      </div>
    </div>
  );
}
