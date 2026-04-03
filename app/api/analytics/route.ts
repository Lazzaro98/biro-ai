/**
 * POST /api/analytics
 *
 * Receives client-side analytics events.
 * Logs them server-side + increments metrics counters.
 * Tracks unique visitors via Upstash Redis.
 */

import { log } from "@/app/lib/logger";
import { trackEvent } from "@/app/lib/metrics";
import { trackUniqueVisitor } from "@/app/lib/stats";
import { headers } from "next/headers";

/** Simple hash to anonymize IP (no PII stored in Redis). */
async function hashIP(ip: string): Promise<string> {
  const data = new TextEncoder().encode(ip + "bezpapira-salt-2026");
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf).slice(0, 8))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

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

    // Track unique visitor on page_view events
    if (event === "page_view") {
      const hdrs = await headers();
      const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        hdrs.get("x-real-ip") || "unknown";
      const ipHash = await hashIP(ip);
      await trackUniqueVisitor(ipHash);
    }

    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}
