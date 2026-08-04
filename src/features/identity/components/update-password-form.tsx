"use client";

import * as React from "react";
import { useActionState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { updatePasswordAction } from "@/features/identity/api/auth-actions";
import {
  updatePasswordSchema,
  type UpdatePasswordInput,
} from "@/features/identity/validation/auth-schemas";
import { useLocale } from "@/providers/locale-provider";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/features/identity/components/password-input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/features/identity/components/field-error";

export function UpdatePasswordForm() {
  const { t } = useLocale();
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(updatePasswordAction, null);

  const {
    register,
    formState: { errors },
    trigger,
  } = useForm<UpdatePasswordInput>({
    resolver: zodResolver(updatePasswordSchema),
    mode: "onBlur",
  });

  React.useEffect(() => {
    if (state?.status === "success" && state.redirectTo) {
      router.push(state.redirectTo);
      router.refresh();
    }
  }, [state, router]);

  return (
    <form action={formAction} onSubmit={() => trigger()} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">{t.auth.password}</Label>
        <PasswordInput
          id="password"
          autoComplete="new-password"
          {...register("password")}
          aria-invalid={!!errors.password}
        />
        <p className="text-xs text-muted-foreground">{t.auth.password_requirements}</p>
        <FieldError errorKey={errors.password?.message} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="confirmPassword">{t.auth.confirm_password}</Label>
        <PasswordInput
          id="confirmPassword"
          autoComplete="new-password"
          {...register("confirmPassword")}
          aria-invalid={!!errors.confirmPassword}
        />
        <FieldError errorKey={errors.confirmPassword?.message} />
      </div>

      {state?.status === "error" ? <FieldError errorKey={state.message} /> : null}

      <Button type="submit" loading={isPending} className="mt-1">
        {isPending ? t.auth.submitting : t.auth.submit_update_password}
      </Button>
    </form>
  );
}
