# features/

Feature-first (domain-driven) modules. Each folder below maps 1:1 to a
Business Domain defined in the Architecture Playbook / Domain Model.

Every feature owns:

- `components/` — UI local to this domain only
- `hooks/` — React hooks local to this domain
- `services/` — business/orchestration logic (calls `api/`, applies rules)
- `types/` — TypeScript types and interfaces for this domain's entities
- `validation/` — Zod schemas for this domain's forms and API payloads
- `api/` — data-fetching functions (Route Handler / Supabase calls)
- `state/` — client state local to this domain (Zustand stores, if needed)

Cross-domain shared UI belongs in `src/components/shared`, not here.
Domains communicate through events/public interfaces, never by importing
each other's internals directly — see Architecture Playbook, "Domain Rules".

No feature module is implemented yet. Each is scaffolded and empty, ready
for its milestone per the Development Roadmap.
