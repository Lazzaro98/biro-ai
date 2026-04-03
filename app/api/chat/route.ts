import OpenAI from "openai";
import { rateLimit } from "@/app/lib/rate-limit";
import { sanitizeMessages } from "@/app/lib/sanitize";
import { getFlow, FLOW_IDS } from "@/app/lib/flows";
import { env } from "@/app/lib/env";
import { log } from "@/app/lib/logger";
import { recordRequest, trackEvent } from "@/app/lib/metrics";
import { incrementStat, STAT_KEYS } from "@/app/lib/stats";
import { ensureSourceDateBlock, validateChecklistQuality } from "@/app/lib/checklist-quality";
import { retrieve } from "@/app/lib/rag";
import type { RetrievalResult } from "@/app/lib/rag";
import { headers } from "next/headers";

/* ---------- config ---------- */
const RATE_LIMIT_MAX = 20; // requests per window
const RATE_LIMIT_WINDOW = 60_000; // 1 minute

const usePerplexity = !!env.PERPLEXITY_API_KEY;

const TRUST_APPENDIX = `\n\n## Obavezno za finalnu checklistu\n- Kada generišeš checklistu, NA KRAJU odgovora uvek dodaj sekciju: \"### 📚 Izvori i datum provere\".\n- U toj sekciji navedi liniju \"Provereno: [današnji datum]\" i linkove ka zvaničnim izvorima koje si koristio (APR, MUP, Poreska uprava, itd.).\n- Format izvora: \"[Ime institucije](URL)\" — kratko i čitljivo, BEZ dugačkih pravnih citata.\n- Ako je neki rok ili trošak procena, jasno označi da može varirati.`;

// Singleton client — Perplexity when available, otherwise OpenAI
const client = usePerplexity
  ? new OpenAI({ apiKey: env.PERPLEXITY_API_KEY, baseURL: "https://api.perplexity.ai" })
  : new OpenAI({ apiKey: env.OPENAI_API_KEY });

const MODEL = usePerplexity ? "sonar-pro" : "gpt-4.1";

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

/** Build a context block from RAG retrieval results */
function buildRagContext(results: RetrievalResult[]): string {
  if (results.length === 0) return "";

  const lines = results.map((r, i) => {
    const srcLabel = `${r.source.institution} (${r.source.url})`;
    const heading = r.section ? `### ${r.section}` : "";
    return `[Izvor ${i + 1}: ${srcLabel}, verifikovano: ${r.source.verifiedDate}]\n${heading}\n${r.text}`;
  });

  // Deduplicate sources by URL for the citation instruction
  const uniqueSources = new Map<string, { institution: string; url: string; verifiedDate: string }>();
  for (const r of results) {
    if (!uniqueSources.has(r.source.url)) {
      uniqueSources.set(r.source.url, {
        institution: r.source.institution,
        url: r.source.url,
        verifiedDate: r.source.verifiedDate,
      });
    }
  }

  const sourceList = [...uniqueSources.values()]
    .map((s) => `- ${s.institution}: ${s.url} (verifikovano: ${s.verifiedDate})`)
    .join("\n");

  return [
    "\n\n## Kontekst iz zvaničnih izvora (RAG)",
    "Sledeće informacije su preuzete iz verifikovanih zvaničnih dokumenata.",
    "Koristi ih kao primarni izvor činjenica. Ako se informacija u tvom treningu razlikuje od ovih podataka, VERUJ ovim podacima.",
    "",
    ...lines,
    "",
    "## Instrukcija za citiranje izvora",
    "Kada generišeš checklistu, u sekciji '📚 Izvori i datum provere' na kraju, OBAVEZNO navedi sledeće izvore sa kojih su podaci preuzeti:",
    sourceList,
    "Format: ime institucije + link. Ne navodi dugačke pravne reference — samo instituciju i URL.",
    "---",
  ].join("\n");
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

    // Track new chat conversations (first user message = new chat)
    if (messages.filter((m) => m.role === "user").length === 1) {
      await incrementStat(STAT_KEYS.chats);
    }

    // Mapiramo u OpenAI format (assistant/user)
    const convo = messages.map((m) => ({
      role: m.role === "ai" ? ("assistant" as const) : ("user" as const),
      content: String(m.text ?? ""),
    }));

    // RAG: retrieve relevant knowledge chunks based on the user's latest message
    let ragContext = "";
    let ragHasResults = false;
    try {
      const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
      if (lastUserMsg?.text && env.OPENAI_API_KEY) {
        const ragResults = await retrieve(lastUserMsg.text, env.OPENAI_API_KEY, {
          flowId,
          topK: 5,
        });
        ragContext = buildRagContext(ragResults);
        ragHasResults = ragResults.length > 0;
        if (ragResults.length > 0) {
          log.info("chat.rag", { flowId, chunksFound: ragResults.length, topScore: ragResults[0].score.toFixed(3) });
        } else {
          log.info("chat.rag_no_match", { flowId, query: lastUserMsg.text.slice(0, 100) });
        }
      }
    } catch (ragErr: any) {
      // RAG failure is non-fatal — fall back to system prompt only
      log.warn("chat.rag_error", { error: ragErr?.message ?? String(ragErr) });
    }

    // If RAG found no relevant documents, instruct AI to note this
    const noRagDisclaimer = !ragHasResults
      ? `\n\n## Napomena o izvorima\nZa ovu temu NEMAMO verifikovane zvanične dokumente u bazi znanja. Tvoj odgovor će biti baziran na tvom treningu. Na KRAJU odgovora OBAVEZNO dodaj kratku napomenu:\n"⚠️ *Ove informacije su bazirane na opštem znanju AI modela, a ne na verifikovanim zvaničnim dokumentima. Preporučujemo da proverite aktuelne informacije na zvaničnom sajtu nadležne institucije.*"`
      : "";

    // Generate full response first so we can validate checklist quality before sending
    const systemPrompt = `${flow.buildSystemPrompt()}${ragContext}${noRagDisclaimer}${TRUST_APPENDIX}`;
    const completion = await client.chat.completions.create({
      model: MODEL,
      temperature: 0.3,
      messages: [{ role: "system", content: systemPrompt }, ...convo],
    });

    // Extract citations from Perplexity response (non-standard field)
    const citations: string[] = usePerplexity
      ? ((completion as unknown as { citations?: string[] }).citations ?? [])
      : [];

    let answerText = extractAssistantText(completion.choices?.[0]?.message?.content);
    if (!answerText.trim()) {
      answerText = "⚠️ AI trenutno nije generisao odgovor. Probaj ponovo.";
    }

    answerText = ensureSourceDateBlock(answerText);

    // Track checklist generation
    const isChecklist = answerText.includes("- [") || answerText.includes("- [x]");
    if (isChecklist) {
      await incrementStat(STAT_KEYS.checklists);
    }

    const quality = validateChecklistQuality(answerText);
    if (quality.isChecklist && !quality.ok) {
      log.warn("chat.checklist_validation_failed", {
        flowId,
        issues: quality.issues,
      });
      trackEvent("chat.checklist_validation_failed");
    }

    if (citations.length > 0) {
      log.info("chat.citations", { flowId, count: citations.length });
    }

    recordRequest("/api/chat", Date.now() - startTime, false);

    return Response.json(
      { text: answerText, citations },
      {
        headers: {
          "Cache-Control": "no-cache",
        },
      },
    );
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