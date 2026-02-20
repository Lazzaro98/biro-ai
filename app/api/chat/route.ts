import OpenAI from "openai";
import { rateLimit } from "@/app/lib/rate-limit";
import { sanitizeMessages } from "@/app/lib/sanitize";
import { buildSystemPrompt } from "@/app/lib/system-prompt";
import { env } from "@/app/lib/env";
import { log } from "@/app/lib/logger";
import { recordRequest, trackEvent } from "@/app/lib/metrics";
import { headers } from "next/headers";

/* ---------- config ---------- */
const RATE_LIMIT_MAX = 20; // requests per window
const RATE_LIMIT_WINDOW = 60_000; // 1 minute

// Singleton OpenAI client (created once per cold start)
const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

/* ---------- helpers ---------- */

/** Extract client IP from headers (works behind Vercel / nginx) */
function getClientIp(hdrs: Headers): string {
  return (
    hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    hdrs.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(req: Request) {
  const startTime = Date.now();
  try {
    /* ---- Rate limiting ---- */
    const hdrs = await headers();
    const ip = getClientIp(hdrs);
    const rl = rateLimit(ip, { maxRequests: RATE_LIMIT_MAX, windowMs: RATE_LIMIT_WINDOW });
    if (!rl.allowed) {
      log.warn("chat.rate_limited", { ip });
      recordRequest("/api/chat", Date.now() - startTime, true);
      return Response.json(
        { error: "Previše zahteva. Pokušaj ponovo za nekoliko sekundi." },
        {
          status: 429,
          headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) },
        },
      );
    }

    /* ---- Input validation ---- */
    const body = await req.json().catch(() => null);
    const result = sanitizeMessages(body?.messages);
    if (!result.ok) {
      return Response.json({ error: result.error }, { status: 400 });
    }
    const messages = result.messages;

    log.info("chat.request", { ip, messageCount: messages.length });
    trackEvent("chat.request");

    // Mapiramo u OpenAI format (assistant/user)
    const convo = messages.map((m) => ({
      role: m.role === "ai" ? ("assistant" as const) : ("user" as const),
      content: String(m.text ?? ""),
    }));

    // Stream response
    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      stream: true,
      messages: [{ role: "system", content: buildSystemPrompt() }, ...convo],
    });

    // Convert OpenAI stream → ReadableStream for the browser
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const delta = chunk.choices?.[0]?.delta?.content;
            if (delta) {
              controller.enqueue(encoder.encode(delta));
            }
          }
        } catch (err) {
          console.error("Stream error:", err);
          controller.enqueue(encoder.encode("\n\n[Greška pri generisanju odgovora]"));
        } finally {
          controller.close();
        }
      },
    });

    recordRequest("/api/chat", Date.now() - startTime, false);

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (err: any) {
    const durationMs = Date.now() - startTime;
    log.error("chat.error", { error: err?.message ?? String(err), durationMs });
    recordRequest("/api/chat", durationMs, true);
    return Response.json(
      { error: "Internal Server Error", details: err?.message ?? String(err) },
      { status: 500 },
    );
  }
}