import { createHash, timingSafeEqual } from 'crypto';

/**
 * Flutterwave sends the webhook secret in the `verif-hash` header.
 * Compare using a constant-time check. Set FLW_SECRET_HASH in production.
 */
export function verifyFlutterwaveWebhookSecret(
  receivedHash: string | undefined,
  secret: string | undefined
): boolean {
  if (!receivedHash || !secret) return false;
  const a = Buffer.from(receivedHash.trim(), 'utf8');
  const b = Buffer.from(secret.trim(), 'utf8');
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function sha256Hex(body: string): string {
  return createHash('sha256').update(body, 'utf8').digest('hex');
}
