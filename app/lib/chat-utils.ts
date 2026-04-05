/**
 * Shared types and logic used by both the chat page and tests.
 *
 * The step detection and checklist check functions here are
 * for the "otvaranje-firme" flow (backward compatibility).
 * New flows define their own in app/lib/flows/.
 */

export type Msg = { role: "ai" | "user"; text: string; isError?: boolean; citations?: string[] };

const TOTAL_STEPS = 4; // city, type, activity, taxation

/**
 * Detect which flow step the AI is currently asking about
 * for the "otvaranje-firme" flow.
 */
export function detectFlowStep(msgs: Msg[]): number {
  const lastAi = [...msgs].reverse().find((m) => m.role === "ai" && !m.isError);
  if (!lastAi) return 0;

  const t = lastAi.text.toLowerCase();

  // Checklist already generated
  if (t.includes("- [")) return TOTAL_STEPS;

  // AI is summarising / confirming choices before generating checklist
  if (
    (t.includes("generi") || t.includes("checklista") || t.includes("cheklistu") || t.includes("lista koraka") || t.includes("listu koraka")) &&
    (t.includes("paušal") || t.includes("vođenj") || t.includes("knjiga"))
  )
    return TOTAL_STEPS;

  // If AI confirms the user's taxation answer
  if (
    (t.includes("odlučio") || t.includes("odlučila") || t.includes("izabra") || t.includes("tvoj izbor")) &&
    (t.includes("paušal") || t.includes("vođenj") || t.includes("knjiga"))
  )
    return TOTAL_STEPS;

  // Step 3: taxation — AI ASKS about paušal/oporezivanje
  if ((t.includes("paušal") || t.includes("oporezivanje") || t.includes("vođenje knjiga")) && t.includes("?"))
    return 3;

  // Step 2: activity — AI asks about delatnost
  if ((t.includes("delatnost") || t.includes("čime") || t.includes("šifr")) && t.includes("?"))
    return 2;

  // Step 1: business type — AI asks about PR/DOO
  if ((t.includes("preduzetnik") || t.includes("tip firme")) && (t.includes("doo") || t.includes("društvo")) && t.includes("?"))
    return 1;

  // Step 0: city (default)
  return 0;
}

/** Check if a message looks like the final checklist */
export function isChecklist(text: string): boolean {
  return text.includes("- [") && (text.includes("checklista") || text.includes("Checklista") || text.includes("checklist") || text.includes("lista koraka") || text.includes("Lista koraka") || text.includes("Registracija"));
}

/* ── AI-driven suggestion parsing ─── */

/** Pattern: <<SUGGESTIONS: ["opt1", "opt2"]>> at the end of AI response */
const SUGGESTIONS_RE = /<<SUGGESTIONS:\s*(\[[\s\S]*?\])>>/;

export interface ParsedSuggestions {
  /** AI text with the suggestion marker removed */
  cleanText: string;
  /** Parsed chip labels, empty if none */
  chips: string[];
}

/**
 * Extract AI-embedded suggestions from a message.
 * The AI is instructed to append <<SUGGESTIONS: ["a","b","c"]>> at the end.
 * Returns cleaned text + parsed chip array.
 */
export function parseSuggestions(text: string): ParsedSuggestions {
  const match = text.match(SUGGESTIONS_RE);
  if (!match) return { cleanText: text, chips: [] };

  const cleanText = text.replace(SUGGESTIONS_RE, "").trimEnd();

  try {
    const parsed = JSON.parse(match[1]);
    if (Array.isArray(parsed) && parsed.every((c) => typeof c === "string")) {
      return { cleanText, chips: parsed };
    }
  } catch {
    // malformed JSON — ignore
  }

  return { cleanText, chips: [] };
}
