"use client";

import { memo } from "react";
import dynamic from "next/dynamic";
import FeedbackButtons from "./FeedbackButtons";
import { isChecklist, parseSuggestions } from "../lib/chat-utils";
import type { Msg } from "../lib/chat-utils";
import remarkGfm from "remark-gfm";

const ReactMarkdown = dynamic(() => import("react-markdown"), {
  loading: () => <span className="text-muted text-sm">…</span>,
  ssr: false,
});
const ChecklistRenderer = dynamic(() => import("./ChecklistRenderer"), {
  ssr: false,
});

/* ── Avatars ─── */
export const AiAvatar = memo(function AiAvatar() {
  return (
    <div
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm select-none"
      aria-hidden="true"
    >
      🤖
    </div>
  );
});

export const UserAvatar = memo(function UserAvatar() {
  return (
    <div
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-white text-xs font-bold select-none"
      aria-hidden="true"
    >
      Ti
    </div>
  );
});

/* ── Single message bubble ─── */
interface ChatMessageProps {
  msg: Msg;
  index: number;
  totalMessages: number;
  isSending: boolean;
  onRetry: () => void;
  flowId?: string;
}

export const ChatMessage = memo(function ChatMessage({
  msg: m,
  index: i,
  totalMessages,
  isSending,
  onRetry,
  flowId,
}: ChatMessageProps) {
  // Strip <<SUGGESTIONS:...>> marker from AI text for display
  const displayText = m.role === "ai" && !m.isError ? parseSuggestions(m.text).cleanText : m.text;

  return (
    <div
      className={`flex gap-3 animate-msg-in ${
        m.role === "user" ? "flex-row-reverse" : "flex-row"
      }`}
    >
      {m.role === "ai" ? <AiAvatar /> : <UserAvatar />}

      <div className={m.role === "ai" ? "flex flex-col min-w-0" : "min-w-0"}>
        <div
          className={[
            "rounded-2xl px-4 py-3",
            m.role === "user"
              ? "max-w-[80%] bg-gradient-to-br from-primary to-primary-dark text-white rounded-tr-md shadow-md shadow-primary/20"
              : m.isError
                ? "max-w-[80%] bg-red-50/80 dark:bg-red-950/40 backdrop-blur-sm border border-red-200/60 dark:border-red-800/40 shadow-sm rounded-tl-md"
                : isChecklist(displayText)
                  ? "max-w-[90%] bg-card-bg backdrop-blur-sm border border-border/60 shadow-sm rounded-tl-md overflow-x-auto"
                  : "max-w-[80%] bg-card-bg backdrop-blur-sm border border-border/60 shadow-sm rounded-tl-md",
          ].join(" ")}
          role={m.isError ? "alert" : undefined}
        >
          {m.role === "ai" ? (
            m.isError ? (
              <div className="space-y-2.5">
                <p className="text-sm text-red-700 dark:text-red-300 leading-relaxed">
                  {m.text}
                </p>
                <button
                  type="button"
                  onClick={onRetry}
                  disabled={isSending}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-red-100 hover:bg-red-200
                             dark:bg-red-900/40 dark:hover:bg-red-900/60
                             px-3 py-1.5 text-xs font-medium text-red-700 dark:text-red-300
                             active:scale-95 transition-all disabled:opacity-50"
                >
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Probaj ponovo
                </button>
              </div>
            ) : isChecklist(displayText) ? (
              <ChecklistRenderer
                checklistId={`chat-${i}`}
                markdown={displayText}
                showProgress
                flowId={flowId}
              />
            ) : (
              <div className="prose-chat max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {displayText || "…"}
                </ReactMarkdown>
              </div>
            )
          ) : (
            <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{m.text}</p>
          )}
        </div>

        {/* Feedback buttons — only for non-error AI messages with content */}
        {m.role === "ai" &&
          !m.isError &&
          m.text &&
          !(isSending && i === totalMessages - 1) && (
            <FeedbackButtons msgId={`msg-${i}`} />
          )}
      </div>
    </div>
  );
});

/* ── Typing indicator ─── */
interface TypingIndicatorProps {
  elapsed: number;
}

export const TypingIndicator = memo(function TypingIndicator({
  elapsed,
}: TypingIndicatorProps) {
  return (
    <div
      className="no-print flex gap-3 animate-msg-in"
      role="status"
      aria-label="AI piše odgovor"
    >
      <AiAvatar />
      <div className="rounded-2xl rounded-tl-md bg-surface border border-border shadow-sm px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="typing-dot inline-block h-2 w-2 rounded-full bg-muted" />
            <span className="typing-dot inline-block h-2 w-2 rounded-full bg-muted" />
            <span className="typing-dot inline-block h-2 w-2 rounded-full bg-muted" />
          </div>
          {elapsed >= 3 && (
            <span className="text-xs text-muted animate-fade-in-up">
              {elapsed < 10
                ? "Razmišljam…"
                : elapsed < 20
                  ? "Još malo…"
                  : "Skoro gotovo…"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
});
