import { describe, it, expect, beforeEach, vi } from "vitest";
import { rateLimit } from "@/app/lib/rate-limit";

// We need to reset the module between tests to clear the in-memory buckets
// Since the module uses a Map at module scope, we re-import fresh each time
describe("rateLimit", () => {
  beforeEach(() => {
    // Reset time mocking if any
    vi.useRealTimers();
  });

  it("allows requests under the limit", () => {
    const result = rateLimit("test-ip-1", { maxRequests: 5, windowMs: 1000 });
    expect(result.allowed).toBe(true);
  });

  it("allows exactly maxRequests requests", () => {
    const ip = "test-ip-exact-" + Date.now();
    for (let i = 0; i < 5; i++) {
      const result = rateLimit(ip, { maxRequests: 5, windowMs: 60_000 });
      expect(result.allowed).toBe(true);
    }
  });

  it("blocks the request after exceeding maxRequests", () => {
    const ip = "test-ip-block-" + Date.now();
    // Fill up the bucket
    for (let i = 0; i < 3; i++) {
      rateLimit(ip, { maxRequests: 3, windowMs: 60_000 });
    }
    // Next should be blocked
    const result = rateLimit(ip, { maxRequests: 3, windowMs: 60_000 });
    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.retryAfterMs).toBeGreaterThan(0);
      expect(result.retryAfterMs).toBeLessThanOrEqual(60_000);
    }
  });

  it("returns retryAfterMs when rate-limited", () => {
    const ip = "test-ip-retry-" + Date.now();
    for (let i = 0; i < 2; i++) {
      rateLimit(ip, { maxRequests: 2, windowMs: 10_000 });
    }
    const result = rateLimit(ip, { maxRequests: 2, windowMs: 10_000 });
    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(typeof result.retryAfterMs).toBe("number");
    }
  });

  it("uses different buckets for different IPs", () => {
    const ip1 = "ip-a-" + Date.now();
    const ip2 = "ip-b-" + Date.now();

    // Fill up ip1
    for (let i = 0; i < 2; i++) {
      rateLimit(ip1, { maxRequests: 2, windowMs: 60_000 });
    }

    // ip1 should be blocked
    expect(rateLimit(ip1, { maxRequests: 2, windowMs: 60_000 }).allowed).toBe(false);

    // ip2 should still be allowed
    expect(rateLimit(ip2, { maxRequests: 2, windowMs: 60_000 }).allowed).toBe(true);
  });

  it("uses default options when none provided", () => {
    const ip = "test-defaults-" + Date.now();
    const result = rateLimit(ip);
    expect(result.allowed).toBe(true);
  });
});
