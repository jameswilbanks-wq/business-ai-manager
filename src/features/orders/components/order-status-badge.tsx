import { StatusBadge, type StatusTone } from "@/components/shared/status-badge";
import type { OrderStatus } from "@/features/orders/types/order";

const tone: Record<OrderStatus, StatusTone> = {
  draft: "neutral",
  awaiting_payment: "warning",
  paid: "info",
  preparing: "info",
  ready: "info",
  shipped: "info",
  delivered: "success",
  completed: "success",
  cancelled: "danger",
};

const labelEs: Record<OrderStatus, string> = {
  draft: "Borrador",
  awaiting_payment: "Esperando pago",
  paid: "Pagado",
  preparing: "Preparando",
  ready: "Listo",
  shipped: "Enviado",
  delivered: "Entregado",
  completed: "Completado",
  cancelled: "Cancelado",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <StatusBadge tone={tone[status]} label={labelEs[status]} />;
}
