"use client";

import { useEffect, useState, useCallback } from "react";
import ChecklistRenderer from "../components/ChecklistRenderer";
import ThemeToggle from "../components/ThemeToggle";

type SavedChecklist = {
  id: string;
  date: string;
  flowId?: string;
  params: { grad?: string; tip?: string; delatnost?: string; oporezivanje?: string };
  markdown: string;
};

const CHECKLISTS_KEY = "biro-ai:checkliste";

function loadChecklists(): SavedChecklist[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CHECKLISTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("sr-Latn-RS", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function ChecklistePage() {
  const [items, setItems] = useState<SavedChecklist[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    setItems(loadChecklists());
  }, []);

  const deleteItem = useCallback(
    (id: string) => {
      const updated = items.filter((c) => c.id !== id);
      setItems(updated);
      localStorage.setItem(CHECKLISTS_KEY, JSON.stringify(updated));
      if (openId === id) setOpenId(null);
    },
    [items, openId],
  );

  const copyToClipboard = useCallback(
    async (id: string, markdown: string) => {
      try {
        await navigator.clipboard.writeText(markdown);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
      } catch { /* fallback: do nothing */ }
    },
    [],
  );

  const openItem = items.find((c) => c.id === openId);

  return (
    <main className="relative min-h-dvh px-5 py-10 overflow-x-hidden" aria-label="Moje checkliste">
      <div className="relative z-10 mx-auto max-w-2xl">
        {/* Header */}
        <div className="no-print flex items-center gap-3 mb-8">
          <a
            href="/"
            className="flex h-11 w-11 items-center justify-center rounded-xl hover:bg-surface-alt transition-colors"
            aria-label="Nazad na početnu"
          >
            <svg className="h-5 w-5 text-muted-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </a>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Moje checkliste</h1>
            <p className="text-sm text-muted-dark">
              {items.length === 0
                ? "Još nema sačuvanih checklisti"
                : `${items.length} sačuvan${items.length === 1 ? "a" : "e"} checkliste`}
            </p>
          </div>
          <div className="flex-1" />
          <ThemeToggle />
        </div>

        {/* Empty state */}
        {items.length === 0 && (
          <div className="rounded-2xl glass-card gradient-border p-6 sm:p-10 text-center animate-fade-in-up-delay-1">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-alt text-3xl glow-icon" aria-hidden="true">
              📋
            </div>
            <h2 className="text-lg font-semibold">Nemaš još checklisti</h2>
            <p className="mt-2 text-sm text-muted-dark max-w-sm mx-auto">
              Prođi kroz AI vodič za otvaranje firme i sačuvaj generisanu cheklistu.
            </p>
            <a
              href="/start/otvaranje-firme"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-dark px-5 py-2.5 text-sm font-semibold text-white
                         hover:shadow-lg hover:shadow-primary/25 transition-all"
            >
              Započni razgovor
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
        )}

        {/* Detail view */}
        {openItem && (
          <div className="mb-6 animate-msg-in">
            {/* Back to list */}
            <button
              type="button"
              onClick={() => setOpenId(null)}
              className="no-print mb-4 inline-flex items-center gap-1 text-sm text-muted-dark hover:text-primary transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Nazad na listu
            </button>

            <div className="rounded-2xl glass-card gradient-border overflow-hidden">
              {/* Meta header */}
              <div className="border-b border-border/50 bg-card-bg backdrop-blur-sm px-4 sm:px-5 py-3 flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm text-muted-dark">
                  {formatDate(openItem.date)}
                </div>
                <div className="flex items-center gap-2 no-print">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium
                               text-muted-dark hover:bg-border-light hover:text-foreground transition-colors"
                    title="Štampaj / sačuvaj kao PDF"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Štampaj
                  </button>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(openItem.id, openItem.markdown)}
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium
                               text-muted-dark hover:bg-border-light hover:text-foreground transition-colors"
                  >
                    {copied === openItem.id ? (
                      <>
                        <svg className="h-3.5 w-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Kopirano!
                      </>
                    ) : (
                      <>
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Kopiraj
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteItem(openItem.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium
                               text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Obriši
                  </button>
                </div>
              </div>

              {/* Params pills */}
              <div className="px-5 pt-4 flex flex-wrap gap-2">
                {openItem.params.tip && (
                  <span className="rounded-full bg-primary-ghost px-3 py-1 text-xs font-medium text-primary">
                    {openItem.params.tip}
                  </span>
                )}
                {openItem.params.grad && (
                  <span className="rounded-full bg-surface-alt border border-border-light px-3 py-1 text-xs font-medium text-muted-dark">
                    📍 {openItem.params.grad}
                  </span>
                )}
                {openItem.params.delatnost && (
                  <span className="rounded-full bg-surface-alt border border-border-light px-3 py-1 text-xs font-medium text-muted-dark">
                    💼 {openItem.params.delatnost}
                  </span>
                )}
                {openItem.params.oporezivanje && (
                  <span className="rounded-full bg-surface-alt border border-border-light px-3 py-1 text-xs font-medium text-muted-dark">
                    💰 {openItem.params.oporezivanje}
                  </span>
                )}
              </div>

              {/* Checklist content */}
              <div className="px-5 py-5">
                <ChecklistRenderer
                  checklistId={openItem.id}
                  markdown={openItem.markdown}
                  showProgress
                  flowId={openItem.flowId}
                />
              </div>
            </div>
          </div>
        )}

        {/* List view */}
        {!openItem && items.length > 0 && (
          <div className="space-y-3" role="list" aria-label="Sačuvane checkliste">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setOpenId(item.id)}
                className="group w-full text-left rounded-2xl glass-card p-5
                           hover:shadow-lg hover:shadow-primary/10 transition-all duration-300"
                role="listitem"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-purple-500/10 text-lg
                                  group-hover:from-primary/25 group-hover:to-purple-500/15 transition-all duration-300" aria-hidden="true">
                    📋
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {item.params.tip || "Firma"}{" "}
                      {item.params.grad ? `— ${item.params.grad}` : ""}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {item.params.delatnost && (
                        <span className="rounded-full bg-surface-alt px-2.5 py-0.5 text-xs font-medium text-muted-dark">
                          {item.params.delatnost}
                        </span>
                      )}
                      {item.params.oporezivanje && (
                        <span className="rounded-full bg-surface-alt px-2.5 py-0.5 text-xs font-medium text-muted-dark">
                          {item.params.oporezivanje}
                        </span>
                      )}
                    </div>
                    <div className="mt-2 text-xs text-muted">
                      {formatDate(item.date)}
                    </div>
                  </div>
                  <svg className="h-5 w-5 text-muted shrink-0 mt-1 group-hover:text-primary group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
