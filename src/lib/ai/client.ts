import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { env } from "@/lib/env";

/**
 * The ONLY place in the codebase that touches the Anthropic SDK directly.
 * AI Playbook — "No business module communicates directly with AI
 * providers. All requests pass through the orchestrator." Business
 * domains call functions in features/ai/api/orchestrator.ts, which calls
 * this, never the SDK itself.
 */
export function getAnthropicClient(): Anthropic | null {
  if (!env.ANTHROPIC_API_KEY) return null;
  return new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
}

export const AI_MODEL = "claude-sonnet-4-6";
