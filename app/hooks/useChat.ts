"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { track } from "../lib/analytics";
import type { Msg } from "../lib/chat-utils";
import { getFlow } from "../lib/flows";
import type { FlowConfig, SuggestionStep, SavedChecklist } from "../lib/flows";

const REQUEST_TIMEOUT_MS = 30_000;

/* ── LocalStorage helpers ─── */

function loadMessages(flow: FlowConfig): Msg[] {
  if (typeof window === "undefined") return flow.initialMessages;
  try {
    const raw = localStorage.getItem(flow.storageKey);
    if (!raw) return flow.initialMessages;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {
    /* ignore corrupt data */
  }
  return flow.initialMessages;
}

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
}

export function useChat(flowId: string): UseChatReturn {
  const flow = useMemo(() => getFlow(flowId), [flowId]);

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

  // Hydration-safe: load persisted messages only on the client
  useEffect(() => {
    const saved = loadMessages(flow);
    if (saved !== flow.initialMessages) setMessages(saved);
  }, [flow]);

  // Current step = detected from AI's last message
  const currentStep = useMemo(() => flow.detectStep(messages), [flow, messages]);

  // Active suggestions for the current step
  const activeSuggestions = useMemo(() => {
    if (isSending) return null;
    if (currentStep >= flow.suggestionSteps.length) return null;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.role !== "ai") return null;
    return flow.suggestionSteps[currentStep];
  }, [currentStep, messages, isSending, flow]);

  // Persist messages to localStorage (skip initial render)
  const isHydrated = useRef(false);
  useEffect(() => {
    if (!isHydrated.current) {
      isHydrated.current = true;
      return;
    }
    try {
      localStorage.setItem(flow.storageKey, JSON.stringify(messages));
    } catch {
      /* quota exceeded — ignore */
    }
  }, [messages]);

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

  /* ── Reset chat ─── */
  function resetChat() {
    track("chat.reset", { flow: flow.id });
    localStorage.removeItem(flow.storageKey);
    setMessages(flow.initialMessages);
    setInput("");
    setChecklistSaved(false);
  }

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
  };
}
