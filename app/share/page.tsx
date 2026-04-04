"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, useCallback } from "react";
import { decodeChecklist, type SharedChecklist } from "../lib/share";
import ChecklistRenderer from "../components/ChecklistRenderer";


const CHECKLISTS_KEY = "bezpapira:checkliste";

export default function SharePage() {
  return (
    <Suspense>
      <SharePageInner />
    </Suspense>
  );
}

function SharePageInner() {
  const searchParams = useSearchParams();
  const encoded = searchParams.get("d");

  const [data, setData] = useState<SharedChecklist | null>(null);
  const [error, setError] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!encoded) {
      setError(true);
      return;
    }
    const decoded = decodeChecklist(encoded);
    if (!decoded) {
      setError(true);
      return;
    }
    setData(decoded);
  }, [encoded]);

  const saveToLocal = useCallback(() => {
    if (!data) return;
    try {
      const raw = localStorage.getItem(CHECKLISTS_KEY);
      const existing = raw ? JSON.parse(raw) : [];
      const newItem = {
        id: crypto.randomUUID(),
        date: data.date || new Date().toISOString(),
        flowId: data.flowId || "",
        params: data.params || {},
        markdown: data.markdown,
      };
      existing.unshift(newItem);
      localStorage.setItem(CHECKLISTS_KEY, JSON.stringify(existing));
      setSaved(true);
    } catch {
      /* ignore */
    }
  }, [data]);

  // Error state
  if (error) {
    return (
      <main className="relative min-h-dvh flex items-center justify-center px-5">
        <div className="text-center max-w-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-500/15 text-3xl">
            ❌
          </div>
          <h1 className="text-xl font-bold mb-2">Neispravan link</h1>
          <p className="text-sm text-muted-dark mb-6">
            Ovaj link za deljenje nije validan ili je oštećen. Zamoli pošiljaoca da ti pošalje ponovo.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-dark px-5 py-2.5 text-sm font-semibold text-white hover:shadow-lg transition-all"
          >
            Nazad na početnu
          </a>
        </div>
      </main>
    );
  }

  // Loading
  if (!data) {
    return (
      <main className="relative min-h-dvh flex items-center justify-center px-5">
        <div className="animate-pulse text-muted-dark">Učitavanje...</div>
      </main>
    );
  }

  const paramValues = Object.values(data.params || {}).filter(Boolean);

  return (
    <main className="relative min-h-dvh px-5 py-10 overflow-x-hidden" aria-label="Deljena checklista">
      <div className="relative z-10 mx-auto max-w-2xl">
        {/* Header */}
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
            <h1 className="text-2xl font-bold tracking-tight">Deljena checklista</h1>
            <p className="text-sm text-muted-dark">
              {data.title || "Checklista"}
            </p>
          </div>
          <div className="flex-1" />
        </div>

        {/* Shared badge */}
        <div className="mb-5 flex items-center gap-2 rounded-xl bg-primary/5 dark:bg-primary/10 border border-primary/15 px-4 py-3 animate-fade-in-up">
          <svg className="h-5 w-5 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
          </svg>
          <span className="text-sm text-primary font-medium">
            Neko je podelio ovu cheklistu sa tobom
          </span>
        </div>

        {/* Checklist card */}
        <div className="rounded-2xl glass-card gradient-border overflow-hidden animate-fade-in-up-delay-1">
          {/* Params pills */}
          {paramValues.length > 0 && (
            <div className="px-5 pt-4 flex flex-wrap gap-2">
              {paramValues.map((val, i) => (
                <span
                  key={i}
                  className="rounded-full bg-surface-alt border border-border-light px-3 py-1 text-xs font-medium text-muted-dark"
                >
                  {val}
                </span>
              ))}
            </div>
          )}

          {/* Checklist content */}
          <div className="px-5 py-5">
            <ChecklistRenderer
              checklistId={`shared-${encoded?.slice(0, 8) || "x"}`}
              markdown={data.markdown}
              showProgress
              flowId={data.flowId}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="mt-5 flex flex-col sm:flex-row gap-3 animate-fade-in-up-delay-2">
          {/* Save to my checklists */}
          <button
            type="button"
            onClick={saveToLocal}
            disabled={saved}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-200
              ${saved
                ? "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20"
                : "bg-gradient-to-r from-primary to-primary-dark text-white hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98]"
              }`}
          >
            {saved ? (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Sačuvano!
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                Sačuvaj u moje checkliste
              </>
            )}
          </button>

          {/* Go to my checklists */}
          <a
            href="/checkliste"
            className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-border/60 bg-surface/60 dark:bg-surface/80 px-5 py-3
                       text-sm font-medium text-muted-dark hover:text-primary hover:border-primary/30 transition-all"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Moje checkliste
          </a>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-muted leading-relaxed">
          <a href="/" className="text-primary hover:underline">BezPapira</a> — Vodič kroz papirologiju u Srbiji
        </p>
      </div>
    </main>
  );
}
