"use client";

import { AuthShell } from "@/features/identity/components/auth-shell";
import { CreateBusinessForm } from "@/features/identity/components/create-business-form";
import { useLocale } from "@/providers/locale-provider";

export function OnboardingView() {
  const { t } = useLocale();
  return (
    <AuthShell title={t.onboarding.title} subtitle={t.onboarding.subtitle}>
      <CreateBusinessForm />
    </AuthShell>
  );
}
