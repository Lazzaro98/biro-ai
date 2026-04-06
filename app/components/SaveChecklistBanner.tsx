"use client";

import { memo, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import ShareChecklistCard from "./ShareChecklistCard";

interface SaveChecklistBannerProps {
  checklistSaved: boolean;
  onSave: () => void;
  onShare?: () => Promise<void> | void;
  flowId?: string;
  /** For shareable story card */
  flowTitle?: string;
  flowIcon?: string;
  completedSteps?: number;
  totalSteps?: number;
  summary?: string;
}

const FLOW_TO_CALC_TAB: Record<string, string> = {
  "otvaranje-firme": "firma",
  "kupovina-stana": "nekretnina",
  "registracija-vozila": "vozilo",
  "legalizacija-objekta": "nekretnina",
};

export const SaveChecklistBanner = memo(function SaveChecklistBanner({
  checklistSaved,
  onSave,
  onShare,
  flowId,
  flowTitle,
  flowIcon,
  completedSteps,
  totalSteps,
  summary,
}: SaveChecklistBannerProps) {
  const { data: session } = useSession();
  const [shareStatus, setShareStatus] = useState<"idle" | "done">("idle");
  const [dismissed, setDismissed] = useState(false);

  const handleShare = useCallback(async () => {
    if (!onShare) return;
    try {
      await onShare();
      setShareStatus("done");
      setTimeout(() => setShareStatus("idle"), 2500);
    } catch { /* user cancelled */ }
  }, [onShare]);

  return (
    <div className="no-print flex gap-3 animate-msg-in">
      <div className="w-8 shrink-0" />
      <div className="flex-1 rounded-2xl border border-primary/20 bg-primary-ghost p-4">
        {checklistSaved ? (
          <div className="flex flex-wrap items-center gap-2 text-sm text-primary font-medium">
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
            Lista koraka sačuvana!

            {/* Action buttons row */}
            <div className="flex items-center gap-1 ml-auto">
              {/* Share */}
              {onShare && (
                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex items-center gap-1 text-xs text-muted-dark hover:text-primary transition-colors px-2 py-1 rounded-lg hover:bg-primary/5"
                >
                  {shareStatus === "done" ? (
                    <>
                      <svg className="h-3.5 w-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Link kopiran!
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
              )}

              {/* Print */}
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1 text-xs text-muted-dark hover:text-primary transition-colors px-2 py-1 rounded-lg hover:bg-primary/5"
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
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                  />
                </svg>
                Štampaj
              </button>

              {/* Share to Instagram story */}
              {flowTitle && flowIcon && typeof totalSteps === "number" && (
                <ShareChecklistCard
                  title={flowTitle}
                  icon={flowIcon}
                  completedSteps={completedSteps ?? 0}
                  totalSteps={totalSteps}
                  summary={summary}
                />
              )}

              {/* View all */}
              <a
                href="/checkliste"
                className="text-xs underline underline-offset-2 hover:text-primary-dark px-2 py-1"
              >
                Pogledaj sve →
              </a>

              {/* Calculator */}
              {flowId && FLOW_TO_CALC_TAB[flowId] && (
                <a
                  href={`/kalkulator?tab=${FLOW_TO_CALC_TAB[flowId]}`}
                  className="inline-flex items-center gap-1 text-xs text-muted-dark hover:text-primary transition-colors px-2 py-1 rounded-lg hover:bg-primary/5"
                >
                  <span className="text-sm" aria-hidden="true">🧮</span>
                  Troškovi
                </a>
              )}
            </div>

            {/* Progressive auth prompt — only when not logged in */}
            {!session?.user && !dismissed && (
              <div className="w-full mt-3 flex items-center gap-3 rounded-xl bg-surface/80 border border-border/40 px-3 py-2.5">
                <span className="text-lg" aria-hidden="true">🔒</span>
                <p className="flex-1 text-xs text-muted-dark">
                  Napravi besplatan nalog da sačuvaš liste koraka i pristupiš sa bilo kog uređaja.
                </p>
                <a
                  href="/login"
                  className="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white
                             hover:bg-primary-dark transition-colors"
                >
                  Prijavi se
                </a>
                <button
                  type="button"
                  onClick={() => setDismissed(true)}
                  className="shrink-0 text-muted hover:text-muted-dark transition-colors"
                  aria-label="Zatvori"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <p className="text-sm text-muted-dark flex-1">
              📋 Lista koraka je spremna! Sačuvaj je da možeš da je pogledaš
              kasnije.
            </p>
            <button
              type="button"
              onClick={onSave}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white
                         hover:bg-primary-dark active:scale-95 transition-all shrink-0"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
              Sačuvaj listu
            </button>
          </div>
        )}
      </div>
    </div>
  );
});
