"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { updateOrderStatusAction } from "@/features/orders/api/order-actions";
import { orderStatusActions } from "@/features/orders/lib/status-transitions";
import type { OrderStatus } from "@/features/orders/types/order";

export function OrderStatusActions({
  orderId,
  status,
}: {
  orderId: string;
  status: OrderStatus;
}) {
  const [isPending, startTransition] = React.useTransition();
  const actions = orderStatusActions[status];

  if (actions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        {status === "completed" ? "Este pedido está completado." : "Este pedido está cancelado."}
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => (
        <Button
          key={action.toStatus}
          size="sm"
          variant={action.variant}
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await updateOrderStatusAction(orderId, action.toStatus);
            })
          }
        >
          {action.labelEs}
        </Button>
      ))}
    </div>
  );
}
