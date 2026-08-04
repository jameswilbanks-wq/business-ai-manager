import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/features/identity/api/get-current-business";
import type { OrderListItem } from "@/features/orders/types/order";

interface OrderRow {
  id: string;
  order_number: string;
  status: string;
  currency: string;
  total: number;
  delivery_date: string | null;
  created_at: string;
  customers: { id: string; name: string; is_vip: boolean } | null;
}

function mapRow(row: OrderRow): OrderListItem {
  return {
    id: row.id,
    orderNumber: row.order_number,
    status: row.status as OrderListItem["status"],
    currency: row.currency,
    total: row.total,
    deliveryDate: row.delivery_date,
    createdAt: row.created_at,
    customer: {
      id: row.customers?.id ?? "",
      name: row.customers?.name ?? "Cliente",
      isVip: row.customers?.is_vip ?? false,
    },
  };
}

export async function getOrders(): Promise<OrderListItem[]> {
  const currentBusiness = await getCurrentBusiness();
  if (!currentBusiness) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      id, order_number, status, currency, total, delivery_date, created_at,
      customers ( id, name, is_vip )
    `
    )
    .eq("business_id", currentBusiness.business.id)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return (data as unknown as OrderRow[]).map(mapRow);
}
