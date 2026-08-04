# Business AI Manager

An AI-first Business Operating System for WhatsApp-first businesses.

> **Status:** M1 — Project Bootstrap. No business modules are implemented
> yet; this is the permanent application foundation every future feature
> builds on top of. See `docs/` in the parent project for the full
> Constitution, Playbooks, and Roadmap.

## Stack

Next.js (App Router) · React · TypeScript (strict) · Tailwind CSS ·
Radix UI primitives · TanStack Query · React Hook Form · Zod ·
Supabase (Auth / Postgres / Realtime, not yet connected) ·
Cloudflare R2 + Workers (not yet connected)

## Getting started

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open http://localhost:3000 — it redirects to `/dashboard`, which renders
inside the permanent app shell (sidebar, topbar, command palette ⌘K,
mobile bottom nav).

## Scripts

```bash
pnpm dev        # start the dev server
pnpm build      # production build
pnpm start      # run the production build
pnpm lint       # ESLint
pnpm typecheck  # tsc --noEmit
```

## Project structure

```
src/
├── app/                 # Next.js routes only — no business logic here
│   └── (app)/           # authenticated route group, wrapped by AppShell
├── features/            # feature-first domain modules (see features/README.md)
├── components/
│   ├── ui/               # design system primitives (Button, Card, Dialog, ...)
│   ├── shell/             # app shell (Sidebar, Topbar, CommandPalette, ...)
│   └── shared/            # cross-domain composites (EmptyState, DataGrid, ...)
├── providers/            # Theme / Query / Locale composition root
├── lib/
│   ├── supabase/          # browser + server Supabase clients (inert until M2)
│   ├── cloudflare/         # R2 storage interface (inert until later milestone)
│   ├── i18n/               # es/en dictionaries, Spanish default
│   └── env.ts              # zod-validated environment contract
├── hooks/ · services/ · types/ · utils/ · styles/ · tests/
└── middleware.ts          # Supabase session refresh (inert until M2)

workers/                  # Cloudflare Workers (placeholder, not deployed)
```

## Design system

All UI primitives are hand-authored under `src/components/ui` following the
shadcn/ui composition pattern (Radix primitives + `class-variance-authority`
+ Tailwind), rather than fetched via the shadcn CLI. Design tokens live in
`src/app/globals.css` as CSS variables (`--background`, `--primary`, etc.)
mapped through a Tailwind v4 `@theme inline` block — change a token there to
retheme the whole app.

## Localization

Spanish is the default and authoritative language (see Project Constitution).
English is available via the topbar language switcher. Dictionaries live at
`src/lib/i18n/dictionaries/{es,en}.json`; never hardcode user-facing strings.

## What's intentionally not here yet

Per the Current Sprint scope: WhatsApp integration, Customers, Orders,
Inventory, Tasks, AI, Analytics, Notifications, Reports, and Supabase/
Cloudflare live infrastructure. Their nav destinations exist and render a
"coming soon" placeholder so the shell is fully navigable today.
