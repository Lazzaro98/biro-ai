"use client";

import { memo } from "react";
import type { SuggestionStep } from "../lib/chat-constants";

const SendIcon = memo(function SendIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
      />
    </svg>
  );
});

interface ChatInputProps {
  input: string;
  setInput: (v: string) => void;
  isSending: boolean;
  isOnline: boolean;
  activeSuggestions: SuggestionStep | null;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onSend: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export const ChatInput = memo(function ChatInput({
  input,
  setInput,
  isSending,
  isOnline,
  activeSuggestions,
  inputRef,
  onSend,
  onKeyDown,
}: ChatInputProps) {
  return (
    <div className="no-print shrink-0 border-t border-border/60 bg-surface/70 backdrop-blur-md sm:backdrop-blur-xl pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto max-w-3xl px-4 py-3 sm:px-6">
        {activeSuggestions && !activeSuggestions.allowFreeText && (
          <p className="mb-2 text-center text-xs text-muted">
            Izaberi jednu od opcija iznad ili piši slobodno 👇
          </p>
        )}
        <div
          className="flex items-center gap-2.5 rounded-2xl border border-border/60 bg-card-bg backdrop-blur-sm p-1.5
                     focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10 focus-within:bg-card-bg-hover transition-all duration-200"
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            className="flex-1 bg-transparent px-3 py-2.5 text-base outline-none placeholder:text-muted"
            placeholder={
              activeSuggestions && !activeSuggestions.allowFreeText
                ? "Ili napiši svoj odgovor…"
                : "Napiši poruku…"
            }
            disabled={isSending}
            aria-label="Unesi poruku"
          />
          <button
            type="button"
            onClick={onSend}
            disabled={isSending || !input.trim() || !isOnline}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white
                       hover:bg-primary-dark disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150
                       active:scale-95"
            aria-label="Pošalji poruku"
          >
            <SendIcon />
          </button>
        </div>
        <p className="mt-2 text-center text-xs text-muted">
          Informativno — nije pravni savet
        </p>
      </div>
    </div>
  );
});
