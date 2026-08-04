"use client";

import { MailCheck } from "lucide-react";
import { AuthShell } from "@/features/identity/components/auth-shell";
import { useLocale } from "@/providers/locale-provider";

export function VerifyEmailView() {
  const { t } = useLocale();
  return (
    <AuthShell title={t.auth.verify_email_title}>
      <div className="flex flex-col items-center gap-3 py-2 text-center">
        <div className="flex size-11 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <MailCheck className="size-5" />
        </div>
        <p className="text-sm text-muted-foreground">{t.auth.verify_email_description}</p>
      </div>
    </AuthShell>
  );
}
