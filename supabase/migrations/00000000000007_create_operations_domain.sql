-- ============================================================================
-- Operations Domain — Tasks
-- Ref: Architecture Playbook — Operations Domain ("Owns: Tasks, Calendar,
--      Reminders, Approvals"). Calendar/Reminders/Approvals are future
--      scope — this covers Tasks, including the polymorphic link back to
--      whatever record a task originated from (Product Glossary — "Task:
--      ... Related Records").
-- ============================================================================

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'done', 'cancelled')),
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high', 'urgent')),
  due_date date,
  assigned_to_name text,
  related_type text check (related_type in ('conversation', 'order', 'customer')),
  related_id uuid,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tasks_related_pair_check check (
    (related_type is null and related_id is null) or
    (related_type is not null and related_id is not null)
  )
);

create index if not exists idx_tasks_business_id on public.tasks (business_id);
create index if not exists idx_tasks_status on public.tasks (business_id, status);
create index if not exists idx_tasks_due_date on public.tasks (due_date);
create index if not exists idx_tasks_related on public.tasks (related_type, related_id);

drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at
  before update on public.tasks
  for each row
  execute function public.set_updated_at();

alter table public.tasks enable row level security;

drop policy if exists "Members can view their business's tasks" on public.tasks;
create policy "Members can view their business's tasks"
  on public.tasks for select
  using (public.is_business_member(business_id));

drop policy if exists "Members can manage their business's tasks" on public.tasks;
create policy "Members can manage their business's tasks"
  on public.tasks for all
  using (public.is_business_member(business_id))
  with check (public.is_business_member(business_id));
