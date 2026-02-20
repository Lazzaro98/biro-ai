/**
 * POST /api/analytics
 *
 * Receives client-side analytics events.
 * Logs them server-side + increments metrics counters.
 */

import { log } from "@/app/lib/logger";
import { trackEvent } from "@/app/lib/metrics";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object" || !body.event) {
      return Response.json({ error: "Invalid event" }, { status: 400 });
    }

    const event = String(body.event).slice(0, 100);
    const url = typeof body.url === "string" ? body.url.slice(0, 200) : undefined;

    log.info("analytics.event", { event, url });
    trackEvent(`client.${event}`);

    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}
