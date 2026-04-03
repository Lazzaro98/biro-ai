/**
 * Persistent analytics counters backed by Upstash Redis.
 *
 * Tracks three public stats:
 *   - stats:visitors   — unique visitors (by IP hash, daily dedup)
 *   - stats:checklists — total checklists generated
 *   - stats:chats      — total chat conversations started
 *
 * If UPSTASH_REDIS_REST_URL / TOKEN are not set, falls back to in-memory
 * (same behaviour as before — numbers reset on cold start).
 */

import { Redis } from "@upstash/redis";
import { log } from "./logger";

/* ── Redis client (lazy singleton) ── */

let _redis: Redis | null = null;

function getRedis(): Redis | null {
  if (_redis) return _redis;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    log.warn("stats", { msg: "UPSTASH_REDIS_REST_URL/TOKEN not set — using in-memory fallback" });
    return null;
  }

  _redis = new Redis({ url, token });
  return _redis;
}

/* ── In-memory fallback ── */
const memCounters: Record<string, number> = {
  "stats:visitors": 0,
  "stats:checklists": 0,
  "stats:chats": 0,
};

/* ── Keys ── */
export const STAT_KEYS = {
  visitors: "stats:visitors",
  checklists: "stats:checklists",
  chats: "stats:chats",
} as const;

/* ── Public API ── */

/** Increment a stat counter by `amount` (default 1). */
export async function incrementStat(
  key: (typeof STAT_KEYS)[keyof typeof STAT_KEYS],
  amount = 1,
): Promise<void> {
  const redis = getRedis();
  if (redis) {
    try {
      await redis.incrby(key, amount);
    } catch (err) {
      log.error("stats.increment", { key, error: String(err) });
      // Fallback to memory if Redis fails
      memCounters[key] = (memCounters[key] || 0) + amount;
    }
  } else {
    memCounters[key] = (memCounters[key] || 0) + amount;
  }
}

/**
 * Track a unique visitor. Uses a daily deduplication set so the same
 * IP only counts once per day. The visitor counter is incremented
 * only if the IP hasn't been seen today.
 */
export async function trackUniqueVisitor(ipHash: string): Promise<void> {
  const redis = getRedis();
  const today = new Date().toISOString().slice(0, 10); // "2026-04-04"
  const dedupKey = `dedup:visitors:${today}`;

  if (redis) {
    try {
      // SADD returns 1 if the member was added (new), 0 if already existed
      const added = await redis.sadd(dedupKey, ipHash);
      if (added === 1) {
        await redis.incr(STAT_KEYS.visitors);
        // Expire dedup set after 48h to save memory
        await redis.expire(dedupKey, 48 * 60 * 60);
      }
    } catch (err) {
      log.error("stats.trackVisitor", { error: String(err) });
    }
  } else {
    // In-memory: simple increment (no dedup in fallback mode)
    memCounters[STAT_KEYS.visitors] = (memCounters[STAT_KEYS.visitors] || 0) + 1;
  }
}

/** Get all three stat counters. */
export async function getStats(): Promise<{
  visitors: number;
  checklists: number;
  chats: number;
}> {
  const redis = getRedis();

  if (redis) {
    try {
      const [visitors, checklists, chats] = await redis.mget<
        [number | null, number | null, number | null]
      >(STAT_KEYS.visitors, STAT_KEYS.checklists, STAT_KEYS.chats);

      return {
        visitors: visitors ?? 0,
        checklists: checklists ?? 0,
        chats: chats ?? 0,
      };
    } catch (err) {
      log.error("stats.getStats", { error: String(err) });
    }
  }

  return {
    visitors: memCounters[STAT_KEYS.visitors] || 0,
    checklists: memCounters[STAT_KEYS.checklists] || 0,
    chats: memCounters[STAT_KEYS.chats] || 0,
  };
}
