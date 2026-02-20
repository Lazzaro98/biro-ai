/**
 * In-memory sliding-window rate limiter.
 * Each IP gets a bucket of timestamps; expired entries are pruned on access.
 *
 * NOTE: This works per-process. In a multi-instance deploy (e.g. Vercel
 * serverless) each cold start has its own map — acceptable for soft limits.
 * For strict enforcement use Redis or Upstash.
 */

interface RateLimitEntry {
  timestamps: number[];
}

const buckets = new Map<string, RateLimitEntry>();

// Housekeeping every 60 s — drop stale IPs entirely
const CLEANUP_INTERVAL = 60_000;
let lastCleanup = Date.now();

function cleanup(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  const cutoff = now - windowMs;
  for (const [key, entry] of buckets) {
    entry.timestamps = entry.timestamps.filter((t) => t > cutoff);
    if (entry.timestamps.length === 0) buckets.delete(key);
  }
}

/**
 * Returns `{ allowed: true }` if the request is within limits,
 * or `{ allowed: false, retryAfterMs }` if rate-limited.
 */
export function rateLimit(
  ip: string,
  { maxRequests = 20, windowMs = 60_000 } = {},
): { allowed: true } | { allowed: false; retryAfterMs: number } {
  cleanup(windowMs);

  const now = Date.now();
  const cutoff = now - windowMs;
  let entry = buckets.get(ip);

  if (!entry) {
    entry = { timestamps: [] };
    buckets.set(ip, entry);
  }

  // Prune expired timestamps for this IP
  entry.timestamps = entry.timestamps.filter((t) => t > cutoff);

  if (entry.timestamps.length >= maxRequests) {
    const oldest = entry.timestamps[0];
    const retryAfterMs = oldest + windowMs - now;
    return { allowed: false, retryAfterMs };
  }

  entry.timestamps.push(now);
  return { allowed: true };
}
