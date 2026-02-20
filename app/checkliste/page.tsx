"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import ChecklistRenderer from "../components/ChecklistRenderer";
import ThemeToggle from "../components/ThemeToggle";
import { FLOWS } from "../lib/flows";
import { buildShareUrl } from "../lib/share";

/* ── Types ── */

type SavedChecklist = {
  id: string;
  date: string;
  flowId?: string;
  params: Record<string, string | undefined>;
  markdown: string;
};

type ChecklistProgress = { checked: number; total: number };

/* ── Helpers ── */

const CHECKLISTS_KEY = "biro-ai:checkliste";
const CHECKS_KEY = "biro-ai:checks";

function loadChecklists(): SavedChecklist[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CHECKLISTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function loadChecks(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(CHECKS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/** Count checked / total tasks for a checklist by scanning its markdown */
function getProgress(checklistId: string, markdown: string, checks: Record<string, boolean>): ChecklistProgress {
  const lines = markdown.split("\n");
  let total = 0;
  let checked = 0;
  lines.forEach((line, i) => {
    if (/^\s*-\s*\[[ x]\]/i.test(line)) {
      total++;
      if (checks[`${checklistId}:${i}`]) checked++;
    }
  });
  return { checked, total };
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

/** Get flow metadata (icon + title), or fallback for unknown flows */
function getFlowMeta(flowId?: string) {
  if (!flowId) return { icon: "📋", title: "Checklista" };
  const flow = FLOWS[flowId];
  return flow ? { icon: flow.icon, title: flow.title } : { icon: "📋", title: "Checklista" };
}

/** Build a descriptive card title from params + flow */
function getCardTitle(item: SavedChecklist): string {
  const { params, flowId } = item;
  // Use first non-empty param value as primary label
  const vals = Object.values(params).filter(Boolean);
  if (vals.length > 0) {
    const primary = vals[0]!;
    const secondary = params.grad || vals[1];
    return secondary && secondary !== primary ? `${primary} — ${secondary}` : primary;
  }
  // Fallback to flow title
  return getFlowMeta(flowId).title;
}

/** Unique flow IDs present in saved checklists */
function getUniqueFlows(items: SavedChecklist[]): string[] {
  const set = new Set<string>();
  items.forEach((c) => { if (c.flowId) set.add(c.flowId); });
  return Array.from(set);
}

/* ── Component ── */

export default function ChecklistePage() {
  const [items, setItems] = useState<SavedChecklist[]>([]);
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [openId, setOpenId] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [shared, setShared] = useState<string | null>(null);
  const [filter, setFilter] = useState<string | null>(null); // null = all
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    setItems(loadChecklists());
    setChecks(loadChecks());
  }, []);

  // Re-read checks when returning from detail view (user may have toggled items)
  useEffect(() => {
    if (!openId) setChecks(loadChecks());
  }, [openId]);

  const uniqueFlows = useMemo(() => getUniqueFlows(items), [items]);

  const filteredItems = useMemo(
    () => filter ? items.filter((c) => c.flowId === filter) : items,
    [items, filter],
  );

  // Overall stats
  const stats = useMemo(() => {
    let totalTasks = 0;
    let checkedTasks = 0;
    items.forEach((item) => {
      const p = getProgress(item.id, item.markdown, checks);
      totalTasks += p.total;
      checkedTasks += p.checked;
    });
    return { totalTasks, checkedTasks, completionPct: totalTasks > 0 ? Math.round((checkedTasks / totalTasks) * 100) : 0 };
  }, [items, checks]);

  const deleteItem = useCallback(
    (id: string) => {
      const updated = items.filter((c) => c.id !== id);
      setItems(updated);
      localStorage.setItem(CHECKLISTS_KEY, JSON.stringify(updated));
      if (openId === id) setOpenId(null);
      setDeleteConfirm(null);
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
        {/* ── Header ── */}
        <div className="no-print flex items-center gap-3 mb-6">
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
                : `${items.length} checklis${items.length === 1 ? "ta" : "te"}`}
            </p>
          </div>
          <div className="flex-1" />
          <ThemeToggle />
        </div>

        {/* ── Stats bar ── */}
        {items.length > 0 && !openItem && (
          <div className="no-print mb-6 rounded-2xl glass-card p-4 animate-fade-in-up">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-dark">Ukupan napredak</span>
              <span className="text-sm font-bold text-primary">{stats.completionPct}%</span>
            </div>
            <div className="h-2 rounded-full bg-surface-alt overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-primary-dark transition-all duration-500"
                style={{ width: `${stats.completionPct}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-muted">
              <span>{stats.checkedTasks} od {stats.totalTasks} stavki završeno</span>
              <span>{items.length} checklis{items.length === 1 ? "ta" : "te"}</span>
            </div>
          </div>
        )}

        {/* ── Filter tabs ── */}
        {uniqueFlows.length > 1 && !openItem && (
          <div className="no-print mb-5 flex flex-wrap gap-2 animate-fade-in-up">
            <button
              type="button"
              onClick={() => setFilter(null)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200
                ${filter === null
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "bg-surface-alt text-muted-dark hover:text-foreground hover:bg-border-light"
                }`}
            >
              Sve ({items.length})
            </button>
            {uniqueFlows.map((fid) => {
              const meta = getFlowMeta(fid);
              const count = items.filter((c) => c.flowId === fid).length;
              return (
                <button
                  key={fid}
                  type="button"
                  onClick={() => setFilter(fid)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200
                    ${filter === fid
                      ? "bg-primary text-white shadow-md shadow-primary/20"
                      : "bg-surface-alt text-muted-dark hover:text-foreground hover:bg-border-light"
                    }`}
                >
                  {meta.icon} {meta.title} ({count})
                </button>
              );
            })}
          </div>
        )}

        {/* ── Empty state ── */}
        {items.length === 0 && (
          <div className="rounded-2xl glass-card gradient-border p-6 sm:p-10 text-center animate-fade-in-up-delay-1">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-alt text-3xl glow-icon" aria-hidden="true">
              📋
            </div>
            <h2 className="text-lg font-semibold">Nemaš još checklisti</h2>
            <p className="mt-2 text-sm text-muted-dark max-w-sm mx-auto">
              Prođi kroz AI vodič i sačuvaj generisanu cheklistu da je pratiš ovde.
            </p>
            <a
              href="/"
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

        {/* ── Detail view ── */}
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
              {/* Meta header with flow badge */}
              <div className="border-b border-border/50 bg-card-bg backdrop-blur-sm px-4 sm:px-5 py-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg" aria-hidden="true">{getFlowMeta(openItem.flowId).icon}</span>
                  <div>
                    <div className="text-sm font-medium">{getFlowMeta(openItem.flowId).title}</div>
                    <div className="text-xs text-muted">{formatDate(openItem.date)}</div>
                  </div>
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
                    onClick={async () => {
                      const url = buildShareUrl({
                        title: getFlowMeta(openItem.flowId).title,
                        flowId: openItem.flowId,
                        params: openItem.params,
                        markdown: openItem.markdown,
                        date: openItem.date,
                      });
                      try {
                        if (navigator.share) {
                          await navigator.share({ title: "Biro AI — Checklista", url });
                        } else {
                          await navigator.clipboard.writeText(url);
                        }
                        setShared(openItem.id);
                        setTimeout(() => setShared(null), 2500);
                      } catch { /* user cancelled share */ }
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium
                               text-muted-dark hover:bg-border-light hover:text-foreground transition-colors"
                  >
                    {shared === openItem.id ? (
                      <>
                        <svg className="h-3.5 w-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Podeljeno!
                      </>
                    ) : (
                      <>
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                        </svg>
                        Podeli
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteConfirm(openItem.id)}
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

              {/* Params pills — generic, works for any flow */}
              {Object.entries(openItem.params).some(([, v]) => v) && (
                <div className="px-5 pt-4 flex flex-wrap gap-2">
                  {Object.entries(openItem.params).map(([key, val]) =>
                    val ? (
                      <span
                        key={key}
                        className="rounded-full bg-surface-alt border border-border-light px-3 py-1 text-xs font-medium text-muted-dark"
                      >
                        {val}
                      </span>
                    ) : null,
                  )}
                </div>
              )}

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

        {/* ── List view ── */}
        {!openItem && filteredItems.length > 0 && (
          <div className="space-y-3" role="list" aria-label="Sačuvane checkliste">
            {filteredItems.map((item) => {
              const meta = getFlowMeta(item.flowId);
              const progress = getProgress(item.id, item.markdown, checks);
              const pct = progress.total > 0 ? Math.round((progress.checked / progress.total) * 100) : 0;
              const isComplete = pct === 100;
              return (
                <div key={item.id} className="relative" role="listitem">
                  <button
                    type="button"
                    onClick={() => setOpenId(item.id)}
                    className="group w-full text-left rounded-2xl glass-card p-5
                               hover:shadow-lg hover:shadow-primary/10 transition-all duration-300"
                  >
                    <div className="flex items-start gap-4">
                      {/* Flow icon */}
                      <div className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg transition-all duration-300
                        ${isComplete
                          ? "bg-emerald-100 dark:bg-emerald-500/15"
                          : "bg-gradient-to-br from-primary/15 to-purple-500/10 group-hover:from-primary/25 group-hover:to-purple-500/15"
                        }`} aria-hidden="true">
                        {isComplete ? (
                          <svg className="h-5 w-5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          meta.icon
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Title */}
                        <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {getCardTitle(item)}
                        </div>

                        {/* Flow label */}
                        <div className="mt-0.5 text-xs text-muted">
                          {meta.icon} {meta.title}
                        </div>

                        {/* Mini progress bar */}
                        {progress.total > 0 && (
                          <div className="mt-2 flex items-center gap-2">
                            <div className="flex-1 h-1.5 rounded-full bg-surface-alt overflow-hidden max-w-32">
                              <div
                                className={`h-full rounded-full transition-all duration-500
                                  ${isComplete
                                    ? "bg-emerald-500"
                                    : "bg-gradient-to-r from-primary to-primary-dark"
                                  }`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className={`text-xs font-medium ${isComplete ? "text-emerald-600 dark:text-emerald-400" : "text-muted"}`}>
                              {progress.checked}/{progress.total}
                            </span>
                          </div>
                        )}

                        {/* Date */}
                        <div className="mt-1.5 text-xs text-muted">
                          {formatDate(item.date)}
                        </div>
                      </div>

                      <svg className="h-5 w-5 text-muted shrink-0 mt-1 group-hover:text-primary group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>

                  {/* Quick delete on swipe / hover */}
                  <button
                    type="button"
                    onClick={() => setDeleteConfirm(item.id)}
                    className="no-print absolute top-3 right-3 opacity-0 group-hover:opacity-100 focus:opacity-100
                               h-8 w-8 flex items-center justify-center rounded-lg text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                    aria-label="Obriši cheklistu"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Filtered empty */}
        {!openItem && filteredItems.length === 0 && items.length > 0 && (
          <div className="text-center py-12 text-muted-dark animate-fade-in-up">
            <p className="text-sm">Nema checklisti za ovaj filter.</p>
            <button
              type="button"
              onClick={() => setFilter(null)}
              className="mt-3 text-sm text-primary hover:underline"
            >
              Prikaži sve
            </button>
          </div>
        )}
      </div>

      {/* ── Delete confirmation modal ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black/40 backdrop-blur-sm animate-fade-in-up"
             onClick={() => setDeleteConfirm(null)}>
          <div
            className="w-full max-w-sm rounded-2xl glass-card p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 dark:bg-red-500/15">
                <svg className="h-5 w-5 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Obriši cheklistu?</h3>
                <p className="text-sm text-muted-dark">Ovo se ne može poništiti.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-medium
                           hover:bg-surface-alt transition-colors"
              >
                Otkaži
              </button>
              <button
                type="button"
                onClick={() => deleteItem(deleteConfirm)}
                className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white
                           hover:bg-red-700 transition-colors"
              >
                Obriši
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
