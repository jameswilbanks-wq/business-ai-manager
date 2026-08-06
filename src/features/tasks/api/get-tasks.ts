import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/features/identity/api/get-current-business";
import type { Task } from "@/features/tasks/types/task";

interface TaskRow {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  assigned_to_name: string | null;
  related_type: string | null;
  related_id: string | null;
  is_ai_suggested: boolean;
  completed_at: string | null;
  created_at: string;
}

/**
 * related_type/related_id is a polymorphic reference (no FK, since it can
 * point at conversations or orders — see the migration's comment on why).
 * Resolving the human-readable label for each is therefore two extra
 * batch queries rather than a join, done once per fetch rather than per
 * row.
 */
export async function getTasks(): Promise<Task[]> {
  const currentBusiness = await getCurrentBusiness();
  if (!currentBusiness) return [];

  const supabase = await createClient();

  const { data: rows, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("business_id", currentBusiness.business.id)
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error || !rows) return [];

  const conversationIds = rows
    .filter((r) => r.related_type === "conversation" && r.related_id)
    .map((r) => r.related_id as string);
  const orderIds = rows
    .filter((r) => r.related_type === "order" && r.related_id)
    .map((r) => r.related_id as string);

  const [conversationsRes, ordersRes] = await Promise.all([
    conversationIds.length
      ? supabase
          .from("conversations")
          .select("id, customers ( name )")
          .in("id", conversationIds)
      : Promise.resolve({ data: [] as { id: string; customers: { name: string } | null }[] }),
    orderIds.length
      ? supabase.from("orders").select("id, order_number").in("id", orderIds)
      : Promise.resolve({ data: [] as { id: string; order_number: string }[] }),
  ]);

  const conversationLabels = new Map(
    (conversationsRes.data ?? []).map((c) => [
      c.id,
      (c.customers as unknown as { name: string } | null)?.name ?? "Conversación",
    ])
  );
  const orderLabels = new Map((ordersRes.data ?? []).map((o) => [o.id, o.order_number]));

  return (rows as TaskRow[]).map((r) => {
    let relatedLabel: string | null = null;
    if (r.related_type === "conversation" && r.related_id) {
      relatedLabel = conversationLabels.get(r.related_id) ?? null;
    } else if (r.related_type === "order" && r.related_id) {
      relatedLabel = orderLabels.get(r.related_id) ?? null;
    }

    return {
      id: r.id,
      title: r.title,
      description: r.description,
      status: r.status as Task["status"],
      priority: r.priority as Task["priority"],
      dueDate: r.due_date,
      assignedToName: r.assigned_to_name,
      relatedType: r.related_type as Task["relatedType"],
      relatedId: r.related_id,
      relatedLabel,
      isAiSuggested: r.is_ai_suggested,
      completedAt: r.completed_at,
      createdAt: r.created_at,
    };
  });
}
