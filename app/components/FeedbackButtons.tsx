"use client";

import { useState, memo, useCallback } from "react";

type FeedbackValue = "up" | "down" | null;

const FEEDBACK_KEY = "bezpapira:feedback";

/** Load saved feedback map from localStorage */
function loadFeedback(): Record<string, FeedbackValue> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(FEEDBACK_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/** Save feedback to localStorage + optionally POST to API */
function saveFeedback(msgId: string, value: FeedbackValue, comment?: string) {
  try {
    const map = loadFeedback();
    if (value) {
      map[msgId] = value;
    } else {
      delete map[msgId];
    }
    localStorage.setItem(FEEDBACK_KEY, JSON.stringify(map));
  } catch { /* quota exceeded */ }

  // Fire-and-forget to API (best-effort, no blocking)
  if (value) {
    fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ msgId, value, comment: comment || undefined }),
    }).catch(() => { /* silent fail */ });
  }
}

interface FeedbackButtonsProps {
  /** Unique ID for this message (e.g. "chat-3") */
  msgId: string;
}

export default memo(function FeedbackButtons({ msgId }: FeedbackButtonsProps) {
  const [feedback, setFeedback] = useState<FeedbackValue>(() => {
    return loadFeedback()[msgId] ?? null;
  });
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState("");
  const [commentSent, setCommentSent] = useState(false);

  const handleFeedback = useCallback(
    (value: FeedbackValue) => {
      // Toggle off if same value clicked
      const newVal = feedback === value ? null : value;
      setFeedback(newVal);
      saveFeedback(msgId, newVal);

      // Show comment field for negative feedback
      if (newVal === "down") {
        setShowComment(true);
        setCommentSent(false);
      } else {
        setShowComment(false);
      }
    },
    [feedback, msgId],
  );

  const sendComment = useCallback(() => {
    if (!comment.trim()) return;
    saveFeedback(msgId, "down", comment.trim());
    setCommentSent(true);
    setShowComment(false);
  }, [comment, msgId]);

  return (
    <div className="no-print mt-1.5 flex items-center gap-1">
      {/* Thumbs up */}
      <button
        type="button"
        onClick={() => handleFeedback("up")}
        className={`group rounded-md p-1 transition-all ${
          feedback === "up"
            ? "text-emerald-500 dark:text-emerald-400"
            : "text-muted/50 hover:text-emerald-500 dark:hover:text-emerald-400"
        }`}
        aria-label="Koristan odgovor"
        aria-pressed={feedback === "up"}
      >
        <svg
          className="h-3.5 w-3.5"
          fill={feedback === "up" ? "currentColor" : "none"}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"
          />
        </svg>
      </button>

      {/* Thumbs down */}
      <button
        type="button"
        onClick={() => handleFeedback("down")}
        className={`group rounded-md p-1 transition-all ${
          feedback === "down"
            ? "text-red-400 dark:text-red-400"
            : "text-muted/50 hover:text-red-400 dark:hover:text-red-400"
        }`}
        aria-label="Nekoristan odgovor"
        aria-pressed={feedback === "down"}
      >
        <svg
          className="h-3.5 w-3.5"
          fill={feedback === "down" ? "currentColor" : "none"}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H10zM17 2h2.67A2.31 2.31 0 0122 4v7a2.31 2.31 0 01-2.33 2H17"
          />
        </svg>
      </button>

      {/* Optional comment for negative feedback */}
      {showComment && (
        <div className="ml-2 flex items-center gap-1.5 animate-fade-in-up">
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendComment()}
            placeholder="Šta nije bilo dobro?"
            className="rounded-lg border border-border/60 bg-surface/80 px-2.5 py-1 text-xs outline-none
                       focus:border-primary/40 focus:ring-1 focus:ring-primary/10 w-44 sm:w-56"
            maxLength={200}
            autoFocus
          />
          <button
            type="button"
            onClick={sendComment}
            disabled={!comment.trim()}
            className="rounded-lg bg-primary/10 px-2 py-1 text-xs font-medium text-primary
                       hover:bg-primary/20 disabled:opacity-40 transition-colors"
          >
            Pošalji
          </button>
        </div>
      )}

      {/* Comment confirmation */}
      {commentSent && (
        <span className="ml-2 text-xs text-muted animate-fade-in-up">
          Hvala na povratnoj informaciji!
        </span>
      )}
    </div>
  );
});
