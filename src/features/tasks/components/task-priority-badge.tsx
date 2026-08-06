import { StatusBadge, type StatusTone } from "@/components/shared/status-badge";
import type { TaskPriority } from "@/features/tasks/types/task";

const tone: Record<TaskPriority, StatusTone> = {
  low: "neutral",
  normal: "info",
  high: "warning",
  urgent: "danger",
};

const labelEs: Record<TaskPriority, string> = {
  low: "Baja",
  normal: "Normal",
  high: "Alta",
  urgent: "Urgente",
};

export function TaskPriorityBadge({ priority }: { priority: TaskPriority }) {
  if (priority === "normal") return null;
  return <StatusBadge tone={tone[priority]} label={labelEs[priority]} />;
}
