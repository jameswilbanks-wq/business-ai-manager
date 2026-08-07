import "server-only";

/**
 * Sends the invitation email via Resend's HTTP API directly. Deliberately
 * NOT going through Supabase Auth's email system — that's configured for
 * auth flows only (confirmation/reset) and isn't reachable from app code.
 * Reads process.env directly at call time, same reasoning as
 * lib/ai/client.ts: a Cloudflare Secret can arrive after this module's
 * first evaluation, so a cached singleton would miss it.
 *
 * Returns whether the send succeeded — callers must NOT treat failure as
 * fatal, since the invitation itself (and its shareable link) already
 * exists in the database regardless of whether the email goes out.
 */
export async function sendInviteEmail(params: {
  to: string;
  businessName: string;
  inviterName: string;
  inviteUrl: string;
}): Promise<{ sent: boolean }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { sent: false };

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Business AI Manager <onboarding@resend.dev>",
        to: [params.to],
        subject: `${params.inviterName} te invitó a ${params.businessName}`,
        html: `
          <h2>Te invitaron a unirte a ${params.businessName}</h2>
          <p>${params.inviterName} te invitó a colaborar en Business AI Manager.</p>
          <p><a href="${params.inviteUrl}">Aceptar invitación</a></p>
          <p>Este enlace expira en 7 días.</p>
        `,
      }),
    });

    return { sent: response.ok };
  } catch (error) {
    console.error("[email/send-invite-email] failed:", error);
    return { sent: false };
  }
}
