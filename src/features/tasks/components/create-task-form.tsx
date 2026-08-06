"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createTaskAction } from "@/features/tasks/api/task-actions";

export function CreateTaskForm() {
  const [isPending, startTransition] = React.useTransition();
  const formRef = React.useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={(formData) =>
        startTransition(async () => {
          await createTaskAction(formData);
          formRef.current?.reset();
        })
      }
      className="flex flex-col gap-2 rounded-xl border border-border p-3 sm:flex-row sm:items-center"
    >
      <Input name="title" placeholder="Nueva tarea…" required className="flex-1" />
      <div className="flex gap-2">
        <Select name="priority" defaultValue="normal">
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Baja</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="high">Alta</SelectItem>
            <SelectItem value="urgent">Urgente</SelectItem>
          </SelectContent>
        </Select>
        <Input type="date" name="dueDate" className="w-40" />
        <Button type="submit" loading={isPending}>
          <Plus /> Agregar
        </Button>
      </div>
    </form>
  );
}
