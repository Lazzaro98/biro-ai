"use client";

import { useEffect, useState, useCallback } from "react";
import type { ChatSession } from "../lib/chat-sessions";
import { getSessions, deleteSession } from "../lib/chat-sessions";
import { FLOWS } from "../lib/flows";

interface ChatHistorySidebarProps {
  flowId: string;
  activeSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export function ChatHistorySidebar({
  flowId,
  activeSessionId,
  onSelectSession,
  onNewChat,
  isOpen,
  onClose,
}: ChatHistorySidebarProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const refreshSessions = useCallback(() => {
    setSessions(getSessions(flowId));
  }, [flowId]);

  useEffect(() => {
    refreshSessions();
  }, [refreshSessions, activeSessionId]);

  const handleDelete = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    if (confirmDeleteId === sessionId) {
      deleteSession(sessionId);
      setConfirmDeleteId(null);
      refreshSessions();
      // If we deleted the active session, start a new one
      if (activeSessionId === sessionId) {
        onNewChat();
      }
    } else {
      setConfirmDeleteId(sessionId);
      // Auto-reset confirm after 3s
      setTimeout(() => setConfirmDeleteId(null), 3000);
    }
  };

  const flow = FLOWS[flowId];
  const allSessions = getSessions();
  const otherFlowSessions = allSessions.filter((s) => s.flowId !== flowId);

  // Group other sessions by flow
  const otherFlowGroups: Record<string, ChatSession[]> = {};
  for (const s of otherFlowSessions) {
    if (!otherFlowGroups[s.flowId]) otherFlowGroups[s.flowId] = [];
    otherFlowGroups[s.flowId].push(s);
  }

  return (
    <>
      {/* Backdrop (mobile) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm sm:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-dvh w-72 bg-surface border-r border-border/60
          flex flex-col transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          sm:relative sm:z-auto
          ${isOpen ? "sm:translate-x-0" : "sm:-translate-x-full sm:w-0 sm:border-0 sm:overflow-hidden"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
          <h2 className="text-sm font-semibold text-foreground">Istorija razgovora</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-surface-alt transition-colors"
            aria-label="Zatvori"
          >
            <svg className="h-4 w-4 text-muted-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* New chat button */}
        <div className="px-3 pt-3">
          <button
            type="button"
            onClick={() => { onNewChat(); onClose(); }}
            className="flex w-full items-center gap-2 rounded-xl border border-border/60 px-3 py-2.5
                       text-sm font-medium text-muted-dark hover:text-primary hover:border-primary/30
                       hover:bg-primary/5 transition-all"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Novi razgovor
          </button>
        </div>

        {/* Sessions list */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          {/* Current flow sessions */}
          {flow && (
            <div className="mb-3">
              <div className="flex items-center gap-1.5 px-2 py-1.5">
                <span className="text-sm">{flow.icon}</span>
                <span className="text-xs font-medium text-muted uppercase tracking-wider">
                  {flow.title}
                </span>
              </div>
              {sessions.length === 0 ? (
                <p className="px-2 text-xs text-muted italic">Nema prethodnih razgovora</p>
              ) : (
                sessions.map((session) => (
                  <SessionItem
                    key={session.id}
                    session={session}
                    isActive={session.id === activeSessionId}
                    isConfirmingDelete={confirmDeleteId === session.id}
                    onSelect={() => { onSelectSession(session.id); onClose(); }}
                    onDelete={(e) => handleDelete(e, session.id)}
                  />
                ))
              )}
            </div>
          )}

          {/* Other flow sessions */}
          {Object.entries(otherFlowGroups).map(([fid, fSessions]) => {
            const otherFlow = FLOWS[fid];
            if (!otherFlow) return null;
            return (
              <div key={fid} className="mb-3">
                <div className="flex items-center gap-1.5 px-2 py-1.5">
                  <span className="text-sm">{otherFlow.icon}</span>
                  <span className="text-xs font-medium text-muted uppercase tracking-wider">
                    {otherFlow.title}
                  </span>
                </div>
                {fSessions.map((session) => (
                  <SessionItem
                    key={session.id}
                    session={session}
                    isActive={false}
                    isConfirmingDelete={confirmDeleteId === session.id}
                    onSelect={() => {
                      window.location.href = `/chat/${fid}?session=${session.id}`;
                    }}
                    onDelete={(e) => handleDelete(e, session.id)}
                  />
                ))}
              </div>
            );
          })}
        </div>

        {/* Footer — link to full history */}
        <div className="border-t border-border/60 px-3 py-3">
          <a
            href="/istorija"
            className="flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-muted-dark
                       hover:text-primary hover:bg-surface-alt transition-colors"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Prikaži celu istoriju
          </a>
        </div>
      </aside>
    </>
  );
}

/* ── Session list item ─── */

function SessionItem({
  session,
  isActive,
  isConfirmingDelete,
  onSelect,
  onDelete,
}: {
  session: ChatSession;
  isActive: boolean;
  isConfirmingDelete: boolean;
  onSelect: () => void;
  onDelete: (e: React.MouseEvent) => void;
}) {
  const msgCount = session.messages.filter((m) => m.role === "user").length;
  const date = new Date(session.updatedAt);
  const timeStr = formatRelativeTime(date);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onSelect(); }}
      className={`
        group flex w-full items-start gap-2.5 rounded-xl px-3 py-2.5 text-left transition-all cursor-pointer
        ${isActive
          ? "bg-primary/10 border border-primary/20 text-foreground"
          : "hover:bg-surface-alt text-muted-dark hover:text-foreground border border-transparent"
        }
      `}
    >
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">
          {session.title}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-muted">
            {msgCount} {msgCount === 1 ? "poruka" : msgCount < 5 ? "poruke" : "poruka"}
          </span>
          <span className="text-xs text-muted">•</span>
          <span className="text-xs text-muted">{timeStr}</span>
          {session.completed && (
            <span className="text-xs" title="Checklista generisana">✅</span>
          )}
        </div>
      </div>

      {/* Delete button */}
      <button
        type="button"
        onClick={onDelete}
        className={`
          shrink-0 flex h-7 w-7 items-center justify-center rounded-lg transition-all
          ${isConfirmingDelete
            ? "bg-red-500/15 text-red-500"
            : "opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-muted hover:text-red-500"
          }
        `}
        aria-label={isConfirmingDelete ? "Potvrdi brisanje" : "Obriši razgovor"}
        title={isConfirmingDelete ? "Klikni ponovo za brisanje" : "Obriši"}
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
}

/* ── Relative time formatting ─── */

function formatRelativeTime(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const mins = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (mins < 1) return "upravo";
  if (mins < 60) return `pre ${mins} min`;
  if (hours < 24) return `pre ${hours}h`;
  if (days === 1) return "juče";
  if (days < 7) return `pre ${days} dana`;

  return date.toLocaleDateString("sr-Latn-RS", {
    day: "numeric",
    month: "short",
  });
}
