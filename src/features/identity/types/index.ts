/** Identity domain types — mirrors the `profiles` table (Identity Domain Schema). */
export interface Profile {
  id: string;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  phone: string | null;
  preferredLanguage: "es" | "en";
  timezone: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser {
  id: string;
  email: string;
  emailConfirmedAt: string | null;
}
