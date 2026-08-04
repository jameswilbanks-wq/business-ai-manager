import "server-only";
import { getConversations } from "@/features/communication/api/get-conversations";
import type { ConversationListItem } from "@/features/communication/types/conversation";

export interface DashboardSummary {
  unreadCount: number;
  urgentCount: number;
  aiDraftsAwaitingCount: number;
  pendingCount: number;
  needsAttention: ConversationListItem[];
}

/**
 * Every number here is derived from real seeded Communication-domain data
 * — no fabricated metrics. Revenue/Orders figures are deliberately absent:
 * the Orders module doesn't exist yet, and showing revenue with nothing
 * behind it would be exactly the kind of disconnected placeholder data
 * the platform's own principles rule out.
 */
export async function getDashboardSummary(): Promise<DashboardSummary> {
  const conversations = await getConversations();

  const unreadCount = conversations.reduce((sum, c) => sum + c.unreadCount, 0);
  const urgentCount = conversations.filter((c) => c.priority === "urgent").length;
  const aiDraftsAwaitingCount = conversations.filter((c) => c.hasAiDraft).length;
  const pendingCount = conversations.filter((c) => c.status === "pending").length;

  const needsAttention = [...conversations]
    .filter((c) => c.status !== "resolved" && (c.priority !== "normal" || c.unreadCount > 0))
    .sort((a, b) => {
      const priorityWeight = { urgent: 2, high: 1, normal: 0 } as const;
      const weightDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
      if (weightDiff !== 0) return weightDiff;
      return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
    })
    .slice(0, 6);

  return { unreadCount, urgentCount, aiDraftsAwaitingCount, pendingCount, needsAttention };
}
