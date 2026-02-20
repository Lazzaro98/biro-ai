/**
 * GET /api/metrics
 *
 * Returns in-memory metrics snapshot (request counts, latency, events, feedback).
 * In production, protect this endpoint with auth or restrict to internal network.
 */

import { getMetrics } from "@/app/lib/metrics";

export async function GET() {
  // In production, add auth check here:
  // const hdrs = await headers();
  // if (hdrs.get("authorization") !== `Bearer ${env.METRICS_TOKEN}`) {
  //   return Response.json({ error: "Unauthorized" }, { status: 401 });
  // }

  const data = getMetrics();

  return Response.json(data, {
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}
