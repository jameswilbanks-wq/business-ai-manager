import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { getAnthropicClient, AI_MODEL } from "@/lib/ai/client";

export interface ReplyDraftContext {
  businessName: string;
  customerName: string;
  isVip: boolean;
  conversationSummary: string | null;
  recentMessages: { speaker: "customer" | "business"; text: string }[];
}

export interface ReplyDraftResult {
  status: "success";
  reply: string;
}

export interface ReplyDraftError {
  status: "error";
  message: "ai_not_configured" | "ai_request_failed";
  detail?: string;
}

/**
 * The AI Domain's single entry point for "draft a reply to this
 * conversation" (AI Playbook — every business module goes through the
 * orchestrator, never the provider directly). Communication's server
 * actions call this; this is the only thing that calls the Anthropic
 * client.
 *
 * Deliberately conservative system prompt: draft only, never claims to
 * have sent anything, always in the business's voice, always Spanish
 * (the business's default_language) unless the conversation is in
 * English. A human always approves before anything goes out — this
 * function only ever produces a *draft* message row with ai_status set
 * to 'draft', identical to how the seeded demo drafts work, so the rest
 * of the Approve/Edit/Reject workflow needs zero changes.
 */
export async function generateConversationReply(
  context: ReplyDraftContext
): Promise<ReplyDraftResult | ReplyDraftError> {
  const client = await getAnthropicClient();
  if (!client) {
    return { status: "error", message: "ai_not_configured" };
  }

  const transcript = context.recentMessages
    .map((m) => `${m.speaker === "customer" ? context.customerName : "Negocio"}: ${m.text}`)
    .join("\n");

  const systemPrompt = `Eres el asistente de IA de "${context.businessName}", un negocio de flores y regalos en Colombia que atiende a sus clientes por WhatsApp.

Tu tarea es redactar UN solo mensaje de respuesta para el cliente, en español, con el tono cálido y profesional típico de WhatsApp (puedes usar emojis con moderación, frases cortas, cercanía).

Reglas estrictas:
- Responde ÚNICAMENTE con el texto del mensaje que se enviaría al cliente. Sin explicaciones, sin comillas, sin encabezados.
- Nunca inventes información específica que no esté en la conversación (precios exactos, fechas de entrega, disponibilidad de inventario) a menos que ya se haya mencionado — si falta ese dato, pide la información o indica que lo confirmarás.
- Nunca prometas acciones que impliquen cobros, reembolsos o compromisos legales sin que un humano los apruebe primero.
- Sé breve: 1-3 frases como máximo, como un mensaje real de WhatsApp.${
    context.isVip ? "\n- Este es un cliente VIP — trátalo con atención especial." : ""
  }`;

  const userPrompt = `Resumen de la conversación: ${context.conversationSummary ?? "(sin resumen)"}

Historial reciente:
${transcript}

Redacta la siguiente respuesta del negocio para ${context.customerName}.`;

  try {
    const response = await client.messages.create({
      model: AI_MODEL,
      max_tokens: 300,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const textBlock = response.content.find((block) => block.type === "text");
    const reply = textBlock && "text" in textBlock ? textBlock.text.trim() : "";

    if (!reply) {
      return { status: "error", message: "ai_request_failed" };
    }

    return { status: "success", reply };
  } catch (error) {
    console.error("[ai/orchestrator] generateConversationReply failed:", error);
    const detail =
      error instanceof Anthropic.APIError
        ? `${error.status}: ${error.message}`
        : error instanceof Error
          ? error.message
          : String(error);
    return { status: "error", message: "ai_request_failed", detail };
  }
}
