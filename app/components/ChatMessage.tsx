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
const LawyerCTA = dynamic(() => import("./LawyerCTA"), {
  ssr: false,
});

/* ── Avatars ─── */
export const AiAvatar = memo(function AiAvatar() {
  return (
    <div
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm select-none"
      aria-hidden="true"
    >
      🏛️
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

/** Try to extract a short display name from a URL */
function urlDisplayName(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return host;
  } catch {
    return url.slice(0, 40);
  }
}

export const ChatMessage = memo(function ChatMessage({
  msg: m,
  index: i,
  totalMessages,
  isSending,
  onRetry,
  flowId,
}: ChatMessageProps) {
  // Strip <<SUGGESTIONS:...>> and <<LAWYER_CTA>> markers from AI text for display
  const parsed = m.role === "ai" && !m.isError ? parseSuggestions(m.text) : null;
  const displayText = parsed ? parsed.cleanText : m.text;
  const showLawyerCTA = parsed?.showLawyerCTA ?? false;

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

        {/* Feedback buttons — only on the last AI message */}
        {m.role === "ai" &&
          !m.isError &&
          m.text &&
          i === totalMessages - 1 &&
          !isSending && (
            <FeedbackButtons msgId={`msg-${i}`} flowId={flowId} messageText={displayText} />
          )}

        {/* Citations — shown below AI messages that have them */}
        {m.role === "ai" && !m.isError && m.citations && m.citations.length > 0 && (
          <details className="mt-1.5 group/cite">
            <summary className="cursor-pointer text-[11px] text-muted/60 hover:text-muted/90 transition-colors select-none flex items-center gap-1">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
              </svg>
              <span>{m.citations.length} {m.citations.length === 1 ? "izvor" : m.citations.length < 5 ? "izvora" : "izvora"}</span>
              <svg className="h-3 w-3 transition-transform group-open/cite:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <ul className="mt-1 space-y-0.5 pl-1">
              {m.citations.map((url, ci) => (
                <li key={ci} className="text-[11px] truncate">
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary/70 hover:text-primary hover:underline transition-colors"
                    title={url}
                  >
                    {urlDisplayName(url)}
                  </a>
                </li>
              ))}
            </ul>
          </details>
        )}

        {/* Inline lawyer CTA — shown when AI detects complex legal question */}
        {showLawyerCTA && <div className="mt-2"><LawyerCTA /></div>}
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
