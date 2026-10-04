/**
 * Sliding-window rate limiter.
 *
 * This in-memory implementation protects a single server instance. On
 * serverless or multi-instance hosting, replace the store with a shared one
 * (e.g. Redis / Upstash) while keeping the same `rateLimit` signature.
 */

interface RateLimitOptions {
  /** Maximum requests allowed within the window. */
  limit: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

const hits = new Map<string, number[]>();
const MAX_KEYS = 10_000;

export function rateLimit(key: string, { limit, windowMs }: RateLimitOptions, now = Date.now()): RateLimitResult {
  const windowStart = now - windowMs;
  const recent = (hits.get(key) ?? []).filter((timestamp) => timestamp > windowStart);

  if (recent.length >= limit) {
    hits.set(key, recent);
    const retryAfterMs = recent[0] + windowMs - now;
    return { allowed: false, remaining: 0, retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)) };
  }

  recent.push(now);
  hits.set(key, recent);

  if (hits.size > MAX_KEYS) {
    for (const [storedKey, timestamps] of hits) {
      if (timestamps[timestamps.length - 1] <= windowStart) hits.delete(storedKey);
    }
  }

  return { allowed: true, remaining: limit - recent.length, retryAfterSeconds: 0 };
}
