import { NextResponse, type NextRequest } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { validateTwilioSignature } from "@/lib/whatsapp/twilio-client";
import { classifyIncomingMessage } from "@/features/ai/api/orchestrator";

export const dynamic = "force-dynamic";

/**
 * The actual message-ingestion endpoint this whole product depends on.
 * Twilio POSTs here (form-encoded, not JSON) whenever a WhatsApp message
 * arrives at a connected number. This uses the service-role client
 * deliberately — there's no authenticated user in a webhook request, and
 * RLS has no session to check against, so this is one of the few places
 * in the app that legitimately needs to bypass it.
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY to be configured — without it,
 * createServiceRoleClient() returns null and this responds 500, which is
 * the correct behavior (fail loudly rather than silently drop messages).
 */
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const params = Object.fromEntries(new URLSearchParams(rawBody));

  const from = params.From?.replace("whatsapp:", "") ?? "";
  const to = params.To?.replace("whatsapp:", "") ?? "";
  const body = params.Body ?? "";
  const profileName = params.ProfileName ?? null;

  if (!from || !to) {
    return new NextResponse("Missing From/To", { status: 400 });
  }

  const supabase = await createServiceRoleClient();
  if (!supabase) {
    console.error("[webhooks/twilio-whatsapp] SUPABASE_SERVICE_ROLE_KEY not configured");
    return new NextResponse("Server not configured", { status: 500 });
  }

  // Find which business this number belongs to, and validate the request
  // genuinely came from Twilio using THAT business's auth token — each
  // business has its own Twilio credentials.
  const { data: channel } = await supabase
    .from("communication_channels")
    .select("id, business_id, config")
    .eq("channel_type", "whatsapp")
    .eq("identifier", to)
    .eq("status", "connected")
    .maybeSingle();

  if (!channel) {
    return new NextResponse("Unknown WhatsApp number", { status: 404 });
  }

  const config = channel.config as { accountSid?: string; authToken?: string };
  if (!config.authToken) {
    return new NextResponse("Channel misconfigured", { status: 500 });
  }

  const signature = request.headers.get("X-Twilio-Signature");
  const isValid = await validateTwilioSignature(config.authToken, request.url, params, signature);
  if (!isValid) {
    console.error("[webhooks/twilio-whatsapp] invalid Twilio signature");
    return new NextResponse("Invalid signature", { status: 403 });
  }

  const businessId = channel.business_id;

  // Find or create the customer.
  const { data: existingCustomer } = await supabase
    .from("customers")
    .select("id")
    .eq("business_id", businessId)
    .eq("phone", from)
    .maybeSingle();

  let customerId = existingCustomer?.id;
  const isKnownCustomer = !!existingCustomer;

  if (!customerId) {
    const { data: newCustomer } = await supabase
      .from("customers")
      .insert({ business_id: businessId, name: profileName ?? from, phone: from })
      .select("id")
      .single();
    customerId = newCustomer?.id;
  }

  if (!customerId) {
    return new NextResponse("Could not resolve customer", { status: 500 });
  }

  // AI Gatekeeper — only runs if the business has opted in. A conversation
  // never gets created for a rejected message, so nothing "arrives" in the
  // inbox for it; this is intentionally quiet rather than a visible
  // rejected-messages log, which is a reasonable future addition but out
  // of scope for making the core filter real today.
  const { data: aiSettings } = await supabase
    .from("business_ai_settings")
    .select("gatekeeper_enabled, gatekeeper_instructions")
    .eq("business_id", businessId)
    .maybeSingle();

  if (aiSettings?.gatekeeper_enabled) {
    const { data: business } = await supabase
      .from("businesses")
      .select("name")
      .eq("id", businessId)
      .maybeSingle();

    const classification = await classifyIncomingMessage({
      businessName: business?.name ?? "el negocio",
      messageBody: body,
      isKnownCustomer,
      customInstructions: aiSettings.gatekeeper_instructions,
    });

    if (classification.status === "success" && !classification.isBusinessRelated) {
      console.log(
        `[webhooks/twilio-whatsapp] gatekeeper rejected message from ${from}: ${classification.reasoning}`
      );
      return new NextResponse("<Response></Response>", {
        status: 200,
        headers: { "Content-Type": "text/xml" },
      });
    }
  }

  // Find an existing open/pending conversation, or start a new one.
  const { data: existingConvo } = await supabase
    .from("conversations")
    .select("id, unread_count")
    .eq("business_id", businessId)
    .eq("customer_id", customerId)
    .in("status", ["open", "pending"])
    .order("last_message_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let conversationId = existingConvo?.id;

  if (!conversationId) {
    const { data: newConvo } = await supabase
      .from("conversations")
      .insert({
        business_id: businessId,
        customer_id: customerId,
        channel: "whatsapp",
        status: "open",
        unread_count: 0,
      })
      .select("id")
      .single();
    conversationId = newConvo?.id;
  }

  if (!conversationId) {
    return new NextResponse("Could not resolve conversation", { status: 500 });
  }

  await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_type: "customer",
    sender_name: profileName,
    body,
  });

  await supabase
    .from("conversations")
    .update({
      last_message_at: new Date().toISOString(),
      unread_count: (existingConvo?.unread_count ?? 0) + 1,
      status: "open",
    })
    .eq("id", conversationId);

  return new NextResponse("<Response></Response>", {
    status: 200,
    headers: { "Content-Type": "text/xml" },
  });
}
