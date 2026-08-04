"use client";

import * as React from "react";
import Link from "next/link";
import { Check, Package, Pencil, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  approveOrderDraftAction,
  rejectOrderDraftAction,
} from "@/features/orders/api/order-actions";
import { formatCurrency } from "@/features/orders/components/format-currency";
import type { LinkedOrderSummary } from "@/features/communication/types/conversation";

/**
 * "AI should try to create it and then the user approves or modifies or
 * follows up or cancels" — this is that workflow. The order itself was
 * already proposed (linkedOrder, seeded to represent what AI extracted
 * from the conversation); this card makes acting on it real.
 */
export function AiOrderSuggestionCard({
  order,
  conversationId,
}: {
  order: LinkedOrderSummary;
  conversationId: string;
}) {
  const [isPending, startTransition] = React.useTransition();

  if (order.status !== "draft") {
    // Already approved/rejected/progressed — show a quiet reference
    // instead of the action card.
    return (
      <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
        <Package className="size-3.5 shrink-0" />
        <span className="flex-1">
          Pedido {order.orderNumber} — {order.itemsSummary}
        </span>
        <Link href={`/orders/${order.id}`} className="font-medium text-primary hover:underline">
          Ver pedido
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4">
      <div className="mb-2 flex items-center gap-1.5 text-sm font-medium text-primary">
        <Sparkles className="size-4" />
        {order.aiGenerated ? "Pedido sugerido por IA" : "Pedido en borrador"}
      </div>

      <p className="mb-1 text-sm font-medium text-foreground">{order.orderNumber}</p>
      <p className="mb-3 text-sm text-muted-foreground">{order.itemsSummary}</p>
      <p className="mb-3 text-base font-semibold">
        {formatCurrency(order.total, order.currency)}
      </p>

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await approveOrderDraftAction(order.id, conversationId);
            })
          }
        >
          <Check /> Aprobar
        </Button>
        <Button size="sm" variant="outline" asChild>
          <Link href={`/orders/${order.id}`}>
            <Pencil /> Modificar
          </Link>
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="text-destructive hover:text-destructive"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await rejectOrderDraftAction(order.id, conversationId);
            })
          }
        >
          <X /> Rechazar
        </Button>
      </div>
    </div>
  );
}
