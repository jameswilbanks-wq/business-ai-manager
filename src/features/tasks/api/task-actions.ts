"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/features/identity/api/get-current-business";
import type { TaskStatus } from "@/features/tasks/types/task";

export async function updateTaskStatusAction(taskId: string, status: TaskStatus) {
  const supabase = await createClient();
  await supabase
    .from("tasks")
    .update({
      status,
      completed_at: status === "done" ? new Date().toISOString() : null,
    })
    .eq("id", taskId);

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}

export async function createTaskAction(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  const priority = String(formData.get("priority") ?? "normal");
  const dueDate = formData.get("dueDate");

  const currentBusiness = await getCurrentBusiness();
  if (!currentBusiness) return;

  const supabase = await createClient();
  await supabase.from("tasks").insert({
    business_id: currentBusiness.business.id,
    title,
    priority,
    due_date: dueDate ? String(dueDate) : null,
  });

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}

export async function deleteTaskAction(taskId: string) {
  const supabase = await createClient();
  await supabase.from("tasks").delete().eq("id", taskId);
  revalidatePath("/tasks");
}
