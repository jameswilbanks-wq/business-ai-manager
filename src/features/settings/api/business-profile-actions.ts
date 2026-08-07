"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/features/identity/api/get-current-business";
import { businessProfileSchema } from "@/features/settings/validation/business-profile-schema";
import type { AuthActionResult } from "@/features/identity/types/auth";

export async function updateBusinessProfileAction(
  _prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const parsed = businessProfileSchema.safeParse({
    name: formData.get("name"),
    legalName: formData.get("legalName"),
    currency: formData.get("currency"),
    timezone: formData.get("timezone"),
    country: formData.get("country"),
    defaultLanguage: formData.get("defaultLanguage"),
  });

  if (!parsed.success) {
    return { status: "error", message: "invalid_business_profile" };
  }

  const currentBusiness = await getCurrentBusiness();
  if (!currentBusiness) {
    return { status: "error", message: "not_found" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("businesses")
    .update({
      name: parsed.data.name,
      legal_name: parsed.data.legalName || null,
      currency: parsed.data.currency.toUpperCase(),
      timezone: parsed.data.timezone,
      country: parsed.data.country || null,
      default_language: parsed.data.defaultLanguage,
    })
    .eq("id", currentBusiness.business.id);

  // RLS silently returns zero rows updated for non-Owner/Administrator
  // members rather than an error — surface that as a real failure so the
  // person isn't left thinking the save worked when nothing changed.
  if (error) {
    return { status: "error", message: "update_failed" };
  }

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { status: "success" };
}
