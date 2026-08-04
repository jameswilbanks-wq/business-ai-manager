import { defineCloudflareConfig } from "@opennextjs/cloudflare";

/**
 * OpenNext configuration for the Cloudflare adapter (Cloud Architecture —
 * DEC-004: Cloudflare as Edge Platform). Defaults are fine for M1/Auth;
 * revisit for ISR caching (R2-backed cache) once pages need it.
 */
export default defineCloudflareConfig();
