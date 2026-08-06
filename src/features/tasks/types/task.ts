export type TaskStatus = "todo" | "in_progress" | "done" | "cancelled";
export type TaskPriority = "low" | "normal" | "high" | "urgent";
export type TaskRelatedType = "conversation" | "order" | "customer";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  assignedToName: string | null;
  relatedType: TaskRelatedType | null;
  relatedId: string | null;
  relatedLabel: string | null;
  isAiSuggested: boolean;
  completedAt: string | null;
  createdAt: string;
}
