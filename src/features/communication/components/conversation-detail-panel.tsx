"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Package, Phone, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useLocale } from "@/providers/locale-provider";
import { MessageBubble } from "@/features/communication/components/message-bubble";
import { AiDraftCard } from "@/features/communication/components/ai-draft-card";
import { AiOrderSuggestionCard } from "@/features/communication/components/ai-order-suggestion-card";
import { ConversationStatusControls } from "@/features/communication/components/conversation-status-controls";
import { MessageComposer } from "@/features/communication/components/message-composer";
import {
  generateAiReplyAction,
  generateAiOrderSuggestionAction,
} from "@/features/communication/api/conversation-actions";
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
  const router = useRouter();
  const [isGenerating, startGenerating] = React.useTransition();
  const [isExtractingOrder, startExtractingOrder] = React.useTransition();
  const latestDraft = [...conversation.messages]
    .reverse()
    .find((m) => m.senderType === "ai" && m.aiStatus === "draft");

  function generateReply() {
    startGenerating(async () => {
      const result = await generateAiReplyAction(conversation.id);
      if (result.status === "error") {
        toast.error(
          result.message === "ai_not_configured"
            ? "La IA en tiempo real no está configurada — falta la clave de API de Anthropic."
            : `No se pudo generar una respuesta con IA.${result.detail ? " " + result.detail : " Intenta de nuevo."}`
        );
      }
    });
  }

  function generateOrderSuggestion() {
    startExtractingOrder(async () => {
      const result = await generateAiOrderSuggestionAction(conversation.id);
      if (result.status === "success") {
        toast.success("IA propuso un pedido a partir de esta conversación.");
        router.refresh();
      } else if (result.status === "no_opportunity") {
        toast.info(`IA no encontró una oportunidad de pedido clara: ${result.reasoning}`);
      } else {
        toast.error(
          result.message === "ai_not_configured"
            ? "La IA en tiempo real no está configurada — falta la clave de API de Anthropic."
            : `No se pudo analizar la conversación.${result.detail ? " " + result.detail : ""}`
        );
      }
    });
  }

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

      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-2">
        <div className="flex items-center gap-1.5 sm:hidden">
          <ConversationStatusBadge status={conversation.status} />
          <ConversationPriorityBadge priority={conversation.priority} />
        </div>
        <ConversationStatusControls conversationId={conversation.id} status={conversation.status} />
      </div>

      {conversation.aiSummary && (
        <div className="flex items-start gap-2 border-b border-border bg-accent/40 px-4 py-2.5 text-xs">
          <Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />
          <p className="text-accent-foreground">{conversation.aiSummary}</p>
        </div>
      )}

      {conversation.linkedOrder ? (
        <div className="border-b border-border p-3">
          <AiOrderSuggestionCard order={conversation.linkedOrder} conversationId={conversation.id} />
        </div>
      ) : (
        <div className="border-b border-border p-3">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            disabled={isExtractingOrder}
            loading={isExtractingOrder}
            onClick={generateOrderSuggestion}
          >
            <Package /> Analizar conversación y proponer pedido
          </Button>
        </div>
      )}

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {conversation.messages
          .filter((m) => !(m.senderType === "ai" && m.aiStatus === "draft"))
          .map((m) => (
            <MessageBubble key={m.id} message={m} locale={locale} />
          ))}
      </div>

      {latestDraft ? (
        <>
          <Separator />
          <div className="p-3">
            <AiDraftCard draft={latestDraft} />
          </div>
        </>
      ) : (
        conversation.status !== "resolved" && (
          <div className="border-t border-border p-3">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              disabled={isGenerating}
              loading={isGenerating}
              onClick={generateReply}
            >
              <Sparkles /> Generar respuesta con IA
            </Button>
          </div>
        )
      )}

      <MessageComposer conversationId={conversation.id} />
    </div>
  );
}
