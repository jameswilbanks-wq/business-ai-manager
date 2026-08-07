"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/features/identity/api/get-current-business";
import type { AuthActionResult } from "@/features/identity/types/auth";

/**
 * Verifies Twilio credentials actually work before marking the channel
 * "connected" — a GET against Twilio's Account resource, which requires
 * valid Account SID + Auth Token to succeed. Real verification, not
 * trusting whatever was typed into the form.
 */
async function verifyTwilioCredentials(
  accountSid: string,
  authToken: string
): Promise<{ valid: boolean; error?: string }> {
  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}.json`,
      { headers: { Authorization: `Basic ${btoa(`${accountSid}:${authToken}`)}` } }
    );
    if (!response.ok) {
      return { valid: false, error: `Twilio respondió ${response.status}` };
    }
    return { valid: true };
  } catch (error) {
    return { valid: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function connectWhatsAppChannelAction(
  _prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const accountSid = String(formData.get("accountSid") ?? "").trim();
  const authToken = String(formData.get("authToken") ?? "").trim();
  const whatsappNumber = String(formData.get("whatsappNumber") ?? "").trim();

  if (!accountSid || !authToken || !whatsappNumber) {
    return { status: "error", message: "invalid_channel_config" };
  }

  const verification = await verifyTwilioCredentials(accountSid, authToken);
  if (!verification.valid) {
    return { status: "error", message: "twilio_verification_failed" };
  }

  const currentBusiness = await getCurrentBusiness();
  if (!currentBusiness) return { status: "error", message: "not_found" };

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("communication_channels")
    .select("id")
    .eq("business_id", currentBusiness.business.id)
    .eq("channel_type", "whatsapp")
    .maybeSingle();

  const payload = {
    business_id: currentBusiness.business.id,
    channel_type: "whatsapp",
    label: `WhatsApp — ${whatsappNumber}`,
    identifier: whatsappNumber,
    status: "connected",
    config: { accountSid, authToken, whatsappNumber },
  };

  const { error } = existing
    ? await supabase.from("communication_channels").update(payload).eq("id", existing.id)
    : await supabase.from("communication_channels").insert(payload);

  if (error) {
    return { status: "error", message: "channel_save_failed" };
  }

  revalidatePath("/settings");
  return { status: "success" };
}

export async function disconnectChannelAction(channelId: string) {
  const supabase = await createClient();
  await supabase
    .from("communication_channels")
    .update({ status: "not_connected", config: {} })
    .eq("id", channelId);
  revalidatePath("/settings");
}

export async function updateGatekeeperSettingsAction(
  enabled: boolean,
  instructions: string
) {
  const currentBusiness = await getCurrentBusiness();
  if (!currentBusiness) return;

  const supabase = await createClient();
  await supabase.from("business_ai_settings").upsert({
    business_id: currentBusiness.business.id,
    gatekeeper_enabled: enabled,
    gatekeeper_instructions: instructions || null,
  });

  revalidatePath("/settings");
}
