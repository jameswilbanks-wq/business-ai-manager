"use server";

import { createClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  updatePasswordSchema,
} from "@/features/identity/validation/auth-schemas";
import type { AuthActionResult } from "@/features/identity/types/auth";

/**
 * Server Actions for the Identity domain. Every action:
 *  1. Re-validates input server-side (never trust client validation alone —
 *     Engineering Handbook, "Security").
 *  2. Talks to Supabase Auth through the server client only.
 *  3. Returns a discriminated AuthActionResult instead of throwing, so
 *     client components can render inline errors without try/catch.
 */

function siteUrl(): string {
  return env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export async function loginAction(
  _prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { status: "error", message: "invalid_credentials" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    if (error.message.toLowerCase().includes("email not confirmed")) {
      return { status: "error", message: "email_not_confirmed" };
    }
    return { status: "error", message: "invalid_credentials" };
  }

  return { status: "success", redirectTo: "/dashboard" };
}

export async function registerAction(
  _prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const parsed = registerSchema.safeParse({
    displayName: formData.get("displayName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    acceptTerms: formData.get("acceptTerms") === "on",
  });
  if (!parsed.success) {
    return { status: "error", message: "invalid_registration" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      // Read by the on_auth_user_created trigger to seed the profile row.
      data: {
        display_name: parsed.data.displayName,
        preferred_language: "es",
      },
      emailRedirectTo: `${siteUrl()}/auth/confirm?next=/dashboard`,
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already registered")) {
      return { status: "error", message: "email_already_registered" };
    }
    return { status: "error", message: "registration_failed" };
  }

  // Supabase returns a user with an empty identities array when the email
  // is already registered but unconfirmed — surface the same message
  // rather than silently re-sending (avoids account enumeration ambiguity
  // while still being honest with the person who owns the address).
  if (data.user && data.user.identities && data.user.identities.length === 0) {
    return { status: "error", message: "email_already_registered" };
  }

  return { status: "success", redirectTo: "/verify-email" };
}

export async function logoutAction(): Promise<AuthActionResult> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return { status: "success", redirectTo: "/login" };
}

export async function requestPasswordResetAction(
  _prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { status: "error", message: "invalid_email" };
  }

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${siteUrl()}/auth/confirm?next=/update-password`,
  });

  // Always return success regardless of whether the address exists —
  // never reveal account existence through this endpoint's behavior.
  return { status: "success" };
}

export async function updatePasswordAction(
  _prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const parsed = updatePasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message ?? "invalid_password";
    return { status: "error", message: first };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "reset_link_expired" };
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    return { status: "error", message: "update_password_failed" };
  }

  return { status: "success", redirectTo: "/dashboard" };
}
