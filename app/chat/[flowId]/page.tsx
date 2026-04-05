"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { useChat } from "../../hooks/useChat";
import { ChatHeader } from "../../components/ChatHeader";
import { ChatMessage, TypingIndicator } from "../../components/ChatMessage";
import { ChatInput } from "../../components/ChatInput";
import { SuggestionChips } from "../../components/SuggestionChips";
import { SaveChecklistBanner } from "../../components/SaveChecklistBanner";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import { ChatHistorySidebar } from "../../components/ChatHistorySidebar";
import { track } from "../../lib/analytics";
import { buildShareUrl } from "../../lib/share";
import { getFlow } from "../../lib/flows";
import { useEffect, useCallback } from "react";

export default function ChatFlowPage() {
  return (
    <Suspense>
      <ChatFlowPageInner />
    </Suspense>
  );
}

function ChatFlowPageInner() {
  const { flowId } = useParams<{ flowId: string }>();
  const searchParams = useSearchParams();
  const initialSessionId = searchParams.get("session");
  const consultItem = searchParams.get("consult");
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    sessionId,
    switchSession,
    startNewSession,
  } = useChat(flowId, initialSessionId, consultItem);

  // Track page view once
  useEffect(() => {
    track("page.view", { page: `chat/${flowId}` });
  }, [flowId]);

  // Share checklist handler
  const handleShareChecklist = useCallback(async () => {
    const flow = getFlow(flowId);
    const checklistMsg = [...messages].reverse().find((m) => m.role === "ai" && flow.isChecklist(m.text));
    if (!checklistMsg) return;
    const url = buildShareUrl({
      title: flow.title,
      flowId: flow.id,
      params: flow.extractParams(messages),
      markdown: checklistMsg.text,
      date: new Date().toISOString(),
    });
    if (navigator.share) {
      await navigator.share({ title: "BezPapira \u2014 Lista koraka", url });
    } else {
      await navigator.clipboard.writeText(url);
    }
    track("checklist.shared");
  }, [flowId, messages]);

  return (
    <ErrorBoundary>
    <div className="flex h-dvh">
      {/* ─── History sidebar ─── */}
      <ChatHistorySidebar
        flowId={flowId}
        activeSessionId={sessionId}
        onSelectSession={switchSession}
        onNewChat={startNewSession}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex flex-1 flex-col min-w-0">
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
        onToggleHistory={() => setSidebarOpen((v) => !v)}
        flowId={flowId}
      />

      {/* ─── Offline banner ─── */}
      {!isOnline && (
        <div
          className="no-print shrink-0 bg-red-500/90 text-white text-center text-sm py-2 px-4 flex items-center justify-center gap-2 animate-slide-down"
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
              flowId={flowId}
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
              onShare={handleShareChecklist}
              flowId={flowId}
              flowTitle={(() => { try { return getFlow(flowId).title; } catch { return undefined; } })()}
              flowIcon={(() => { try { return getFlow(flowId).icon; } catch { return undefined; } })()}
              completedSteps={currentStep}
              totalSteps={totalSteps}
              summary={(() => {
                try {
                  const params = getFlow(flowId).extractParams(messages);
                  return Object.values(params).filter(Boolean).join(" · ") || undefined;
                } catch { return undefined; }
              })()}
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
    </div>
    </ErrorBoundary>
  );
}
