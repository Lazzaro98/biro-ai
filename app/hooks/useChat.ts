"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { track } from "../lib/analytics";
import type { Msg } from "../lib/chat-utils";
import { parseSuggestions } from "../lib/chat-utils";
import { getFlow } from "../lib/flows";
import type { FlowConfig, SuggestionStep, SavedChecklist } from "../lib/flows";
import {
  getSessions,
  getSession,
  createSession,
  updateSession,
  deleteSession as deleteSessionFromStorage,
  getActiveSessionId,
  setActiveSessionId,
  migrateOldStorage,
  type ChatSession,
} from "../lib/chat-sessions";

const REQUEST_TIMEOUT_MS = 30_000;

/* ── Checklist save helper ─── */

function saveChecklistToStorage(flow: FlowConfig, msgs: Msg[]): SavedChecklist | null {
  const checklistMsg = [...msgs].reverse().find((m) => m.role === "ai" && flow.isChecklist(m.text));
  if (!checklistMsg) return null;

  const params = flow.extractParams(msgs);
  const entry: SavedChecklist = {
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    flowId: flow.id,
    params,
    markdown: checklistMsg.text,
  };

  try {
    const raw = localStorage.getItem(flow.checklistsKey);
    const list: SavedChecklist[] = raw ? JSON.parse(raw) : [];
    list.unshift(entry);
    localStorage.setItem(flow.checklistsKey, JSON.stringify(list));
  } catch {
    /* ignore */
  }

  return entry;
}

/* ── Hook return type ─── */
export interface UseChatReturn {
  messages: Msg[];
  input: string;
  setInput: (v: string) => void;
  isSending: boolean;
  isOnline: boolean;
  elapsed: number;
  checklistSaved: boolean;
  hasChecklist: boolean;
  currentStep: number;
  activeSuggestions: SuggestionStep | null;
  totalSteps: number;
  progressPct: number;
  isDone: boolean;
  bottomRef: React.RefObject<HTMLDivElement | null>;
  inputRef: React.RefObject<HTMLInputElement | null>;
  sendText: (text: string) => Promise<void>;
  sendMessage: () => void;
  retryLast: () => void;
  resetChat: () => void;
  handleSaveChecklist: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  /* Session management */
  sessionId: string | null;
  switchSession: (sessionId: string) => void;
  startNewSession: () => void;
}

export function useChat(flowId: string, initialSessionId?: string | null, consultItem?: string | null): UseChatReturn {
  const flow = useMemo(() => getFlow(flowId), [flowId]);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>(flow.initialMessages);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [checklistSaved, setChecklistSaved] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [sendStartTime, setSendStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const sendTextRef = useRef<((text: string) => Promise<void>) | null>(null);

  // ── Online/offline detection ──
  useEffect(() => {
    setIsOnline(navigator.onLine);
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  // ── Elapsed time counter while sending ──
  useEffect(() => {
    if (!sendStartTime) {
      setElapsed(0);
      return;
    }
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - sendStartTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [sendStartTime]);

  // ── Session initialization & migration ──
  useEffect(() => {
    // 1. Try migrating old single-key storage
    migrateOldStorage(flow.id, flow.storageKey, flow.title);

    // 2. Determine which session to load
    let sid = initialSessionId ?? getActiveSessionId(flow.id);

    if (sid) {
      const existing = getSession(sid);
      if (existing) {
        setSessionId(sid);
        setMessages(existing.messages);
        return;
      }
    }

    // 3. No active session — find the most recent one, or create new
    const flowSessions = getSessions(flow.id);
    if (flowSessions.length > 0) {
      const latest = flowSessions[0];
      setSessionId(latest.id);
      setMessages(latest.messages);
      setActiveSessionId(flow.id, latest.id);
    } else {
      const newSession = createSession(flow.id, flow.title, flow.initialMessages);
      setSessionId(newSession.id);
      setMessages(newSession.messages);
    }
  }, [flow, initialSessionId]);

  // ── Auto-send consultation message ──
  const consultHandled = useRef(false);
  useEffect(() => {
    if (!consultItem || consultHandled.current || !sessionId) return;
    consultHandled.current = true;

    // Custom initial message relevant to the specific checklist item
    const consultGreeting: Msg[] = [
      {
        role: "ai",
        text: `🔍 Pitaj me bilo šta o ovom koraku — **„${consultItem}"** — tu sam da objasnim sve detalje!`,
      },
    ];

    // Create a new session with the consultation-specific greeting
    const newSession = createSession(flow.id, `Konsultacija: ${consultItem.slice(0, 50)}`, consultGreeting);
    setSessionId(newSession.id);
    setMessages(consultGreeting);
    setChecklistSaved(false);

    // Auto-send the consultation question after a brief delay (so state settles)
    const question = `Objasni mi detaljnije ovaj korak iz checkliste: "${consultItem}"

Šta tačno treba da uradim, koji su dokumenti potrebni, koliko je vreme obrade, i da li postoje neke česte greške koje treba izbegavati?`;
    setTimeout(() => {
      sendTextRef.current?.(question);
    }, 150);
  }, [consultItem, sessionId, flow]);

  // Current step = detected from AI's last message (used for progress bar)
  const currentStep = useMemo(() => flow.detectStep(messages), [flow, messages]);

  // Active suggestions — AI-driven: parse from last AI message
  const activeSuggestions = useMemo((): SuggestionStep | null => {
    if (isSending) return null;
    const lastMsg = messages[messages.length - 1];
    if (!lastMsg || lastMsg.role !== "ai") return null;

    // Parse AI-embedded suggestions
    const { chips } = parseSuggestions(lastMsg.text);
    if (chips.length > 0) {
      return { chips, allowFreeText: true };
    }

    // Fallback: only use step-based suggestions for the very first AI message (step 0)
    // Later steps rely entirely on AI-embedded suggestions to avoid mismatched chips
    if (currentStep === 0 && flow.suggestionSteps.length > 0) {
      return flow.suggestionSteps[0];
    }

    return null;
  }, [currentStep, messages, isSending, flow]);

  // Persist messages to session storage (skip initial render)
  const isHydrated = useRef(false);
  useEffect(() => {
    if (!isHydrated.current) {
      isHydrated.current = true;
      return;
    }
    if (!sessionId) return;
    const completed = messages.some((m) => m.role === "ai" && flow.isChecklist(m.text));
    updateSession(sessionId, messages, flow.title, completed);
  }, [messages, sessionId, flow]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending, activeSuggestions]);

  // Auto-focus input when free-text is allowed
  useEffect(() => {
    if (!isSending && activeSuggestions?.allowFreeText) inputRef.current?.focus();
  }, [isSending, activeSuggestions]);

  /* ── Send logic ─── */
  const sendText = useCallback(
    async (text: string) => {
      if (!text.trim() || isSending) return;

      // Remove any previous error message before retrying
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.isError) return prev.slice(0, -1);
        return prev;
      });

      setInput("");
      setIsSending(true);
      setSendStartTime(Date.now());
      track("chat.message_sent", { flow: flow.id, step: flow.detectStep(messages) });

      // Abort controller for timeout
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

      const nextMessages: Msg[] = [
        ...messages.filter((m) => !m.isError),
        { role: "user", text: text.trim() },
      ];
      setMessages(nextMessages);

      try {
        if (!navigator.onLine) {
          throw new Error("offline");
        }

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: nextMessages, flowId: flow.id }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const t = await res.text().catch(() => "");
          const detail = t.slice(0, 150);
          setMessages((m) => [
            ...m,
            {
              role: "ai",
              text: `⚠️ Server je vratio grešku (${res.status}).${detail ? " " + detail : ""}`,
              isError: true,
            },
          ]);
          return;
        }

        const reader = res.body?.getReader();
        if (!reader) {
          setMessages((m) => [
            ...m,
            { role: "ai", text: "⚠️ Nema odgovora od servera.", isError: true },
          ]);
          return;
        }

        const decoder = new TextDecoder();
        let accumulated = "";
        setMessages((m) => [...m, { role: "ai", text: "" }]);

        // Throttle state updates during streaming to ~RAF cadence
        let rafId = 0;
        let needsFlush = false;

        const flushToState = () => {
          rafId = 0;
          needsFlush = false;
          setMessages((m) => {
            const updated = [...m];
            updated[updated.length - 1] = { role: "ai", text: accumulated };
            return updated;
          });
        };

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          needsFlush = true;
          if (!rafId) {
            rafId = requestAnimationFrame(flushToState);
          }
        }

        // Final flush
        if (rafId) cancelAnimationFrame(rafId);
        if (needsFlush) flushToState();

        if (!accumulated.trim()) {
          setMessages((m) => {
            const updated = [...m];
            updated[updated.length - 1] = {
              role: "ai",
              text: "⚠️ AI nije generisao odgovor. Probaj ponovo.",
              isError: true,
            };
            return updated;
          });
        }
      } catch (e: any) {
        const isAbort = e?.name === "AbortError";
        const isOffline = !navigator.onLine || e?.message === "offline";
        const errorMsg = isAbort
          ? "⏱️ Zahtev je trajao predugo. Server nije odgovorio na vreme."
          : isOffline
            ? "📡 Nema internet konekcije. Proveri mrežu i probaj ponovo."
            : `⚠️ Greška pri slanju poruke.${e?.message ? " (" + e.message + ")" : ""}`;

        setMessages((m) => {
          const last = m[m.length - 1];
          if (last?.role === "ai" && !last.text) {
            const updated = [...m];
            updated[updated.length - 1] = { role: "ai", text: errorMsg, isError: true };
            return updated;
          }
          return [...m, { role: "ai", text: errorMsg, isError: true }];
        });
      } finally {
        clearTimeout(timeoutId);
        abortRef.current = null;
        setIsSending(false);
        setSendStartTime(null);
      }
    },
    [isSending, messages],
  );

  // Keep sendTextRef in sync for use in consultation effect
  sendTextRef.current = sendText;

  /* ── Retry last failed message ─── */
  const retryLast = useCallback(() => {
    const msgsWithoutError = messages.filter((m) => !m.isError);
    const lastUserMsg = [...msgsWithoutError].reverse().find((m) => m.role === "user");
    if (!lastUserMsg) return;
    const withoutLastExchange = msgsWithoutError.slice(0, -1);
    setMessages(withoutLastExchange);
    setTimeout(() => sendText(lastUserMsg.text), 50);
  }, [messages, sendText]);

  const sendMessage = useCallback(() => {
    sendText(input);
  }, [input, sendText]);

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) sendMessage();
  }

  /* ── Reset chat = start new session ─── */
  function resetChat() {
    track("chat.reset", { flow: flow.id });
    const newSession = createSession(flow.id, flow.title, flow.initialMessages);
    setSessionId(newSession.id);
    setMessages(flow.initialMessages);
    setInput("");
    setChecklistSaved(false);
  }

  /* ── Switch to an existing session ─── */
  const switchSession = useCallback((sid: string) => {
    const s = getSession(sid);
    if (!s) return;
    setSessionId(sid);
    setMessages(s.messages);
    setActiveSessionId(flow.id, sid);
    setChecklistSaved(false);
    setInput("");
    isHydrated.current = false; // prevent re-saving during switch
    setTimeout(() => { isHydrated.current = true; }, 50);
  }, [flow]);

  /* ── Start a brand new session ─── */
  const startNewSession = useCallback(() => {
    const newSession = createSession(flow.id, flow.title, flow.initialMessages);
    setSessionId(newSession.id);
    setMessages(flow.initialMessages);
    setInput("");
    setChecklistSaved(false);
    track("chat.new_session", { flow: flow.id });
  }, [flow]);

  /* ── Detect checklist & offer save ─── */
  const hasChecklist = useMemo(
    () => messages.some((m) => m.role === "ai" && flow.isChecklist(m.text)),
    [messages, flow],
  );

  function handleSaveChecklist() {
    const saved = saveChecklistToStorage(flow, messages);
    if (saved) {
      setChecklistSaved(true);
      track("checklist.saved");
    }
  }

  /* ── Progress indicator ─── */
  const totalSteps = flow.suggestionSteps.length;
  const progressPct = Math.min((currentStep / totalSteps) * 100, 100);
  const isDone = hasChecklist;

  return {
    messages,
    input,
    setInput,
    isSending,
    isOnline,
    elapsed,
    checklistSaved,
    hasChecklist,
    currentStep,
    activeSuggestions,
    totalSteps,
    progressPct,
    isDone,
    bottomRef,
    inputRef,
    sendText,
    sendMessage,
    retryLast,
    resetChat,
    handleSaveChecklist,
    onKeyDown,
    sessionId,
    switchSession,
    startNewSession,
  };
}
