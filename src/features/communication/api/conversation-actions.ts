"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/features/identity/api/get-current-business";
import { getCurrentUser } from "@/features/identity/api/get-current-user";

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
 * "Regenerate" is honestly presented here — no live model is wired yet
 * (that's the AI domain's own milestone). This deterministically produces
 * a plausible alternative phrasing from a small local template set so the
 * interaction pattern is real even though the generation isn't live AI.
 */
const regenerationVariants = [
  (body: string) => body,
  (body: string) => `¡Hola! ${body.replace(/^¡?Hola[^!]*!\s*/i, "")}`,
  (body: string) => `${body} ¿Te gustaría que continuemos por aquí mismo?`,
];

export async function regenerateAiDraftAction(messageId: string, conversationId: string) {
  const supabase = await createClient();
  const { data: message } = await supabase
    .from("messages")
    .select("body")
    .eq("id", messageId)
    .maybeSingle();

  if (!message) return;

  const variant = regenerationVariants[Math.floor(Math.random() * regenerationVariants.length)];
  await supabase
    .from("messages")
    .update({ body: variant(message.body), ai_confidence: Math.round((0.7 + Math.random() * 0.25) * 100) / 100 })
    .eq("id", messageId);

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
