"use client";

import { memo, useState, useEffect, useCallback, useRef } from "react";
import type { SuggestionStep } from "../lib/chat-constants";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";

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

/** Animated microphone icon — pulses when listening */
function MicIcon({ isListening }: { isListening: boolean }) {
  return (
    <div className="relative flex items-center justify-center">
      {/* Pulse rings when listening */}
      {isListening && (
        <>
          <span className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" />
          <span className="absolute -inset-1 rounded-full bg-red-500/10 animate-pulse" />
        </>
      )}
      <svg
        className={`h-5 w-5 relative z-10 transition-colors duration-200 ${
          isListening ? "text-red-500" : "text-muted-dark"
        }`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
        />
      </svg>
    </div>
  );
}

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
  // Track what the user typed before voice started
  const preVoiceInputRef = useRef("");

  const handleVoiceTranscript = useCallback(
    (text: string) => {
      // Append voice transcript to any existing input
      const prefix = preVoiceInputRef.current;
      const separator = prefix && !prefix.endsWith(" ") ? " " : "";
      setInput(prefix + separator + text);
    },
    [setInput],
  );

  const {
    isSupported,
    status,
    transcript,
    interimTranscript,
    toggleListening,
    stopListening,
  } = useSpeechRecognition("sr", handleVoiceTranscript);

  const isListening = status === "listening";

  // When voice starts, save current input
  useEffect(() => {
    if (isListening) {
      preVoiceInputRef.current = input;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListening]);

  // Live preview: show interim transcript in input while listening
  useEffect(() => {
    if (isListening && transcript) {
      const prefix = preVoiceInputRef.current;
      const separator = prefix && !prefix.endsWith(" ") ? " " : "";
      setInput(prefix + separator + transcript);
    }
  }, [isListening, transcript, setInput]);

  // Stop listening when sending
  useEffect(() => {
    if (isSending && isListening) {
      stopListening();
    }
  }, [isSending, isListening, stopListening]);

  // Error toast state
  const [showError, setShowError] = useState(false);
  useEffect(() => {
    if (status === "error") {
      setShowError(true);
      const t = setTimeout(() => setShowError(false), 4000);
      return () => clearTimeout(t);
    }
  }, [status]);

  return (
    <div className="no-print shrink-0 border-t border-border/60 bg-surface/70 backdrop-blur-md sm:backdrop-blur-xl pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto max-w-3xl px-4 py-3 sm:px-6">
        {activeSuggestions && !activeSuggestions.allowFreeText && (
          <p className="mb-2 text-center text-xs text-muted">
            Izaberi jednu od opcija iznad ili piši slobodno 👇
          </p>
        )}

        {/* Listening indicator banner */}
        {isListening && (
          <div className="mb-2 flex items-center justify-center gap-2 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 px-3 py-2 animate-fade-in-up">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
            </span>
            <span className="text-xs font-medium text-red-600 dark:text-red-400">
              Slušam... govori jasno
            </span>
            {interimTranscript && (
              <span className="text-xs text-red-400 dark:text-red-500 italic truncate max-w-40">
                „{interimTranscript}"
              </span>
            )}
          </div>
        )}

        {/* Error toast */}
        {showError && (
          <div className="mb-2 flex items-center justify-center gap-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-3 py-2 animate-fade-in-up">
            <svg className="h-4 w-4 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <span className="text-xs text-amber-700 dark:text-amber-400">
              Mikrofon nije dostupan. Proveri dozvole u browseru.
            </span>
          </div>
        )}

        <div
          className={`flex items-center gap-2.5 rounded-2xl border bg-card-bg backdrop-blur-sm p-1.5
                     focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10 focus-within:bg-card-bg-hover transition-all duration-200
                     ${isListening
                       ? "border-red-300 dark:border-red-500/30 ring-2 ring-red-500/10"
                       : "border-border/60"
                     }`}
        >
          {/* Mic button — only shown if browser supports Speech API */}
          {isSupported && (
            <button
              type="button"
              onClick={toggleListening}
              disabled={isSending || !isOnline}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-200
                active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed
                ${isListening
                  ? "bg-red-100 dark:bg-red-500/15 hover:bg-red-200 dark:hover:bg-red-500/25"
                  : "hover:bg-surface-alt"
                }`}
              aria-label={isListening ? "Zaustavi snimanje" : "Govori poruku"}
              title={isListening ? "Zaustavi snimanje" : "Govori poruku"}
            >
              <MicIcon isListening={isListening} />
            </button>
          )}

          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            className="flex-1 bg-transparent px-3 py-2.5 text-base outline-none placeholder:text-muted"
            placeholder={
              isListening
                ? "Govorim..."
                : activeSuggestions && !activeSuggestions.allowFreeText
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
