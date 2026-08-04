# middleware/

This project does **not** use Next.js Proxy/Middleware (`src/proxy.ts` /
`src/middleware.ts`). Next.js 16's `proxy.ts` is locked to the Node.js
runtime with no edge option, and the Cloudflare OpenNext adapter (Cloud
Architecture — DEC-004: Cloudflare as Edge Platform) does not yet support
Node.js middleware — see
https://github.com/cloudflare/workers-sdk/issues/13755 (open as of this
writing).

Route protection instead lives in each route group's layout/pages:
- `src/app/(app)/layout.tsx` redirects unauthenticated visitors to `/login`.
- `src/app/(auth)/*/page.tsx` each redirect an already-authenticated visitor
  to `/dashboard` (except `/update-password`, which requires a session).

This folder is kept as a placeholder in case Cloudflare's adapter gains
Node.js middleware support later, or the app moves off Cloudflare — at
that point a real `src/proxy.ts` could be reintroduced as defense in depth
and would compose helpers from here.
