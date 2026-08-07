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

// ============================================================================
// Order extraction — "AI should try to create it and then the user
// approves or modifies or follows up or cancels." Grounded in the
// business's real product catalog (name + price) so the model matches
// against actual items instead of hallucinating products/prices; it can
// still propose a custom item when nothing in the catalog fits, but must
// say so explicitly rather than inventing a price for it.
// ============================================================================

export interface ProductCatalogEntry {
  name: string;
  price: number;
  category: string | null;
}

export interface OrderExtractionContext extends ReplyDraftContext {
  catalog: ProductCatalogEntry[];
}

export interface ExtractedLineItem {
  productName: string;
  matchedCatalogItem: boolean;
  quantity: number;
  estimatedUnitPrice: number | null;
}

export interface OrderExtractionResult {
  status: "success";
  hasOrderOpportunity: boolean;
  reasoning: string;
  lineItems: ExtractedLineItem[];
  notes: string | null;
}

const PROPOSE_ORDER_TOOL: Anthropic.Tool = {
  name: "propose_order",
  description:
    "Registra si la conversación representa una oportunidad de pedido real y, si es así, qué artículos incluiría.",
  input_schema: {
    type: "object",
    properties: {
      has_order_opportunity: {
        type: "boolean",
        description:
          "true solo si el cliente está pidiendo, o claramente a punto de pedir, productos concretos — no para preguntas generales, quejas sin pedido, o saludos.",
      },
      reasoning: {
        type: "string",
        description: "Explicación breve (1 frase) de por qué sí o no hay una oportunidad de pedido.",
      },
      line_items: {
        type: "array",
        items: {
          type: "object",
          properties: {
            product_name: { type: "string" },
            matched_catalog_item: {
              type: "boolean",
              description: "true si product_name coincide exactamente con un artículo del catálogo dado.",
            },
            quantity: { type: "integer" },
            estimated_unit_price: {
              type: ["number", "null"],
              description:
                "Precio del catálogo si matched_catalog_item es true. null si es un artículo personalizado sin precio conocido — nunca inventar un precio.",
            },
          },
          required: ["product_name", "matched_catalog_item", "quantity", "estimated_unit_price"],
        },
      },
      notes: { type: ["string", "null"] },
    },
    required: ["has_order_opportunity", "reasoning", "line_items"],
  },
};

export async function extractOrderFromConversation(
  context: OrderExtractionContext
): Promise<OrderExtractionResult | ReplyDraftError> {
  const client = await getAnthropicClient();
  if (!client) {
    return { status: "error", message: "ai_not_configured" };
  }

  const transcript = context.recentMessages
    .map((m) => `${m.speaker === "customer" ? context.customerName : "Negocio"}: ${m.text}`)
    .join("\n");

  const catalogText = context.catalog
    .map((p) => `- ${p.name}${p.category ? ` (${p.category})` : ""}: $${p.price}`)
    .join("\n");

  const systemPrompt = `Eres el asistente de IA de "${context.businessName}", un negocio de flores y regalos en Colombia.

Analiza esta conversación de WhatsApp y determina si el cliente está pidiendo (o claramente a punto de pedir) productos concretos. Usa ÚNICAMENTE la herramienta propose_order para responder.

Catálogo de productos disponible:
${catalogText}

Reglas estrictas:
- Solo marca has_order_opportunity=true si hay una intención de compra clara y específica, no para preguntas generales o quejas sin pedido asociado.
- Para cada artículo, intenta encontrar una coincidencia exacta en el catálogo. Si coincide, usa matched_catalog_item=true y el precio exacto del catálogo.
- Si el cliente pide algo que no está en el catálogo (ej. una combinación personalizada), usa matched_catalog_item=false y estimated_unit_price=null — nunca inventes un precio.`;

  const userPrompt = `Resumen: ${context.conversationSummary ?? "(sin resumen)"}

Historial reciente:
${transcript}`;

  try {
    const response = await client.messages.create({
      model: AI_MODEL,
      max_tokens: 800,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
      tools: [PROPOSE_ORDER_TOOL],
      tool_choice: { type: "tool", name: "propose_order" },
    });

    const toolUse = response.content.find((block) => block.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") {
      return { status: "error", message: "ai_request_failed" };
    }

    const input = toolUse.input as {
      has_order_opportunity: boolean;
      reasoning: string;
      line_items: {
        product_name: string;
        matched_catalog_item: boolean;
        quantity: number;
        estimated_unit_price: number | null;
      }[];
      notes: string | null;
    };

    return {
      status: "success",
      hasOrderOpportunity: input.has_order_opportunity,
      reasoning: input.reasoning,
      lineItems: input.line_items.map((li) => ({
        productName: li.product_name,
        matchedCatalogItem: li.matched_catalog_item,
        quantity: li.quantity,
        estimatedUnitPrice: li.estimated_unit_price,
      })),
      notes: input.notes,
    };
  } catch (error) {
    console.error("[ai/orchestrator] extractOrderFromConversation failed:", error);
    const detail =
      error instanceof Anthropic.APIError
        ? `${error.status}: ${error.message}`
        : error instanceof Error
          ? error.message
          : String(error);
    return { status: "error", message: "ai_request_failed", detail };
  }
}
