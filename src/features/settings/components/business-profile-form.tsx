"use client";

import { useActionState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateBusinessProfileAction } from "@/features/settings/api/business-profile-actions";
import {
  businessProfileSchema,
  type BusinessProfileInput,
} from "@/features/settings/validation/business-profile-schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FieldError } from "@/features/identity/components/field-error";
import type { Business } from "@/features/identity/types/business";

export function BusinessProfileForm({ business }: { business: Business }) {
  const [state, formAction, isPending] = useActionState(updateBusinessProfileAction, null);

  const {
    register,
    formState: { errors },
    trigger,
    watch,
    setValue,
  } = useForm<BusinessProfileInput>({
    resolver: zodResolver(businessProfileSchema),
    mode: "onBlur",
    defaultValues: {
      name: business.name,
      legalName: business.legalName ?? "",
      currency: business.currency,
      timezone: business.timezone,
      country: business.country ?? "",
      defaultLanguage: business.defaultLanguage,
    },
  });

  return (
    <form action={formAction} onSubmit={() => trigger()} className="flex flex-col gap-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Nombre del negocio</Label>
          <Input id="name" {...register("name")} aria-invalid={!!errors.name} />
          <FieldError errorKey={errors.name?.message} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="legalName">Razón social</Label>
          <Input id="legalName" {...register("legalName")} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="currency">Moneda</Label>
          <Input id="currency" {...register("currency")} maxLength={3} className="uppercase" />
          <FieldError errorKey={errors.currency?.message} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="country">País</Label>
          <Input id="country" {...register("country")} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="timezone">Zona horaria</Label>
          <Input id="timezone" {...register("timezone")} />
          <FieldError errorKey={errors.timezone?.message} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="defaultLanguage">Idioma predeterminado</Label>
          <Select
            value={watch("defaultLanguage")}
            onValueChange={(v) => setValue("defaultLanguage", v as "es" | "en")}
          >
            <SelectTrigger id="defaultLanguage">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="es">Español</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
          <input type="hidden" {...register("defaultLanguage")} />
        </div>
      </div>

      {state?.status === "error" ? <FieldError errorKey={state.message} /> : null}
      {state?.status === "success" ? (
        <p className="text-sm text-success-foreground">Cambios guardados.</p>
      ) : null}

      <Button type="submit" loading={isPending} className="self-start">
        Guardar cambios
      </Button>
    </form>
  );
}
