"use client";

import { AuthShell } from "@/features/identity/components/auth-shell";
import { LoginForm } from "@/features/identity/components/login-form";
import { useLocale } from "@/providers/locale-provider";

export function LoginView() {
  const { t } = useLocale();
  return (
    <AuthShell title={t.auth.sign_in} subtitle={t.auth.sign_in_subtitle}>
      <LoginForm />
    </AuthShell>
  );
}
