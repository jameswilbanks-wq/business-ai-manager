"use client";

import Link from "next/link";
import { AuthShell } from "@/features/identity/components/auth-shell";
import { CreateBusinessForm } from "@/features/identity/components/create-business-form";
import { useLocale } from "@/providers/locale-provider";

export function OnboardingView({ hasExistingBusiness }: { hasExistingBusiness: boolean }) {
  const { t } = useLocale();
  return (
    <AuthShell
      title={t.onboarding.title}
      subtitle={t.onboarding.subtitle}
      footer={
        hasExistingBusiness ? (
          <Link href="/dashboard" className="font-medium text-primary hover:underline">
            {t.onboarding.back_to_dashboard}
          </Link>
        ) : undefined
      }
    >
      <CreateBusinessForm />
    </AuthShell>
  );
}
