import type { ReactNode } from "react";

// See (app)/layout.tsx for why this matters — every page in this group
// does a live session check and must never serve a cached result.
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Unauthenticated route group. No AppShell here (no sidebar/topbar).
 *
 * Route protection lives per-page rather than in Proxy/Middleware: Next.js
 * 16's proxy.ts is locked to the Node.js runtime with no edge option, and
 * the Cloudflare OpenNext adapter (Cloud Architecture — DEC-004) does not
 * yet support Node.js middleware (see
 * https://github.com/cloudflare/workers-sdk/issues/13755, open as of this
 * writing). Each page below does its own redirect check server-side —
 * see login/register/forgot-password/verify-email/page.tsx.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
