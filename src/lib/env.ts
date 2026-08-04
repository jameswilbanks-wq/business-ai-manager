import { z } from "zod";

/**
 * Environment variable contract for the whole application (Operating Manual
 * — "Never trust client input", Cloud Architecture — "Secrets Management").
 * Fails fast at boot with a clear message instead of surfacing cryptic
 * undefined-value errors deep inside a request.
 *
 * NEXT_PUBLIC_* vars are readable in the browser; everything else is
 * server-only and must never be imported from a "use client" module.
 *
 * `optionalString()` treats an empty string the same as "not set" — local
 * .env files commonly declare unused keys as `KEY=""` as documentation
 * placeholders (see .env.example), and that should not fail validation.
 */
function optionalString() {
  return z
    .string()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined));
}

const clientSchema = z.object({
  // Required as of the Authentication milestone — the app now connects to a
  // real Supabase project (see docs/deployment/05_Environment_Variables.md).
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
});

const serverSchema = clientSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY: optionalString(),
  OPENAI_API_KEY: optionalString(),
  ANTHROPIC_API_KEY: optionalString(),
  CLOUDFLARE_R2_ACCOUNT_ID: optionalString(),
  CLOUDFLARE_R2_ACCESS_KEY_ID: optionalString(),
  CLOUDFLARE_R2_SECRET_ACCESS_KEY: optionalString(),
  CLOUDFLARE_R2_BUCKET: optionalString(),
  WHATSAPP_BUSINESS_TOKEN: optionalString(),
  WHATSAPP_WEBHOOK_VERIFY_TOKEN: optionalString(),
});

export type ClientEnv = z.infer<typeof clientSchema>;
export type ServerEnv = z.infer<typeof serverSchema>;

function parseEnv(): ServerEnv {
  const result = serverSchema.safeParse(process.env);
  if (!result.success) {
    console.error(
      "❌ Invalid environment variables:",
      result.error.flatten().fieldErrors
    );
    throw new Error("Invalid environment variables. See console output above.");
  }
  return result.data;
}

export const env = parseEnv();
