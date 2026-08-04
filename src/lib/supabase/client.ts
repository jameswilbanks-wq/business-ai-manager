"use client";

import { createBrowserClient } from "@supabase/ssr";
import { env } from "@/lib/env";
import type { Database } from "@/lib/supabase/database.types";

/**
 * Browser-side Supabase client. Safe to import from client components.
 * One instance per call is intentional — createBrowserClient is cheap and
 * internally reuses the underlying connection.
 */
export function createClient() {
  return createBrowserClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
