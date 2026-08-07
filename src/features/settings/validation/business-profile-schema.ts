import { z } from "zod";

export const businessProfileSchema = z.object({
  name: z.string().trim().min(2, "name_too_short").max(120, "name_too_long"),
  legalName: z.string().trim().max(160).optional().or(z.literal("")),
  currency: z.string().trim().length(3, "invalid_currency"),
  timezone: z.string().trim().min(1, "required"),
  country: z.string().trim().max(80).optional().or(z.literal("")),
  defaultLanguage: z.enum(["es", "en"]),
});
export type BusinessProfileInput = z.infer<typeof businessProfileSchema>;
