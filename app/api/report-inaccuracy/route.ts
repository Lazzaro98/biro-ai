import { log } from "@/app/lib/logger";
import { recordRequest, trackEvent } from "@/app/lib/metrics";

export async function POST(req: Request) {
  const startTime = Date.now();
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return Response.json({ error: "Invalid body" }, { status: 400 });
    }

    const msgId = typeof body.msgId === "string" ? body.msgId.slice(0, 120) : "";
    const flowId = typeof body.flowId === "string" ? body.flowId.slice(0, 80) : undefined;
    const reason = typeof body.reason === "string" ? body.reason.trim().slice(0, 500) : "";
    const messageText = typeof body.messageText === "string" ? body.messageText.slice(0, 2000) : undefined;
    const url = typeof body.url === "string" ? body.url.slice(0, 200) : undefined;

    if (!msgId) {
      return Response.json({ error: "Missing msgId" }, { status: 400 });
    }

    if (!reason) {
      return Response.json({ error: "Reason is required" }, { status: 400 });
    }

    log.warn("inaccuracy.reported", {
      msgId,
      flowId,
      reason,
      url,
      hasMessageText: !!messageText,
    });

    trackEvent("inaccuracy.reported");
    recordRequest("/api/report-inaccuracy", Date.now() - startTime, false);

    return Response.json({ ok: true });
  } catch (err: any) {
    log.error("inaccuracy.report.error", { error: err?.message ?? String(err) });
    recordRequest("/api/report-inaccuracy", Date.now() - startTime, true);
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}
