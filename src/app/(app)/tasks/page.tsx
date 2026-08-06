import { getTasks } from "@/features/tasks/api/get-tasks";
import { TasksList } from "@/features/tasks/components/tasks-list";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function TasksPage() {
  const tasks = await getTasks();
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Tareas</h1>
        <p className="text-sm text-muted-foreground">
          El trabajo operativo de tu negocio, en un solo lugar.
        </p>
      </div>
      <TasksList tasks={tasks} />
    </div>
  );
}
