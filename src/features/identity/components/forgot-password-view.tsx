"use client";

import { AuthShell } from "@/features/identity/components/auth-shell";
import { ForgotPasswordForm } from "@/features/identity/components/forgot-password-form";
import { useLocale } from "@/providers/locale-provider";

export function ForgotPasswordView() {
  const { t } = useLocale();
  return (
    <AuthShell title={t.auth.forgot_password_title} subtitle={t.auth.forgot_password_subtitle}>
      <ForgotPasswordForm />
    </AuthShell>
  );
}
