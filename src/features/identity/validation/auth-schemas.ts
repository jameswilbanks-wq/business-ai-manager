import { z } from "zod";

/**
 * Validation messages are error *keys*, not display text — components
 * resolve them through the locale dictionary (auth.errors.*) so every
 * validation message is bilingual by construction, per Product Principle
 * "Build Once, Configure Forever" (no hardcoded user-facing strings).
 */

const email = z.string().trim().min(1, "required").email("invalid_email");

const password = z
  .string()
  .min(8, "password_too_short")
  .regex(/[a-z]/, "password_needs_lowercase")
  .regex(/[A-Z]/, "password_needs_uppercase")
  .regex(/[0-9]/, "password_needs_number");

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "required"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    displayName: z.string().trim().min(2, "name_too_short").max(80, "name_too_long"),
    email,
    password,
    confirmPassword: z.string().min(1, "required"),
    acceptTerms: z.literal(true, { message: "must_accept_terms" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "passwords_do_not_match",
  });
export type RegisterInput = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email,
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const updatePasswordSchema = z
  .object({
    password,
    confirmPassword: z.string().min(1, "required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "passwords_do_not_match",
  });
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
