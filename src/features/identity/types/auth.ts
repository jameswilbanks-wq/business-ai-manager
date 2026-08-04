export interface Profile {
  id: string;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  phone: string | null;
  preferredLanguage: "es" | "en";
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

export interface SessionUser {
  id: string;
  email: string | null;
  profile: Profile | null;
}

/** Discriminated result type so Server Actions never throw across the
 * server/client boundary — callers pattern-match on `status`. */
export type AuthActionResult =
  | { status: "success"; redirectTo?: string }
  | { status: "error"; message: string };
