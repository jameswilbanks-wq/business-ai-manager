import { z } from "zod";

export const createBusinessSchema = z.object({
  name: z.string().trim().min(2, "name_too_short").max(120, "name_too_long"),
});
export type CreateBusinessInput = z.infer<typeof createBusinessSchema>;
