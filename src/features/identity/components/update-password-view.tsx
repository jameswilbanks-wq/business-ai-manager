"use client";

import { AuthShell } from "@/features/identity/components/auth-shell";
import { UpdatePasswordForm } from "@/features/identity/components/update-password-form";
import { useLocale } from "@/providers/locale-provider";

export function UpdatePasswordView() {
  const { t } = useLocale();
  return (
    <AuthShell title={t.auth.update_password_title} subtitle={t.auth.update_password_subtitle}>
      <UpdatePasswordForm />
    </AuthShell>
  );
}
