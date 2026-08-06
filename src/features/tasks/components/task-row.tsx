"use client";

import * as React from "react";
import Link from "next/link";
import { format, isPast, isToday } from "date-fns";
import { es } from "date-fns/locale";
import { MessageCircle, Package, Sparkles, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { updateTaskStatusAction, deleteTaskAction } from "@/features/tasks/api/task-actions";
import { TaskPriorityBadge } from "@/features/tasks/components/task-priority-badge";
import type { Task } from "@/features/tasks/types/task";

export function TaskRow({ task }: { task: Task }) {
  const [isPending, startTransition] = React.useTransition();
  const done = task.status === "done";
  const cancelled = task.status === "cancelled";

  const dueDate = task.dueDate ? new Date(task.dueDate + "T00:00:00") : null;
  const overdue = dueDate && !done && !cancelled && isPast(dueDate) && !isToday(dueDate);

  const relatedHref =
    task.relatedType === "conversation"
      ? `/communication/${task.relatedId}`
      : task.relatedType === "order"
        ? `/orders/${task.relatedId}`
        : null;

  return (
    <div
      className={cn(
        "flex items-start gap-3 border-b border-border px-4 py-3 transition-colors hover:bg-accent/30",
        done && "opacity-60"
      )}
    >
      <Checkbox
        className="mt-0.5"
        checked={done}
        disabled={isPending || cancelled}
        onCheckedChange={(checked) =>
          startTransition(async () => {
            await updateTaskStatusAction(task.id, checked ? "done" : "todo");
          })
        }
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className={cn("truncate text-sm font-medium", done && "line-through")}>
            {task.title}
          </p>
          {task.isAiSuggested && (
            <Badge variant="outline" className="shrink-0 gap-1 text-primary">
              <Sparkles className="size-3" /> IA
            </Badge>
          )}
        </div>
        {task.description && (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{task.description}</p>
        )}
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <TaskPriorityBadge priority={task.priority} />
          {dueDate && (
            <span className={cn("text-xs", overdue ? "font-medium text-destructive" : "text-muted-foreground")}>
              {overdue ? "Venció " : ""}
              {format(dueDate, "d MMM", { locale: es })}
            </span>
          )}
          {task.assignedToName && (
            <span className="text-xs text-muted-foreground">· {task.assignedToName}</span>
          )}
          {relatedHref && task.relatedLabel && (
            <Link
              href={relatedHref}
              className="flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-xs text-accent-foreground hover:bg-accent/70"
            >
              {task.relatedType === "conversation" ? (
                <MessageCircle className="size-3" />
              ) : (
                <Package className="size-3" />
              )}
              {task.relatedLabel}
            </Link>
          )}
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 text-muted-foreground hover:text-destructive"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            await deleteTaskAction(task.id);
          })
        }
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}
