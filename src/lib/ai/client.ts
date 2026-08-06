import "server-only";
import Anthropic from "@anthropic-ai/sdk";

/**
 * The ONLY place in the codebase that touches the Anthropic SDK directly.
 * AI Playbook — "No business module communicates directly with AI
 * providers. All requests pass through the orchestrator." Business
 * domains call functions in features/ai/api/orchestrator.ts, which calls
 * this, never the SDK itself.
 *
 * Deliberately reads process.env directly here, at call time, rather
 * than through the cached `env` singleton in lib/env.ts. That singleton
 * is computed once at module load (Worker cold-start) — fine for values
 * baked into the deployed script (like the Supabase vars in
 * wrangler.jsonc), but Cloudflare Secrets are injected by the runtime
 * only once an actual request arrives, which can be after that one-time
 * snapshot was already taken. Reading process.env fresh inside this
 * function (called per-request, from a Server Action) avoids that class
 * of stale-value bug entirely.
 *
 * Falls back to OpenNext's getCloudflareContext() if process.env doesn't
 * have it — community reports on whether Secrets (as opposed to plain
 * Variables) reliably populate process.env under this specific adapter
 * are inconsistent, so this covers both documented access patterns
 * rather than betting on one.
 */
export async function getAnthropicClient(): Promise<Anthropic | null> {
  let apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    try {
      const { getCloudflareContext } = await import("@opennextjs/cloudflare");
      const context = await getCloudflareContext({ async: true });
      apiKey = (context.env as Record<string, string | undefined>).ANTHROPIC_API_KEY;
    } catch {
      // Not running on Cloudflare (e.g. local `next dev`) — process.env
      // is already the correct source there, so nothing more to try.
    }
  }

  if (!apiKey) return null;
  return new Anthropic({ apiKey });
}

export const AI_MODEL = "claude-sonnet-5";
