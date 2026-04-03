"use client";

import { memo } from "react";
import { FLOWS } from "../lib/flows";
import UserMenu from "./UserMenu";

interface ChatHeaderProps {
  progressPct: number;
  currentStep: number;
  totalSteps: number;
  isDone: boolean;
  isOnline: boolean;
  isSending: boolean;
  elapsed: number;
  showNewChat: boolean;
  onResetChat: () => void;
  onToggleHistory?: () => void;
  flowId?: string;
}

export const ChatHeader = memo(function ChatHeader({
  progressPct,
  currentStep,
  totalSteps,
  isDone,
  showNewChat,
  onResetChat,
  onToggleHistory,
  flowId,
}: ChatHeaderProps) {
  const flow = flowId ? FLOWS[flowId] : null;
  const icon = flow?.icon ?? "🏢";
  const title = flow?.title ?? "Otvaranje firme";

  return (
    <header className="no-print shrink-0 border-b border-border/60 bg-surface/70 backdrop-blur-md sm:backdrop-blur-xl shadow-sm">
      <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3 sm:px-6">
        {/* Back + History buttons */}
        <div className="flex items-center gap-1">
          <a
            href="/"
            className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-surface-alt transition-colors"
            aria-label="Nazad na početnu"
          >
            <svg
              className="h-5 w-5 text-muted-dark"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </a>

          {onToggleHistory && (
            <button
              type="button"
              onClick={onToggleHistory}
              className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-surface-alt transition-colors"
              aria-label="Istorija razgovora"
            >
              <svg
                className="h-5 w-5 text-muted-dark"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-lg">
            {icon}
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-semibold truncate">{title}</h1>
            <span className="text-xs text-muted">
              {isDone ? "✅ Gotovo" : `Korak ${currentStep + 1} od ${totalSteps}`}
            </span>
          </div>
        </div>

        <div className="flex-1" />

        {showNewChat && (
          <button
            type="button"
            onClick={onResetChat}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-dark
                       hover:bg-surface-alt hover:text-foreground transition-colors"
            aria-label="Novi razgovor"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span className="hidden sm:inline">Novi razgovor</span>
          </button>
        )}

        <UserMenu />
      </div>
    </header>
  );
});
