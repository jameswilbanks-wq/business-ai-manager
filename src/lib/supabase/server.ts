import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { env } from "@/lib/env";
import type { Database } from "@/lib/supabase/database.types";

/**
 * Server-side Supabase client for Route Handlers, Server Actions, and
 * Server Components. Reads/writes the auth cookie via next/headers.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component with no request context to
            // mutate — safe to ignore when the proxy refreshes sessions.
          }
        },
      },
    }
  );
}

/**
 * Server-only client using the service role key. Bypasses Row Level
 * Security — restricted to trusted server contexts (background jobs,
 * webhooks). Never expose this client or its key to the browser. Returns
 * null until SUPABASE_SERVICE_ROLE_KEY is configured (not required for
 * Auth itself, only for future admin-level operations).
 */
export async function createServiceRoleClient() {
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }

  const { createClient: createSupabaseClient } = await import("@supabase/supabase-js");
  return createSupabaseClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
