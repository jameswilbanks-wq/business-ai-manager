import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/features/identity/api/get-current-business";
import type { ConversationListItem } from "@/features/communication/types/conversation";

interface ConversationRow {
  id: string;
  status: string;
  priority: string;
  assigned_to_name: string | null;
  tags: string[];
  unread_count: number;
  ai_summary: string | null;
  sentiment: string | null;
  last_message_at: string;
  customers: {
    id: string;
    name: string;
    phone: string | null;
    avatar_url: string | null;
    is_vip: boolean;
    tags: string[];
  } | null;
  messages: { ai_status: string | null }[];
}

function mapRow(row: ConversationRow): ConversationListItem {
  return {
    id: row.id,
    customer: {
      id: row.customers?.id ?? "",
      name: row.customers?.name ?? "Cliente",
      phone: row.customers?.phone ?? null,
      avatarUrl: row.customers?.avatar_url ?? null,
      isVip: row.customers?.is_vip ?? false,
      tags: row.customers?.tags ?? [],
    },
    status: row.status as ConversationListItem["status"],
    priority: row.priority as ConversationListItem["priority"],
    assignedToName: row.assigned_to_name,
    tags: row.tags,
    unreadCount: row.unread_count,
    aiSummary: row.ai_summary,
    sentiment: row.sentiment as ConversationListItem["sentiment"],
    lastMessageAt: row.last_message_at,
    hasAiDraft: row.messages?.some((m) => m.ai_status === "draft") ?? false,
  };
}

/** Every conversation for the current business, newest activity first. */
export async function getConversations(): Promise<ConversationListItem[]> {
  const currentBusiness = await getCurrentBusiness();
  if (!currentBusiness) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("conversations")
    .select(
      `
      id, status, priority, assigned_to_name, tags, unread_count,
      ai_summary, sentiment, last_message_at,
      customers ( id, name, phone, avatar_url, is_vip, tags ),
      messages ( ai_status )
    `
    )
    .eq("business_id", currentBusiness.business.id)
    .order("last_message_at", { ascending: false });

  if (error || !data) return [];

  return (data as unknown as ConversationRow[]).map(mapRow);
}
