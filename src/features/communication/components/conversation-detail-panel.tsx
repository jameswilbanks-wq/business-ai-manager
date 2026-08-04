"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Phone, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useLocale } from "@/providers/locale-provider";
import { MessageBubble } from "@/features/communication/components/message-bubble";
import { AiDraftCard } from "@/features/communication/components/ai-draft-card";
import { MessageComposer } from "@/features/communication/components/message-composer";
import {
  ConversationPriorityBadge,
  ConversationStatusBadge,
} from "@/features/communication/components/conversation-badges";
import type { ConversationDetail } from "@/features/communication/types/conversation";

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}

export function ConversationDetailPanel({ conversation }: { conversation: ConversationDetail }) {
  const { locale } = useLocale();
  const latestDraft = [...conversation.messages]
    .reverse()
    .find((m) => m.senderType === "ai" && m.aiStatus === "draft");

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-border p-3">
        <Link href="/communication" className="md:hidden">
          <Button variant="ghost" size="icon">
            <ArrowLeft />
          </Button>
        </Link>
        <Avatar className="size-9">
          <AvatarFallback>{initials(conversation.customer.name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{conversation.customer.name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {conversation.customer.phone}
          </p>
        </div>
        <div className="hidden items-center gap-1.5 sm:flex">
          <ConversationStatusBadge status={conversation.status} />
          <ConversationPriorityBadge priority={conversation.priority} />
          {conversation.customer.isVip && <Badge variant="secondary">VIP</Badge>}
        </div>
        {conversation.customer.phone && (
          <Button variant="outline" size="icon" asChild>
            <a href={`tel:${conversation.customer.phone}`}>
              <Phone />
            </a>
          </Button>
        )}
      </div>

      {conversation.aiSummary && (
        <div className="flex items-start gap-2 border-b border-border bg-accent/40 px-4 py-2.5 text-xs">
          <Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />
          <p className="text-accent-foreground">{conversation.aiSummary}</p>
        </div>
      )}

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {conversation.messages
          .filter((m) => !(m.senderType === "ai" && m.aiStatus === "draft"))
          .map((m) => (
            <MessageBubble key={m.id} message={m} locale={locale} />
          ))}
      </div>

      {latestDraft && (
        <>
          <Separator />
          <div className="p-3">
            <AiDraftCard draft={latestDraft} />
          </div>
        </>
      )}

      <MessageComposer conversationId={conversation.id} />
    </div>
  );
}
