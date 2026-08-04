"use client";

import * as React from "react";
import { useActionState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { loginAction } from "@/features/identity/api/auth-actions";
import { loginSchema, type LoginInput } from "@/features/identity/validation/auth-schemas";
import { useLocale } from "@/providers/locale-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/features/identity/components/password-input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/features/identity/components/field-error";

export function LoginForm() {
  const { t } = useLocale();
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(loginAction, null);

  const {
    register,
    formState: { errors },
    trigger,
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
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

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">{t.auth.password}</Label>
          <Link
            href="/forgot-password"
            className="text-xs font-medium text-primary hover:underline"
          >
            {t.auth.forgot_password}
          </Link>
        </div>
        <PasswordInput
          id="password"
          autoComplete="current-password"
          {...register("password")}
          aria-invalid={!!errors.password}
        />
        <FieldError errorKey={errors.password?.message} />
      </div>

      {state?.status === "error" ? <FieldError errorKey={state.message} /> : null}

      <Button type="submit" loading={isPending} className="mt-1">
        {isPending ? t.auth.submitting : t.auth.submit_login}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {t.auth.no_account}{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          {t.auth.create_one}
        </Link>
      </p>
    </form>
  );
}
