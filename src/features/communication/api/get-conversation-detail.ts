import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/features/identity/api/get-current-business";
import type { ConversationDetail, Message } from "@/features/communication/types/conversation";

function mapMessage(row: {
  id: string;
  conversation_id: string;
  sender_type: string;
  sender_name: string | null;
  body: string;
  is_internal_note: boolean;
  ai_confidence: number | null;
  ai_status: string | null;
  created_at: string;
}): Message {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderType: row.sender_type as Message["senderType"],
    senderName: row.sender_name,
    body: row.body,
    isInternalNote: row.is_internal_note,
    aiConfidence: row.ai_confidence,
    aiStatus: row.ai_status as Message["aiStatus"],
    createdAt: row.created_at,
  };
}

export async function getConversationDetail(
  conversationId: string
): Promise<ConversationDetail | null> {
  const currentBusiness = await getCurrentBusiness();
  if (!currentBusiness) return null;

  const supabase = await createClient();

  const { data: convo, error: convoError } = await supabase
    .from("conversations")
    .select(
      `
      id, status, priority, assigned_to_name, tags, unread_count,
      ai_summary, sentiment, last_message_at,
      customers ( id, name, phone, avatar_url, is_vip, tags )
    `
    )
    .eq("id", conversationId)
    .eq("business_id", currentBusiness.business.id)
    .maybeSingle();

  if (convoError || !convo) return null;

  const { data: messages, error: messagesError } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (messagesError || !messages) return null;

  // The conversation -> order bridge: if AI (or a human) already proposed
  // an order from this conversation, surface it so the panel can render
  // the suggestion card instead of the person having to go find it.
  const { data: linkedOrderRow } = await supabase
    .from("orders")
    .select("id, order_number, status, ai_generated, total, currency, order_items ( product_name, quantity )")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const linkedOrder = linkedOrderRow
    ? {
        id: linkedOrderRow.id,
        orderNumber: linkedOrderRow.order_number,
        status: linkedOrderRow.status,
        aiGenerated: linkedOrderRow.ai_generated,
        total: linkedOrderRow.total,
        currency: linkedOrderRow.currency,
        itemsSummary: (
          (linkedOrderRow.order_items as unknown as { product_name: string; quantity: number }[]) ?? []
        )
          .map((i) => `${i.quantity}× ${i.product_name}`)
          .join(", "),
      }
    : null;

  const customer = convo.customers as unknown as {
    id: string;
    name: string;
    phone: string | null;
    avatar_url: string | null;
    is_vip: boolean;
    tags: string[];
  } | null;

  return {
    id: convo.id,
    customer: {
      id: customer?.id ?? "",
      name: customer?.name ?? "Cliente",
      phone: customer?.phone ?? null,
      avatarUrl: customer?.avatar_url ?? null,
      isVip: customer?.is_vip ?? false,
      tags: customer?.tags ?? [],
    },
    status: convo.status as ConversationDetail["status"],
    priority: convo.priority as ConversationDetail["priority"],
    assignedToName: convo.assigned_to_name,
    tags: convo.tags,
    unreadCount: convo.unread_count,
    aiSummary: convo.ai_summary,
    sentiment: convo.sentiment as ConversationDetail["sentiment"],
    lastMessageAt: convo.last_message_at,
    hasAiDraft: messages.some((m) => m.ai_status === "draft"),
    messages: messages.map(mapMessage),
    linkedOrder,
  };
}
