"use client";

import { AuthShell } from "@/features/identity/components/auth-shell";
import { RegisterForm } from "@/features/identity/components/register-form";
import { useLocale } from "@/providers/locale-provider";

export function RegisterView() {
  const { t } = useLocale();
  return (
    <AuthShell title={t.auth.sign_up} subtitle={t.auth.sign_up_subtitle}>
      <RegisterForm />
    </AuthShell>
  );
}
