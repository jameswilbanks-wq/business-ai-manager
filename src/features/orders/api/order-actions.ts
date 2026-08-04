"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";
import type { OrderStatus } from "@/features/orders/types/order";

type OrderUpdate = Database["public"]["Tables"]["orders"]["Update"];

/**
 * The single place an order's status ever changes. Sets paid_at/
 * delivered_at automatically when the status crosses those milestones —
 * callers never set those timestamps directly, so they can't drift out of
 * sync with the status itself.
 */
export async function updateOrderStatusAction(orderId: string, toStatus: OrderStatus) {
  const supabase = await createClient();

  const patch: OrderUpdate = { status: toStatus };
  if (toStatus === "paid") patch.paid_at = new Date().toISOString();
  if (toStatus === "delivered") patch.delivered_at = new Date().toISOString();

  await supabase.from("orders").update(patch).eq("id", orderId);

  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/orders");
  revalidatePath("/dashboard");
}

/** Approving an AI-proposed order (from the conversation panel) moves it
 * out of draft the same way confirming it manually would. */
export async function approveOrderDraftAction(orderId: string, conversationId: string) {
  await updateOrderStatusAction(orderId, "awaiting_payment");
  revalidatePath(`/communication/${conversationId}`);
}

export async function rejectOrderDraftAction(orderId: string, conversationId: string) {
  await updateOrderStatusAction(orderId, "cancelled");
  revalidatePath(`/communication/${conversationId}`);
}
