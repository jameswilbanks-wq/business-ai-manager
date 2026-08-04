"use client";

import { useLocale } from "@/providers/locale-provider";

type AuthErrorKey = keyof ReturnType<typeof useLocale>["t"]["auth"]["errors"];

/** Resolves a validation/action error key (e.g. "invalid_email") through
 * the locale dictionary. Falls back to the raw key if it's ever unmapped,
 * so a missing translation is visible instead of silently blank. */
export function FieldError({ errorKey }: { errorKey?: string }) {
  const { t } = useLocale();
  if (!errorKey) return null;

  const message =
    t.auth.errors[errorKey as AuthErrorKey] ?? t.auth.errors.unexpected;

  return <p className="mt-1 text-xs text-destructive">{message}</p>;
}
