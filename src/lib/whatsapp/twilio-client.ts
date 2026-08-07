import "server-only";

/**
 * Direct REST calls to Twilio's API via fetch — deliberately not the
 * Twilio Node SDK, same reasoning as Resend: keeps this edge-runtime-safe
 * on Cloudflare Workers without betting on a heavier SDK's compatibility.
 *
 * Credentials are per-business (each business connects its own Twilio
 * WhatsApp sender — see communication_channels.config), not a single
 * platform-wide secret, since this is a multi-tenant product. For a
 * first real client this is one Twilio account's credentials stored on
 * their channel row; Twilio's subaccount-per-customer pattern (see their
 * ISV Tech Provider Program docs) is the right scaling step once there
 * are multiple paying businesses, not before.
 */

export interface TwilioWhatsAppConfig {
  accountSid: string;
  authToken: string;
  whatsappNumber: string; // E.164, e.g. "+14155238886" (without the "whatsapp:" prefix)
}

export async function sendWhatsAppMessage(
  config: TwilioWhatsAppConfig,
  toPhoneE164: string,
  body: string
): Promise<{ sent: boolean; error?: string }> {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`;
  const auth = btoa(`${config.accountSid}:${config.authToken}`);

  const params = new URLSearchParams({
    From: `whatsapp:${config.whatsappNumber}`,
    To: `whatsapp:${toPhoneE164}`,
    Body: body,
  });

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      return { sent: false, error: `${response.status}: ${errorBody}` };
    }

    return { sent: true };
  } catch (error) {
    return { sent: false, error: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * Validates that an inbound webhook request genuinely came from Twilio.
 * Twilio's algorithm: base64(HMAC-SHA1(authToken, url + sorted params
 * concatenated as key+value)). Implemented with Web Crypto (available in
 * Cloudflare Workers) rather than Node's crypto module or the Twilio SDK's
 * validateRequest helper, for the same edge-compatibility reasons as above.
 */
export async function validateTwilioSignature(
  authToken: string,
  url: string,
  params: Record<string, string>,
  signatureHeader: string | null
): Promise<boolean> {
  if (!signatureHeader) return false;

  const sortedKeys = Object.keys(params).sort();
  const data = sortedKeys.reduce((acc, key) => acc + key + params[key], url);

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(authToken),
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"]
  );
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  const computed = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)));

  return computed === signatureHeader;
}
