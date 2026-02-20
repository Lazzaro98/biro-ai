/**
 * Chat session persistence — localStorage-backed.
 *
 * Stores multiple chat sessions per flow, enabling history browsing.
 * Each session has a unique ID, timestamp, flow reference, and messages.
 */

import type { Msg } from "./chat-utils";

/* ── Types ─── */

export interface ChatSession {
  /** Unique session ID */
  id: string;
  /** Flow slug (e.g. "otvaranje-firme") */
  flowId: string;
  /** ISO timestamp of creation */
  createdAt: string;
  /** ISO timestamp of last update */
  updatedAt: string;
  /** Human-readable title (auto-generated from first user message) */
  title: string;
  /** All messages in this session */
  messages: Msg[];
  /** Whether the checklist has been generated */
  completed: boolean;
}

/* ── Storage key ─── */
const SESSIONS_KEY = "biro-ai:sessions";
const ACTIVE_SESSION_PREFIX = "biro-ai:active-session:";

/* ── Helpers ─── */

function readSessions(): ChatSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeSessions(sessions: ChatSession[]): void {
  try {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch {
    /* quota exceeded */
  }
}

/** Generate a title from the first user message */
function generateTitle(msgs: Msg[], flowTitle: string): string {
  const firstUser = msgs.find((m) => m.role === "user");
  if (!firstUser) return flowTitle;
  const text = firstUser.text.trim();
  return text.length > 40 ? text.slice(0, 40) + "…" : text;
}

/* ── Public API ─── */

/** Get all sessions, optionally filtered by flow */
export function getSessions(flowId?: string): ChatSession[] {
  const all = readSessions();
  if (!flowId) return all;
  return all.filter((s) => s.flowId === flowId);
}

/** Get a single session by ID */
export function getSession(sessionId: string): ChatSession | null {
  return readSessions().find((s) => s.id === sessionId) ?? null;
}

/** Create a new session and return it */
export function createSession(flowId: string, flowTitle: string, initialMessages: Msg[]): ChatSession {
  const now = new Date().toISOString();
  const session: ChatSession = {
    id: crypto.randomUUID(),
    flowId,
    createdAt: now,
    updatedAt: now,
    title: flowTitle,
    messages: initialMessages,
    completed: false,
  };

  const sessions = readSessions();
  sessions.unshift(session);
  writeSessions(sessions);
  setActiveSessionId(flowId, session.id);

  return session;
}

/** Update an existing session's messages */
export function updateSession(
  sessionId: string,
  messages: Msg[],
  flowTitle: string,
  completed: boolean,
): void {
  const sessions = readSessions();
  const idx = sessions.findIndex((s) => s.id === sessionId);
  if (idx === -1) return;

  sessions[idx] = {
    ...sessions[idx],
    messages,
    updatedAt: new Date().toISOString(),
    title: generateTitle(messages, flowTitle),
    completed,
  };

  writeSessions(sessions);
}

/** Delete a session */
export function deleteSession(sessionId: string): void {
  const sessions = readSessions().filter((s) => s.id !== sessionId);
  writeSessions(sessions);
}

/** Get the active session ID for a flow */
export function getActiveSessionId(flowId: string): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACTIVE_SESSION_PREFIX + flowId) ?? null;
}

/** Set the active session ID for a flow */
export function setActiveSessionId(flowId: string, sessionId: string): void {
  try {
    localStorage.setItem(ACTIVE_SESSION_PREFIX + flowId, sessionId);
  } catch {
    /* ignore */
  }
}

/** Clear the active session for a flow */
export function clearActiveSessionId(flowId: string): void {
  try {
    localStorage.removeItem(ACTIVE_SESSION_PREFIX + flowId);
  } catch {
    /* ignore */
  }
}

/** Migrate old single-chat localStorage data to the session system */
export function migrateOldStorage(flowId: string, oldStorageKey: string, flowTitle: string): ChatSession | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(oldStorageKey);
    if (!raw) return null;

    const msgs: Msg[] = JSON.parse(raw);
    if (!Array.isArray(msgs) || msgs.length <= 1) {
      // Only the initial greeting — don't migrate
      localStorage.removeItem(oldStorageKey);
      return null;
    }

    // Check if we already migrated
    const existing = getSessions(flowId);
    if (existing.length > 0) {
      // Already have sessions — clean up old key
      localStorage.removeItem(oldStorageKey);
      return null;
    }

    // Create session from old data
    const session = createSession(flowId, flowTitle, msgs);
    session.title = generateTitle(msgs, flowTitle);
    updateSession(session.id, msgs, flowTitle, msgs.some((m) => m.role === "ai" && m.text.includes("- [")));

    // Clean up old key
    localStorage.removeItem(oldStorageKey);

    return session;
  } catch {
    return null;
  }
}
