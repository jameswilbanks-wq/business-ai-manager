"use client";

import { useActionState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createBusinessAction } from "@/features/identity/api/business-actions";
import {
  createBusinessSchema,
  type CreateBusinessInput,
} from "@/features/identity/validation/business-schemas";
import { useLocale } from "@/providers/locale-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/features/identity/components/field-error";

export function CreateBusinessForm() {
  const { t } = useLocale();
  const [state, formAction, isPending] = useActionState(createBusinessAction, null);

  const {
    register,
    formState: { errors },
    trigger,
  } = useForm<CreateBusinessInput>({
    resolver: zodResolver(createBusinessSchema),
    mode: "onBlur",
  });

  // On success, createBusinessAction redirects server-side (throws before
  // returning) — this component only ever sees a returned value on the
  // error path, so there's no client-side success branch to handle here.

  return (
    <form action={formAction} onSubmit={() => trigger()} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">{t.onboarding.business_name}</Label>
        <Input
          id="name"
          placeholder={t.onboarding.business_name_placeholder}
          {...register("name")}
          aria-invalid={!!errors.name}
        />
        <FieldError errorKey={errors.name?.message} />
      </div>

      {state?.status === "error" ? <FieldError errorKey={state.message} /> : null}

      <Button type="submit" loading={isPending} className="mt-1">
        {isPending ? t.onboarding.submitting : t.onboarding.submit}
      </Button>
    </form>
  );
}
