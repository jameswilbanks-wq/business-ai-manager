"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/features/identity/api/get-current-business";
import { getCurrentUser } from "@/features/identity/api/get-current-user";
import { generateConversationReply, extractOrderFromConversation } from "@/features/ai/api/orchestrator";
import { sendWhatsAppMessage } from "@/lib/whatsapp/twilio-client";

/**
 * If this conversation's channel is a connected WhatsApp number, actually
 * deliver the message via Twilio — not just store it locally. Best-effort:
 * a delivery failure is logged but never blocks saving the message itself,
 * since losing the local record because an external API call failed would
 * be worse than the reverse.
 */
async function deliverOutboundMessage(conversationId: string, body: string): Promise<void> {
  const supabase = await createClient();
  const currentBusiness = await getCurrentBusiness();
  if (!currentBusiness) return;

  const { data: convo } = await supabase
    .from("conversations")
    .select("channel, customers ( phone )")
    .eq("id", conversationId)
    .maybeSingle();

  if (!convo || convo.channel !== "whatsapp") return;
  const customerPhone = (convo.customers as unknown as { phone: string | null } | null)?.phone;
  if (!customerPhone) return;

  const { data: channel } = await supabase
    .from("communication_channels")
    .select("config")
    .eq("business_id", currentBusiness.business.id)
    .eq("channel_type", "whatsapp")
    .eq("status", "connected")
    .maybeSingle();

  const config = channel?.config as
    | { accountSid?: string; authToken?: string; whatsappNumber?: string }
    | undefined;
  if (!config?.accountSid || !config.authToken || !config.whatsappNumber) return;

  const result = await sendWhatsAppMessage(
    { accountSid: config.accountSid, authToken: config.authToken, whatsappNumber: config.whatsappNumber },
    customerPhone,
    body
  );

  if (!result.sent) {
    console.error(`[conversation-actions] WhatsApp delivery failed: ${result.error}`);
  }
}

/**
 * Approves an AI-drafted reply: marks it approved and, if this
 * conversation is on a connected WhatsApp channel, actually sends it.
 */
export async function approveAiDraftAction(messageId: string, conversationId: string) {
  const supabase = await createClient();
  const { data: message } = await supabase
    .from("messages")
    .select("body")
    .eq("id", messageId)
    .maybeSingle();

  await supabase.from("messages").update({ ai_status: "approved" }).eq("id", messageId);

  if (message) {
    await deliverOutboundMessage(conversationId, message.body);
  }

  revalidatePath(`/communication/${conversationId}`);
}

export async function rejectAiDraftAction(messageId: string, conversationId: string) {
  const supabase = await createClient();
  await supabase.from("messages").update({ ai_status: "rejected" }).eq("id", messageId);
  revalidatePath(`/communication/${conversationId}`);
}

/**
 * Builds the context object the AI orchestrator needs from a
 * conversation's actual rows — shared by generate + regenerate so both
 * paths see identical context.
 */
async function buildReplyContext(conversationId: string) {
  const supabase = await createClient();
  const currentBusiness = await getCurrentBusiness();
  if (!currentBusiness) return null;

  const { data: convo } = await supabase
    .from("conversations")
    .select("ai_summary, customers ( name, is_vip )")
    .eq("id", conversationId)
    .maybeSingle();
  if (!convo) return null;

  const { data: messages } = await supabase
    .from("messages")
    .select("sender_type, body, is_internal_note, ai_status")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(20);

  const customer = convo.customers as unknown as { name: string; is_vip: boolean } | null;

  return {
    businessName: currentBusiness.business.name,
    customerName: customer?.name ?? "Cliente",
    isVip: customer?.is_vip ?? false,
    conversationSummary: convo.ai_summary,
    recentMessages: (messages ?? [])
      .filter((m) => !m.is_internal_note && m.ai_status !== "draft" && m.ai_status !== "rejected")
      .map((m) => ({
        speaker: (m.sender_type === "customer" ? "customer" : "business") as "customer" | "business",
        text: m.body,
      })),
  };
}

/**
 * Real AI reply generation — calls the AI Domain orchestrator, which
 * calls Anthropic's API. Inserts the result as a normal 'ai' + 'draft'
 * message row, so it flows through the exact same Approve/Edit/Reject UI
 * as the seeded demo drafts — no separate code path for "real" vs
 * "seeded" AI content once it's in the database.
 *
 * Gracefully degrades per AI Playbook — "Failure Handling": if
 * ANTHROPIC_API_KEY isn't configured, or the request fails, this simply
 * does nothing rather than breaking the conversation. The caller (the UI)
 * is responsible for telling the person generation didn't happen.
 */
export async function generateAiReplyAction(
  conversationId: string
): Promise<{ status: "success" } | { status: "error"; message: string; detail?: string }> {
  const context = await buildReplyContext(conversationId);
  if (!context) return { status: "error", message: "not_found" };

  const result = await generateConversationReply(context);
  if (result.status === "error") {
    return { status: "error", message: result.message, detail: result.detail };
  }

  const supabase = await createClient();
  await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_type: "ai",
    sender_name: "Asistente IA",
    body: result.reply,
    ai_status: "draft",
    ai_confidence: null,
  });

  revalidatePath(`/communication/${conversationId}`);
  return { status: "success" };
}

export async function regenerateAiDraftAction(
  messageId: string,
  conversationId: string
): Promise<{ status: "success" } | { status: "error"; message: string; detail?: string }> {
  const context = await buildReplyContext(conversationId);
  if (!context) return { status: "error", message: "not_found" };

  const result = await generateConversationReply(context);
  const supabase = await createClient();

  if (result.status === "success") {
    await supabase
      .from("messages")
      .update({ body: result.reply, ai_confidence: null })
      .eq("id", messageId);
    revalidatePath(`/communication/${conversationId}`);
    return { status: "success" };
  }

  // AI not configured or the request failed — fall back to a local
  // rewrite rather than leaving the button appearing broken. Still
  // clearly a fallback, not a substitute for the real thing.
  const { data: message } = await supabase
    .from("messages")
    .select("body")
    .eq("id", messageId)
    .maybeSingle();
  if (message) {
    const fallback = `${message.body} ¿Te gustaría que continuemos por aquí mismo?`;
    await supabase
      .from("messages")
      .update({ body: fallback, ai_confidence: null })
      .eq("id", messageId);
  }
  revalidatePath(`/communication/${conversationId}`);
  return { status: "error", message: result.message, detail: result.status === "error" ? result.detail : undefined };
}

/** Persists an edit made to an AI draft before approving it. */
export async function updateDraftBodyAction(messageId: string, conversationId: string, body: string) {
  if (!body.trim()) return;
  const supabase = await createClient();
  await supabase.from("messages").update({ body: body.trim() }).eq("id", messageId);
  revalidatePath(`/communication/${conversationId}`);
}

export async function sendMessageAction(conversationId: string, body: string) {
  if (!body.trim()) return;

  const supabase = await createClient();
  const currentBusiness = await getCurrentBusiness();
  const user = await getCurrentUser();
  if (!currentBusiness) return;

  await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_type: "agent",
    sender_name: user?.profile?.displayName ?? "Tú",
    body: body.trim(),
  });

  await supabase
    .from("conversations")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", conversationId);

  await deliverOutboundMessage(conversationId, body.trim());

  revalidatePath(`/communication/${conversationId}`);
  revalidatePath("/communication");
}

export async function markConversationReadAction(conversationId: string) {
  const supabase = await createClient();
  await supabase.from("conversations").update({ unread_count: 0 }).eq("id", conversationId);
  revalidatePath("/communication");
}

/**
 * The "mark as completed / needs follow-up" workflow. Conversation status
 * was already in the schema (open/pending/resolved) but nothing let a
 * person actually change it — this is that missing control.
 */
export async function updateConversationStatusAction(
  conversationId: string,
  status: "open" | "pending" | "resolved"
) {
  const supabase = await createClient();
  await supabase.from("conversations").update({ status }).eq("id", conversationId);
  revalidatePath(`/communication/${conversationId}`);
  revalidatePath("/communication");
  revalidatePath("/dashboard");
}

/**
 * Real AI order extraction — "AI should try to create it and then the
 * user approves or modifies or follows up or cancels." Replaces the
 * seeded ai_generated draft orders with a genuine analysis of the
 * conversation, grounded in the actual product catalog so it can't
 * hallucinate prices for real products (it can still propose a custom
 * item, but must say so rather than inventing a number).
 *
 * Only creates an order row when the model genuinely finds a purchase
 * intent — a "just answering a question" conversation correctly produces
 * no order, which is itself useful information, not a failure.
 */
export async function generateAiOrderSuggestionAction(
  conversationId: string
): Promise<
  | { status: "success"; orderId: string }
  | { status: "no_opportunity"; reasoning: string }
  | { status: "error"; message: string; detail?: string }
> {
  const context = await buildReplyContext(conversationId);
  if (!context) return { status: "error", message: "not_found" };

  const currentBusiness = await getCurrentBusiness();
  const user = await getCurrentUser();
  if (!currentBusiness || !user) return { status: "error", message: "not_found" };

  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("name, price, category")
    .eq("business_id", currentBusiness.business.id)
    .eq("is_active", true);

  const result = await extractOrderFromConversation({
    ...context,
    catalog: (products ?? []).map((p) => ({ name: p.name, price: p.price, category: p.category })),
  });

  if (result.status === "error") {
    return { status: "error", message: result.message, detail: result.detail };
  }

  if (!result.hasOrderOpportunity || result.lineItems.length === 0) {
    return { status: "no_opportunity", reasoning: result.reasoning };
  }

  const { data: convo } = await supabase
    .from("conversations")
    .select("customer_id")
    .eq("id", conversationId)
    .maybeSingle();
  if (!convo) return { status: "error", message: "not_found" };

  const subtotal = result.lineItems.reduce(
    (sum, li) => sum + (li.estimatedUnitPrice ?? 0) * li.quantity,
    0
  );
  const orderNumber = `ORD-AI-${Date.now().toString(36).toUpperCase()}`;

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      business_id: currentBusiness.business.id,
      customer_id: convo.customer_id,
      conversation_id: conversationId,
      order_number: orderNumber,
      status: "draft",
      subtotal,
      total: subtotal,
      notes: result.notes ?? result.reasoning,
      ai_generated: true,
    })
    .select("id")
    .single();

  if (orderError || !order) {
    return { status: "error", message: "order_creation_failed" };
  }

  await supabase.from("order_items").insert(
    result.lineItems.map((li, idx) => ({
      order_id: order.id,
      product_name: li.matchedCatalogItem
        ? li.productName
        : `${li.productName} (personalizado — sin precio confirmado)`,
      quantity: li.quantity,
      unit_price: li.estimatedUnitPrice ?? 0,
      line_total: (li.estimatedUnitPrice ?? 0) * li.quantity,
      sort_order: idx,
    }))
  );

  revalidatePath(`/communication/${conversationId}`);
  revalidatePath("/orders");
  return { status: "success", orderId: order.id };
}
