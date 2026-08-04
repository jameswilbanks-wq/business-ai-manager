-- ============================================================================
-- Order workflow refinement: mark which orders were AI-proposed from a
-- conversation (vs. manually created), so the UI can render the right
-- "AI suggestion" affordance instead of treating every draft the same.
-- ============================================================================

alter table public.orders
  add column if not exists ai_generated boolean not null default false;

-- Backfill: every existing draft order that's linked to a conversation was
-- seeded to represent "AI noticed this in the conversation and proposed an
-- order" — mark it accordingly so the UI can distinguish it from a plain
-- manually-created draft.
update public.orders
set ai_generated = true
where status = 'draft' and conversation_id is not null;
