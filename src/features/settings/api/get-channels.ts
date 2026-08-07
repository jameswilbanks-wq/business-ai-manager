import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/features/identity/api/get-current-business";

export interface ChannelItem {
  id: string;
  channelType: string;
  label: string;
  identifier: string | null;
  status: string;
  aiGatekeeperEnabled: boolean;
}

export async function getCommunicationChannels(): Promise<ChannelItem[]> {
  const currentBusiness = await getCurrentBusiness();
  if (!currentBusiness) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("communication_channels")
    .select("id, channel_type, label, identifier, status, ai_gatekeeper_enabled")
    .eq("business_id", currentBusiness.business.id)
    .order("created_at", { ascending: true });

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    channelType: row.channel_type,
    label: row.label,
    identifier: row.identifier,
    status: row.status,
    aiGatekeeperEnabled: row.ai_gatekeeper_enabled,
  }));
}

export interface AiSettings {
  gatekeeperEnabled: boolean;
  gatekeeperInstructions: string | null;
}

export async function getAiSettings(): Promise<AiSettings> {
  const currentBusiness = await getCurrentBusiness();
  if (!currentBusiness) return { gatekeeperEnabled: false, gatekeeperInstructions: null };

  const supabase = await createClient();
  const { data } = await supabase
    .from("business_ai_settings")
    .select("gatekeeper_enabled, gatekeeper_instructions")
    .eq("business_id", currentBusiness.business.id)
    .maybeSingle();

  return {
    gatekeeperEnabled: data?.gatekeeper_enabled ?? false,
    gatekeeperInstructions: data?.gatekeeper_instructions ?? null,
  };
}
