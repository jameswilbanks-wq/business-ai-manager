"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { requestPasswordResetAction } from "@/features/identity/api/auth-actions";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/features/identity/validation/auth-schemas";
import { useLocale } from "@/providers/locale-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/features/identity/components/field-error";
import { MailCheck } from "lucide-react";

export function ForgotPasswordForm() {
  const { t } = useLocale();
  const [state, formAction, isPending] = useActionState(requestPasswordResetAction, null);

  const {
    register,
    formState: { errors },
    trigger,
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onBlur",
  });

  if (state?.status === "success") {
    return (
      <div className="flex flex-col items-center gap-3 py-2 text-center">
        <div className="flex size-11 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <MailCheck className="size-5" />
        </div>
        <p className="text-sm font-medium">{t.auth.reset_email_sent_title}</p>
        <p className="text-sm text-muted-foreground">{t.auth.reset_email_sent_description}</p>
        <Link href="/login" className="mt-2 text-sm font-medium text-primary hover:underline">
          {t.auth.back_to_login}
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} onSubmit={() => trigger()} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">{t.auth.email}</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          {...register("email")}
          aria-invalid={!!errors.email}
        />
        <FieldError errorKey={errors.email?.message} />
      </div>

      <Button type="submit" loading={isPending} className="mt-1">
        {isPending ? t.auth.submitting : t.auth.send_reset_link}
      </Button>

      <Link href="/login" className="text-center text-sm font-medium text-primary hover:underline">
        {t.auth.back_to_login}
      </Link>
    </form>
  );
}
