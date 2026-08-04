"use server";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { currentBusinessCookieName } from "@/lib/business-context";
import { createBusinessSchema } from "@/features/identity/validation/business-schemas";
import type { AuthActionResult } from "@/features/identity/types/auth";

function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base || "negocio"}-${suffix}`;
}

export async function createBusinessAction(
  _prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const parsed = createBusinessSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return { status: "error", message: "invalid_business_name" };
  }

  const supabase = await createClient();
  const slug = slugify(parsed.data.name);

  const { data, error } = await supabase.rpc("create_business_with_owner", {
    business_name: parsed.data.name,
    business_slug: slug,
  });

  if (error || !data) {
    return { status: "error", message: "business_creation_failed" };
  }

  const cookieStore = await cookies();
  cookieStore.set(currentBusinessCookieName, data.id, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  return { status: "success", redirectTo: "/dashboard" };
}

/** Switches which business's data the shell displays. Called from the
 * business switcher dropdown — a plain server action invoked directly
 * (not a <form>), since it takes a single argument rather than FormData. */
export async function switchBusinessAction(businessId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(currentBusinessCookieName, businessId, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}
