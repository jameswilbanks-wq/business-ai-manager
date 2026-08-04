import "server-only";
import { env } from "@/lib/env";

/**
 * Cloudflare R2 is the platform's primary object store (Cloud Architecture
 * — DEC-005: Cloudflare R2 for Primary Media Storage). This module defines
 * the intended interface only; no infrastructure is provisioned in M1.
 *
 * R2 is S3-compatible, so the eventual implementation wraps
 * `@aws-sdk/client-s3` pointed at the account's R2 endpoint. That dependency
 * is intentionally not installed yet to keep M1's install footprint minimal.
 */

export interface UploadObjectInput {
  key: string;
  body: Blob | Buffer | ReadableStream;
  contentType: string;
  tenantId: string;
}

export interface StoredObject {
  key: string;
  url: string;
  contentType: string;
  sizeBytes: number;
}

function assertConfigured(): void {
  if (
    !env.CLOUDFLARE_R2_ACCOUNT_ID ||
    !env.CLOUDFLARE_R2_ACCESS_KEY_ID ||
    !env.CLOUDFLARE_R2_SECRET_ACCESS_KEY ||
    !env.CLOUDFLARE_R2_BUCKET
  ) {
    throw new Error(
      "Cloudflare R2 is not configured. Set CLOUDFLARE_R2_* environment " +
        "variables (see docs/deployment/05_Environment_Variables.md) before " +
        "calling storage functions. R2 integration lands in a future milestone."
    );
  }
}

/** Uploads a file scoped to a tenant. Object keys are always tenant-prefixed. */
export async function uploadObject(_input: UploadObjectInput): Promise<StoredObject> {
  assertConfigured();
  throw new Error("uploadObject() is not implemented yet — placeholder for a future milestone.");
}

/** Returns a time-limited signed URL for a private object. */
export async function getSignedUrl(_key: string, _expiresInSeconds = 900): Promise<string> {
  assertConfigured();
  throw new Error("getSignedUrl() is not implemented yet — placeholder for a future milestone.");
}

/** Permanently deletes an object. Callers must check permissions upstream. */
export async function deleteObject(_key: string): Promise<void> {
  assertConfigured();
  throw new Error("deleteObject() is not implemented yet — placeholder for a future milestone.");
}
