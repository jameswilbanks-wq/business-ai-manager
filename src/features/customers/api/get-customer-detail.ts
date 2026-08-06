import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/features/identity/api/get-current-business";
import type { CustomerDetail } from "@/features/customers/types/customer";

export async function getCustomerDetail(customerId: string): Promise<CustomerDetail | null> {
  const currentBusiness = await getCurrentBusiness();
  if (!currentBusiness) return null;

  const supabase = await createClient();

  const { data: customer, error: customerError } = await supabase
    .from("customers")
    .select("*")
    .eq("id", customerId)
    .eq("business_id", currentBusiness.business.id)
    .maybeSingle();

  if (customerError || !customer) return null;

  const { data: orders } = await supabase
    .from("orders")
    .select("id, order_number, status, total, currency, created_at")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  const { data: conversations } = await supabase
    .from("conversations")
    .select("id, status, priority, ai_summary, last_message_at")
    .eq("customer_id", customerId)
    .order("last_message_at", { ascending: false });

  const completedOrders = (orders ?? []).filter((o) =>
    ["paid", "preparing", "ready", "shipped", "delivered", "completed"].includes(o.status)
  );
  const totalSpent = completedOrders.reduce((sum, o) => sum + o.total, 0);

  return {
    id: customer.id,
    name: customer.name,
    phone: customer.phone,
    email: customer.email,
    avatarUrl: customer.avatar_url,
    tags: customer.tags,
    isVip: customer.is_vip,
    notes: customer.notes,
    createdAt: customer.created_at,
    orders: (orders ?? []).map((o) => ({
      id: o.id,
      orderNumber: o.order_number,
      status: o.status as CustomerDetail["orders"][number]["status"],
      total: o.total,
      currency: o.currency,
      createdAt: o.created_at,
    })),
    conversations: (conversations ?? []).map((c) => ({
      id: c.id,
      status: c.status as CustomerDetail["conversations"][number]["status"],
      priority: c.priority as CustomerDetail["conversations"][number]["priority"],
      aiSummary: c.ai_summary,
      lastMessageAt: c.last_message_at,
    })),
    totalSpent,
    currency: completedOrders[0]?.currency ?? "COP",
  };
}
