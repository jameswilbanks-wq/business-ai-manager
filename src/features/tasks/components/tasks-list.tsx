"use client";

import * as React from "react";
import { ListChecks } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/empty-state";
import { CreateTaskForm } from "@/features/tasks/components/create-task-form";
import { TaskRow } from "@/features/tasks/components/task-row";
import type { Task } from "@/features/tasks/types/task";

type FilterKey = "pending" | "in_progress" | "done" | "all";

export function TasksList({ tasks }: { tasks: Task[] }) {
  const [filter, setFilter] = React.useState<FilterKey>("pending");

  const filtered = tasks.filter((t) => {
    if (filter === "pending") return t.status === "todo";
    if (filter === "in_progress") return t.status === "in_progress";
    if (filter === "done") return t.status === "done";
    return t.status !== "cancelled";
  });

  const counts = {
    pending: tasks.filter((t) => t.status === "todo").length,
    in_progress: tasks.filter((t) => t.status === "in_progress").length,
    done: tasks.filter((t) => t.status === "done").length,
  };

  return (
    <div className="flex flex-col gap-4">
      <CreateTaskForm />

      <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterKey)}>
        <TabsList>
          <TabsTrigger value="pending">Pendientes ({counts.pending})</TabsTrigger>
          <TabsTrigger value="in_progress">En progreso ({counts.in_progress})</TabsTrigger>
          <TabsTrigger value="done">Completadas ({counts.done})</TabsTrigger>
          <TabsTrigger value="all">Todas</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="overflow-hidden rounded-xl border border-border">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<ListChecks />}
            title="No hay tareas aquí"
            description="Todo está al día en esta categoría."
            className="border-none"
          />
        ) : (
          filtered
            .sort((a, b) => {
              const weight = { urgent: 3, high: 2, normal: 1, low: 0 } as const;
              return weight[b.priority] - weight[a.priority];
            })
            .map((task) => <TaskRow key={task.id} task={task} />)
        )}
      </div>
    </div>
  );
}
