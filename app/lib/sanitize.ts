/**
 * Input sanitization for chat API messages.
 * Extracted from route.ts for reuse and direct testability.
 */

export type ClientMsg = { role: "ai" | "user"; text: string };

export const MAX_MESSAGES = 30;
export const MAX_MSG_LENGTH = 2000;
export const MAX_AI_MSG_LENGTH = 10000;

/** Validates and sanitizes incoming messages, returning clean data or an error string. */
export function sanitizeMessages(
  raw: unknown,
): { ok: true; messages: ClientMsg[] } | { ok: false; error: string } {
  if (!Array.isArray(raw) || raw.length === 0) {
    return { ok: false, error: "Invalid request body. Expected { messages: [...] }" };
  }
  if (raw.length > MAX_MESSAGES) {
    return { ok: false, error: `Too many messages (max ${MAX_MESSAGES}).` };
  }
  const clean: ClientMsg[] = [];
  for (const m of raw) {
    if (!m || typeof m !== "object") {
      return { ok: false, error: "Each message must be an object with role and text." };
    }
    const role = m.role;
    if (role !== "ai" && role !== "user") {
      return { ok: false, error: `Invalid role "${role}".` };
    }
    const text = typeof m.text === "string" ? m.text.trim() : "";
    if (text.length === 0) {
      return { ok: false, error: "Message text cannot be empty." };
    }
    const limit = role === "ai" ? MAX_AI_MSG_LENGTH : MAX_MSG_LENGTH;
    if (text.length > limit) {
      return { ok: false, error: `Message too long (max ${limit} chars).` };
    }
    clean.push({ role, text });
  }
  return { ok: true, messages: clean };
}
