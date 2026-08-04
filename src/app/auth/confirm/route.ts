import { NextResponse, type NextRequest } from "next/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

/**
 * Handles Supabase email links: signup confirmation and password-recovery.
 * Uses verifyOtp(token_hash, type) rather than exchanging a PKCE `code` —
 * email clients that prefetch links can consume a single-use PKCE code
 * before the person ever clicks it, breaking the flow. token_hash-based
 * OTP verification does not have that failure mode.
 *
 * Expected URL shape (set via emailRedirectTo / redirectTo when the link is
 * sent): /auth/confirm?token_hash=...&type=signup|recovery&next=/dashboard
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/dashboard";

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ token_hash, type });

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=confirmation_failed`);
}
