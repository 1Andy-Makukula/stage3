/**
 * Sliding-window rate limiter for failed handshake attempts per IP.
 * For production at scale, use Redis with the same key: `handshake:fail:${ip}`.
 */

const WINDOW_MS = 60_000;
const MAX_FAILS_PER_WINDOW = 5;

type Bucket = { windowStart: number; fails: number };

const buckets = new Map<string, Bucket>();

export function recordHandshakeFailure(ip: string): { allowed: boolean; retryAfterSec?: number } {
  const now = Date.now();
  let b = buckets.get(ip);
  if (!b || now - b.windowStart >= WINDOW_MS) {
    b = { windowStart: now, fails: 0 };
    buckets.set(ip, b);
  }
  b.fails += 1;
  if (b.fails > MAX_FAILS_PER_WINDOW) {
    const retryAfterSec = Math.ceil((b.windowStart + WINDOW_MS - now) / 1000);
    return { allowed: false, retryAfterSec: Math.max(1, retryAfterSec) };
  }
  return { allowed: true };
}

export function resetHandshakeFailures(ip: string): void {
  buckets.delete(ip);
}
