import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/features/identity/api/get-current-business";

export interface AnalyticsData {
  totalRevenue: number;
  currency: string;
  averageOrderValue: number;
  totalOrders: number;
  activeCustomers: number;
  ordersByStatus: { status: string; count: number }[];
  topProducts: { name: string; revenue: number; unitsSold: number }[];
  conversationsByStatus: { status: string; count: number }[];
  aiDraftStats: { total: number; approved: number; rejected: number; pending: number };
  tasksByStatus: { status: string; count: number }[];
}

const REVENUE_STATUSES = ["paid", "preparing", "ready", "shipped", "delivered", "completed"];

export async function getAnalytics(): Promise<AnalyticsData | null> {
  const currentBusiness = await getCurrentBusiness();
  if (!currentBusiness) return null;

  const supabase = await createClient();
  const businessId = currentBusiness.business.id;

  const [ordersRes, itemsRes, conversationsRes, messagesRes, tasksRes, customersRes] =
    await Promise.all([
      supabase.from("orders").select("status, total, currency, customer_id").eq("business_id", businessId),
      supabase
        .from("order_items")
        .select("product_name, quantity, line_total, orders!inner(business_id, status)")
        .eq("orders.business_id", businessId),
      supabase.from("conversations").select("status").eq("business_id", businessId),
      supabase
        .from("messages")
        .select("ai_status, conversation_id, conversations!inner(business_id)")
        .eq("conversations.business_id", businessId)
        .not("ai_status", "is", null),
      supabase.from("tasks").select("status").eq("business_id", businessId),
      supabase.from("customers").select("id").eq("business_id", businessId),
    ]);

  const orders = ordersRes.data ?? [];
  const revenueOrders = orders.filter((o) => REVENUE_STATUSES.includes(o.status));
  const totalRevenue = revenueOrders.reduce((sum, o) => sum + o.total, 0);
  const currency = orders[0]?.currency ?? "COP";

  const statusCounts = new Map<string, number>();
  for (const o of orders) statusCounts.set(o.status, (statusCounts.get(o.status) ?? 0) + 1);

  const items = (itemsRes.data ?? []) as unknown as {
    product_name: string;
    quantity: number;
    line_total: number;
    orders: { status: string } | null;
  }[];
  const productMap = new Map<string, { revenue: number; unitsSold: number }>();
  for (const item of items) {
    if (!item.orders || !REVENUE_STATUSES.includes(item.orders.status)) continue;
    const existing = productMap.get(item.product_name) ?? { revenue: 0, unitsSold: 0 };
    existing.revenue += item.line_total;
    existing.unitsSold += item.quantity;
    productMap.set(item.product_name, existing);
  }
  const topProducts = Array.from(productMap.entries())
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const conversations = conversationsRes.data ?? [];
  const convoStatusCounts = new Map<string, number>();
  for (const c of conversations) convoStatusCounts.set(c.status, (convoStatusCounts.get(c.status) ?? 0) + 1);

  const aiMessages = messagesRes.data ?? [];
  const aiDraftStats = {
    total: aiMessages.length,
    approved: aiMessages.filter((m) => m.ai_status === "approved").length,
    rejected: aiMessages.filter((m) => m.ai_status === "rejected").length,
    pending: aiMessages.filter((m) => m.ai_status === "draft").length,
  };

  const tasks = tasksRes.data ?? [];
  const taskStatusCounts = new Map<string, number>();
  for (const t of tasks) taskStatusCounts.set(t.status, (taskStatusCounts.get(t.status) ?? 0) + 1);

  return {
    totalRevenue,
    currency,
    averageOrderValue: revenueOrders.length > 0 ? totalRevenue / revenueOrders.length : 0,
    totalOrders: orders.length,
    activeCustomers: customersRes.data?.length ?? 0,
    ordersByStatus: Array.from(statusCounts.entries()).map(([status, count]) => ({ status, count })),
    topProducts,
    conversationsByStatus: Array.from(convoStatusCounts.entries()).map(([status, count]) => ({
      status,
      count,
    })),
    aiDraftStats,
    tasksByStatus: Array.from(taskStatusCounts.entries()).map(([status, count]) => ({ status, count })),
  };
}
