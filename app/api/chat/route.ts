import OpenAI from "openai";
import { rateLimit } from "@/app/lib/rate-limit";
import { sanitizeMessages } from "@/app/lib/sanitize";
import { getFlow, FLOW_IDS } from "@/app/lib/flows";
import { env } from "@/app/lib/env";
import { log } from "@/app/lib/logger";
import { recordRequest, trackEvent } from "@/app/lib/metrics";
import { ensureSourceDateBlock, validateChecklistQuality } from "@/app/lib/checklist-quality";
import { headers } from "next/headers";

/* ---------- config ---------- */
const RATE_LIMIT_MAX = 20; // requests per window
const RATE_LIMIT_WINDOW = 60_000; // 1 minute

const TRUST_APPENDIX = `\n\n## Obavezno za finalnu checklistu\n- Kada generišeš checklistu, NA KRAJU odgovora uvek dodaj sekciju: \"### 📚 Izvori i datum provere\".\n- U toj sekciji obavezno navedi liniju \"Provereno: [datum]\" i 2-4 relevantna zvanična izvora.\n- Ako je neki rok ili trošak procena, jasno označi da može varirati.`;

// Singleton OpenAI client (created once per cold start)
const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

function extractAssistantText(content: unknown): string {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";

  const parts = content
    .map((part) => {
      if (!part || typeof part !== "object") return "";
      const maybeText = (part as { text?: unknown }).text;
      return typeof maybeText === "string" ? maybeText : "";
    })
    .filter(Boolean);

  return parts.join("\n");
}

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

    /* ---- Flow selection ---- */
    const flowId = typeof body?.flowId === "string" && FLOW_IDS.includes(body.flowId)
      ? body.flowId
      : "otvaranje-firme";
    const flow = getFlow(flowId);

    log.info("chat.request", { ip, flowId, messageCount: messages.length });
    trackEvent("chat.request");

    // Mapiramo u OpenAI format (assistant/user)
    const convo = messages.map((m) => ({
      role: m.role === "ai" ? ("assistant" as const) : ("user" as const),
      content: String(m.text ?? ""),
    }));

    // Generate full response first so we can validate checklist quality before sending
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      messages: [{ role: "system", content: `${flow.buildSystemPrompt()}${TRUST_APPENDIX}` }, ...convo],
    });

    let answerText = extractAssistantText(completion.choices?.[0]?.message?.content);
    if (!answerText.trim()) {
      answerText = "⚠️ AI trenutno nije generisao odgovor. Probaj ponovo.";
    }

    answerText = ensureSourceDateBlock(answerText);

    const quality = validateChecklistQuality(answerText);
    if (quality.isChecklist && !quality.ok) {
      log.warn("chat.checklist_validation_failed", {
        flowId,
        issues: quality.issues,
      });
      trackEvent("chat.checklist_validation_failed");
    }

    recordRequest("/api/chat", Date.now() - startTime, false);

    return new Response(answerText, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
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