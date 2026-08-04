"use client";

import * as React from "react";
import { useActionState } from "react";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { registerAction } from "@/features/identity/api/auth-actions";
import {
  registerSchema,
  type RegisterInput,
} from "@/features/identity/validation/auth-schemas";
import { useLocale } from "@/providers/locale-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/features/identity/components/password-input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldError } from "@/features/identity/components/field-error";

export function RegisterForm() {
  const { t } = useLocale();
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(registerAction, null);

  const {
    register,
    control,
    formState: { errors },
    trigger,
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
    defaultValues: { acceptTerms: false as unknown as true },
  });

  React.useEffect(() => {
    if (state?.status === "success" && state.redirectTo) {
      router.push(state.redirectTo);
    }
  }, [state, router]);

  return (
    <form action={formAction} onSubmit={() => trigger()} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="displayName">{t.auth.display_name}</Label>
        <Input
          id="displayName"
          autoComplete="name"
          {...register("displayName")}
          aria-invalid={!!errors.displayName}
        />
        <FieldError errorKey={errors.displayName?.message} />
      </div>

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

      <div className="flex flex-col gap-1.5">
        <div className="flex items-start gap-2">
          <Controller
            name="acceptTerms"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="acceptTerms"
                name="acceptTerms"
                className="mt-0.5"
                checked={field.value === true}
                onCheckedChange={(checked) => field.onChange(checked === true)}
              />
            )}
          />
          <Label htmlFor="acceptTerms" className="font-normal leading-snug">
            {t.auth.accept_terms}
          </Label>
        </div>
        <FieldError errorKey={errors.acceptTerms?.message} />
      </div>

      {state?.status === "error" ? <FieldError errorKey={state.message} /> : null}

      <Button type="submit" loading={isPending} className="mt-1">
        {isPending ? t.auth.submitting : t.auth.submit_register}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {t.auth.have_account}{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          {t.auth.sign_in_link}
        </Link>
      </p>
    </form>
  );
}
