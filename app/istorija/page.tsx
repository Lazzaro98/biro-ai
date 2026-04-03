"use client";

import { useState, useEffect, useCallback } from "react";
import { getSessions, deleteSession, type ChatSession } from "../lib/chat-sessions";
import { FLOWS } from "../lib/flows";
import ThemeToggle from "../components/ThemeToggle";
import UserMenu from "../components/UserMenu";

export default function IstorijaPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const refresh = useCallback(() => {
    const all = getSessions();
    setSessions(all);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const filtered = filter === "all" ? sessions : sessions.filter((s) => s.flowId === filter);

  const handleDelete = (sessionId: string) => {
    if (confirmDeleteId === sessionId) {
      deleteSession(sessionId);
      setConfirmDeleteId(null);
      refresh();
    } else {
      setConfirmDeleteId(sessionId);
      setTimeout(() => setConfirmDeleteId(null), 3000);
    }
  };

  // Group by date
  const groups = groupByDate(filtered);

  return (
    <main className="min-h-dvh bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border/60 bg-surface/70 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3 sm:px-6">
          <a
            href="/"
            className="flex h-11 w-11 items-center justify-center rounded-xl hover:bg-surface-alt transition-colors"
            aria-label="Nazad na početnu"
          >
            <svg className="h-5 w-5 text-muted-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </a>

          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-lg">
              🕐
            </div>
            <h1 className="text-sm font-semibold">Istorija razgovora</h1>
          </div>

          <div className="flex-1" />

          <UserMenu />
          <ThemeToggle />
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        {/* Filter tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          <FilterButton
            label="Svi"
            active={filter === "all"}
            onClick={() => setFilter("all")}
            count={sessions.length}
          />
          {Object.entries(FLOWS).map(([id, flow]) => {
            const count = sessions.filter((s) => s.flowId === id).length;
            if (count === 0) return null;
            return (
              <FilterButton
                key={id}
                label={`${flow.icon} ${flow.title}`}
                active={filter === id}
                onClick={() => setFilter(id)}
                count={count}
              />
            );
          })}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-muted-dark text-sm">
              {sessions.length === 0
                ? "Nemaš još razgovora. Započni prvi!"
                : "Nema razgovora za ovaj filter."}
            </p>
            {sessions.length === 0 && (
              <a
                href="/"
                className="inline-flex mt-4 items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white
                           hover:bg-primary-dark active:scale-95 transition-all"
              >
                Započni razgovor
              </a>
            )}
          </div>
        )}

        {/* Session groups */}
        {groups.map(({ label, items }) => (
          <div key={label} className="mb-6">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted mb-3 px-1">
              {label}
            </h2>
            <div className="space-y-2">
              {items.map((session) => {
                const flow = FLOWS[session.flowId];
                const msgCount = session.messages.filter((m) => m.role === "user").length;
                const time = new Date(session.updatedAt).toLocaleTimeString("sr-Latn-RS", {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div
                    key={session.id}
                    className="group relative flex items-start gap-3 rounded-xl border border-border/60 bg-card-bg p-4
                               hover:shadow-sm hover:border-primary/20 transition-all"
                  >
                    <a
                      href={`/chat/${session.flowId}?session=${session.id}`}
                      className="absolute inset-0 rounded-xl"
                      aria-label={`Otvori: ${session.title}`}
                    />

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-lg z-10">
                      {flow?.icon ?? "📋"}
                    </div>

                    <div className="flex-1 min-w-0 z-10">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground truncate">
                          {session.title}
                        </span>
                        {session.completed && (
                          <span className="text-xs" title="Checklista generisana">✅</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted">
                          {flow?.title ?? session.flowId}
                        </span>
                        <span className="text-xs text-muted">•</span>
                        <span className="text-xs text-muted">
                          {msgCount} {msgCount === 1 ? "poruka" : msgCount < 5 ? "poruke" : "poruka"}
                        </span>
                        <span className="text-xs text-muted">•</span>
                        <span className="text-xs text-muted">{time}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDelete(session.id);
                      }}
                      className={`
                        relative z-10 shrink-0 flex h-8 w-8 items-center justify-center rounded-lg transition-all
                        ${confirmDeleteId === session.id
                          ? "bg-red-500/15 text-red-500"
                          : "opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-muted hover:text-red-500"
                        }
                      `}
                      aria-label={confirmDeleteId === session.id ? "Potvrdi brisanje" : "Obriši"}
                      title={confirmDeleteId === session.id ? "Klikni ponovo za brisanje" : "Obriši"}
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

/* ── Filter button ─── */
function FilterButton({
  label,
  active,
  onClick,
  count,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        shrink-0 flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all
        ${active
          ? "bg-primary text-white shadow-sm"
          : "bg-surface-alt text-muted-dark hover:text-foreground hover:bg-surface-alt/80"
        }
      `}
    >
      {label}
      <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${active ? "bg-white/20" : "bg-border/60"}`}>
        {count}
      </span>
    </button>
  );
}

/* ── Group sessions by date ─── */
function groupByDate(sessions: ChatSession[]): { label: string; items: ChatSession[] }[] {
  const groups: Record<string, ChatSession[]> = {};

  for (const s of sessions) {
    const date = new Date(s.updatedAt);
    const label = getDateLabel(date);
    if (!groups[label]) groups[label] = [];
    groups[label].push(s);
  }

  return Object.entries(groups).map(([label, items]) => ({ label, items }));
}

function getDateLabel(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diff = Math.floor((today.getTime() - target.getTime()) / 86_400_000);

  if (diff === 0) return "Danas";
  if (diff === 1) return "Juče";
  if (diff < 7) return "Ove nedelje";
  if (diff < 30) return "Ovog meseca";

  return date.toLocaleDateString("sr-Latn-RS", { month: "long", year: "numeric" });
}
