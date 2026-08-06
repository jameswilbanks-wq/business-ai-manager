"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/features/identity/api/get-current-business";
import { getCurrentUser } from "@/features/identity/api/get-current-user";
import { generateConversationReply } from "@/features/ai/api/orchestrator";

/**
 * Approves an AI-drafted reply: marks it approved so it reads as the sent
 * response. Real "actually deliver via WhatsApp" wiring belongs to the
 * WhatsApp Integration milestone — this operates on our own record only.
 */
export async function approveAiDraftAction(messageId: string, conversationId: string) {
  const supabase = await createClient();
  await supabase.from("messages").update({ ai_status: "approved" }).eq("id", messageId);
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
