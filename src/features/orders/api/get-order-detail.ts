import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/features/identity/api/get-current-business";
import type { OrderDetail, OrderItem } from "@/features/orders/types/order";

export async function getOrderDetail(orderId: string): Promise<OrderDetail | null> {
  const currentBusiness = await getCurrentBusiness();
  if (!currentBusiness) return null;

  const supabase = await createClient();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select(
      `
      id, order_number, status, currency, total, subtotal, discount, notes,
      delivery_address, delivery_date, paid_at, delivered_at, created_at,
      conversation_id,
      customers ( id, name, is_vip )
    `
    )
    .eq("id", orderId)
    .eq("business_id", currentBusiness.business.id)
    .maybeSingle();

  if (orderError || !order) return null;

  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", orderId)
    .order("sort_order", { ascending: true });

  if (itemsError || !items) return null;

  const customer = order.customers as unknown as {
    id: string;
    name: string;
    is_vip: boolean;
  } | null;

  const mappedItems: OrderItem[] = items.map((i) => ({
    id: i.id,
    productName: i.product_name,
    description: i.description,
    quantity: i.quantity,
    unitPrice: i.unit_price,
    lineTotal: i.line_total,
  }));

  return {
    id: order.id,
    orderNumber: order.order_number,
    status: order.status as OrderDetail["status"],
    currency: order.currency,
    total: order.total,
    subtotal: order.subtotal,
    discount: order.discount,
    notes: order.notes,
    deliveryAddress: order.delivery_address,
    deliveryDate: order.delivery_date,
    paidAt: order.paid_at,
    deliveredAt: order.delivered_at,
    conversationId: order.conversation_id,
    createdAt: order.created_at,
    customer: {
      id: customer?.id ?? "",
      name: customer?.name ?? "Cliente",
      isVip: customer?.is_vip ?? false,
    },
    items: mappedItems,
  };
}
