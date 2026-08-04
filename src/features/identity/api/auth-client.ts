"use client";

import { createClient } from "@/lib/supabase/client";

/**
 * Thin wrapper around Supabase Auth calls for the browser. Every function
 * returns `{ errorKey }` on failure instead of throwing — `errorKey` maps
 * directly to `auth.errors.*` in the i18n dictionaries, so calling
 * components never need to parse Supabase's raw (English-only) error text.
 */

export type AuthResult = { errorKey: null } | { errorKey: string };

function mapAuthError(message: string): string {
  const msg = message.toLowerCase();
  if (msg.includes("invalid login credentials")) return "invalid_credentials";
  if (msg.includes("email not confirmed")) return "email_not_confirmed";
  if (msg.includes("already registered") || msg.includes("already exists")) return "email_taken";
  if (msg.includes("password") && (msg.includes("least") || msg.includes("short") || msg.includes("weak"))) {
    return "weak_password";
  }
  if (msg.includes("valid email") || msg.includes("invalid email")) return "invalid_email";
  return "generic";
}

export async function signInWithPassword(email: string, password: string): Promise<AuthResult> {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { errorKey: mapAuthError(error.message) };
  return { errorKey: null };
}

export interface SignUpInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  preferredLanguage: "es" | "en";
}

export async function signUpWithPassword(input: SignUpInput): Promise<AuthResult> {
  const supabase = createClient();
  const { error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
      data: {
        first_name: input.firstName,
        last_name: input.lastName,
        display_name: `${input.firstName} ${input.lastName}`.trim(),
        preferred_language: input.preferredLanguage,
      },
    },
  });
  if (error) return { errorKey: mapAuthError(error.message) };
  return { errorKey: null };
}

export async function requestPasswordReset(email: string): Promise<AuthResult> {
  const supabase = createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
  });
  // Deliberately do not distinguish "no such user" from success — confirming
  // or denying account existence to an unauthenticated caller is an account
  // enumeration risk.
  if (error) return { errorKey: mapAuthError(error.message) };
  return { errorKey: null };
}

export async function updatePassword(newPassword: string): Promise<AuthResult> {
  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { errorKey: mapAuthError(error.message) };
  return { errorKey: null };
}

export async function signOut(): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signOut();
}
