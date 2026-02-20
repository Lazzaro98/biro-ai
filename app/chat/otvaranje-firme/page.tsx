"use client";

import { useEffect } from "react";
import { useChat } from "../../hooks/useChat";
import { ChatHeader } from "../../components/ChatHeader";
import { ChatMessage, TypingIndicator } from "../../components/ChatMessage";
import { ChatInput } from "../../components/ChatInput";
import { SuggestionChips } from "../../components/SuggestionChips";
import { SaveChecklistBanner } from "../../components/SaveChecklistBanner";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import { track } from "../../lib/analytics";

export default function ChatOtvaranjeFirme() {
  const {
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
  } = useChat();

  // Track page view once
  useEffect(() => {
    track("page.view", { page: "chat/otvaranje-firme" });
  }, []);

  return (
    <ErrorBoundary>
    <div className="flex h-dvh flex-col">
      {/* ─── Top bar ─── */}
      <ChatHeader
        progressPct={progressPct}
        currentStep={currentStep}
        totalSteps={totalSteps}
        isDone={isDone}
        isOnline={isOnline}
        isSending={isSending}
        elapsed={elapsed}
        showNewChat={messages.length > 1}
        onResetChat={resetChat}
      />

      {/* ─── Offline banner ─── */}
      {!isOnline && (
        <div
          className="no-print shrink-0 bg-red-500/90 text-white text-center text-sm py-2 px-4 flex items-center justify-center gap-2"
          role="alert"
        >
          <svg
            className="h-4 w-4 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M18.364 5.636a9 9 0 11-12.728 0M12 9v4m0 4h.01"
            />
          </svg>
          Nema internet konekcije
        </div>
      )}

      {/* ─── Messages area ─── */}
      <div
        className="flex-1 overflow-y-auto overscroll-y-contain"
        role="log"
        aria-label="Poruke"
        aria-live="polite"
      >
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 space-y-5">
          {messages.map((m, i) => (
            <ChatMessage
              key={i}
              msg={m}
              index={i}
              totalMessages={messages.length}
              isSending={isSending}
              onRetry={retryLast}
            />
          ))}

          {/* Typing indicator */}
          {isSending && messages[messages.length - 1]?.role !== "ai" && (
            <TypingIndicator elapsed={elapsed} />
          )}

          {/* Suggestion chips */}
          {activeSuggestions && (
            <SuggestionChips
              suggestions={activeSuggestions}
              onSelect={sendText}
            />
          )}

          {/* Save checklist banner */}
          {hasChecklist && !isSending && (
            <SaveChecklistBanner
              checklistSaved={checklistSaved}
              onSave={handleSaveChecklist}
            />
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* ─── Input bar ─── */}
      <ChatInput
        input={input}
        setInput={setInput}
        isSending={isSending}
        isOnline={isOnline}
        activeSuggestions={activeSuggestions}
        inputRef={inputRef}
        onSend={sendMessage}
        onKeyDown={onKeyDown}
      />
    </div>
    </ErrorBoundary>
  );
}
