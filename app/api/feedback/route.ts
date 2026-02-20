/**
 * Feedback API — stores thumbs up/down + optional comment.
 *
 * In production you'd send this to a database, analytics service,
 * or a Google Sheet. For now we log it server-side so it's visible
 * in Vercel function logs / terminal output.
 */

import { log } from "@/app/lib/logger";
import { trackFeedback, recordRequest } from "@/app/lib/metrics";

export async function POST(req: Request) {
  const startTime = Date.now();
  try {
    const body = await req.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return Response.json({ error: "Invalid body" }, { status: 400 });
    }

    const { msgId, value, comment } = body;

    if (!msgId || typeof msgId !== "string") {
      return Response.json({ error: "Missing msgId" }, { status: 400 });
    }
    if (value !== "up" && value !== "down") {
      return Response.json({ error: "value must be 'up' or 'down'" }, { status: 400 });
    }
    if (comment && typeof comment !== "string") {
      return Response.json({ error: "comment must be a string" }, { status: 400 });
    }

    // Truncate comment for safety
    const safeComment = comment ? comment.slice(0, 500) : undefined;

    // Log structured event
    log.info("feedback.received", {
      msgId,
      value,
      hasComment: !!safeComment,
    });
    trackFeedback(value);
    recordRequest("/api/feedback", Date.now() - startTime, false);

    return Response.json({ ok: true });
  } catch (err: any) {
    log.error("feedback.error", { error: err?.message ?? String(err) });
    recordRequest("/api/feedback", Date.now() - startTime, true);
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}
