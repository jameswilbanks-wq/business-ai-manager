import type { OrderStatus } from "@/features/orders/types/order";

/**
 * The order lifecycle as an actual state machine, not just a label. Each
 * entry defines the button(s) shown for that status: the status it moves
 * to, a localized label, and whether it's the "primary" (forward-moving)
 * action or a secondary one (e.g. cancel).
 */
export interface StatusAction {
  toStatus: OrderStatus;
  labelEs: string;
  variant: "default" | "outline" | "destructive";
}

export const orderStatusActions: Record<OrderStatus, StatusAction[]> = {
  draft: [
    { toStatus: "awaiting_payment", labelEs: "Confirmar y enviar", variant: "default" },
    { toStatus: "cancelled", labelEs: "Cancelar", variant: "destructive" },
  ],
  awaiting_payment: [
    { toStatus: "paid", labelEs: "Marcar como pagado", variant: "default" },
    { toStatus: "cancelled", labelEs: "Cancelar", variant: "destructive" },
  ],
  paid: [
    { toStatus: "preparing", labelEs: "Iniciar preparación", variant: "default" },
    { toStatus: "cancelled", labelEs: "Cancelar", variant: "destructive" },
  ],
  preparing: [
    { toStatus: "ready", labelEs: "Marcar como listo", variant: "default" },
    { toStatus: "cancelled", labelEs: "Cancelar", variant: "destructive" },
  ],
  ready: [
    { toStatus: "shipped", labelEs: "Marcar como enviado", variant: "default" },
    { toStatus: "cancelled", labelEs: "Cancelar", variant: "destructive" },
  ],
  shipped: [{ toStatus: "delivered", labelEs: "Marcar como entregado", variant: "default" }],
  delivered: [{ toStatus: "completed", labelEs: "Marcar como completado", variant: "default" }],
  completed: [],
  cancelled: [],
};
