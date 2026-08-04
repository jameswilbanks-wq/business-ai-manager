import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { SessionUser } from "@/features/identity/types/auth";

/**
 * Resolves the current session's user + profile in one call, for use in
 * Server Components (the (app) layout, in particular). Returns null when
 * there is no active session — callers decide whether that means "redirect
 * to /login" (the layout does) or "render a logged-out state".
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profileRow } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return {
    id: user.id,
    email: user.email ?? null,
    profile: profileRow
      ? {
          id: profileRow.id,
          firstName: profileRow.first_name,
          lastName: profileRow.last_name,
          displayName: profileRow.display_name,
          avatarUrl: profileRow.avatar_url,
          phone: profileRow.phone,
          preferredLanguage: profileRow.preferred_language,
          timezone: profileRow.timezone,
          createdAt: profileRow.created_at,
          updatedAt: profileRow.updated_at,
        }
      : null,
  };
}
