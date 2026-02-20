/**
 * In-memory metrics store.
 *
 * Tracks request counts, latency histograms, and event counters.
 * Data resets on cold-start (stateless). For persistent metrics,
 * emit to an external service (Datadog, Prometheus, etc.)
 *
 * Exposed via GET /api/metrics (protected in production).
 */

interface RequestMetric {
  count: number;
  errors: number;
  totalMs: number;
  minMs: number;
  maxMs: number;
}

interface Metrics {
  startedAt: string;
  requests: Record<string, RequestMetric>;
  events: Record<string, number>;
  feedback: { up: number; down: number };
}

const metrics: Metrics = {
  startedAt: new Date().toISOString(),
  requests: {},
  events: {},
  feedback: { up: 0, down: 0 },
};

/** Record an API request duration + success/failure */
export function recordRequest(
  route: string,
  durationMs: number,
  isError: boolean,
) {
  if (!metrics.requests[route]) {
    metrics.requests[route] = {
      count: 0,
      errors: 0,
      totalMs: 0,
      minMs: Infinity,
      maxMs: 0,
    };
  }
  const r = metrics.requests[route];
  r.count++;
  if (isError) r.errors++;
  r.totalMs += durationMs;
  r.minMs = Math.min(r.minMs, durationMs);
  r.maxMs = Math.max(r.maxMs, durationMs);
}

/** Increment a named event counter */
export function trackEvent(name: string, count = 1) {
  metrics.events[name] = (metrics.events[name] || 0) + count;
}

/** Record feedback vote */
export function trackFeedback(value: "up" | "down") {
  metrics.feedback[value]++;
}

/** Get a snapshot of all metrics (for the /api/metrics endpoint) */
export function getMetrics(): Metrics & { uptimeMs: number } {
  return {
    ...metrics,
    uptimeMs: Date.now() - new Date(metrics.startedAt).getTime(),
    // Fix Infinity serialization
    requests: Object.fromEntries(
      Object.entries(metrics.requests).map(([k, v]) => [
        k,
        { ...v, minMs: v.minMs === Infinity ? 0 : v.minMs },
      ]),
    ),
  };
}
