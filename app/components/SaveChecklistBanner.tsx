"use client";

import { memo } from "react";

interface SaveChecklistBannerProps {
  checklistSaved: boolean;
  onSave: () => void;
}

export const SaveChecklistBanner = memo(function SaveChecklistBanner({
  checklistSaved,
  onSave,
}: SaveChecklistBannerProps) {
  return (
    <div className="no-print flex gap-3 animate-msg-in">
      <div className="w-8 shrink-0" />
      <div className="flex-1 rounded-2xl border border-primary/20 bg-primary-ghost p-4">
        {checklistSaved ? (
          <div className="flex items-center gap-2 text-sm text-primary font-medium">
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
            Checklista sačuvana!
            <button
              type="button"
              onClick={() => window.print()}
              className="ml-2 inline-flex items-center gap-1 text-xs text-muted-dark hover:text-primary transition-colors"
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
            <a
              href="/checkliste"
              className="ml-auto text-xs underline underline-offset-2 hover:text-primary-dark"
            >
              Pogledaj sve →
            </a>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <p className="text-sm text-muted-dark flex-1">
              📋 Checklista je spremna! Sačuvaj je da možeš da je pogledaš
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
              Sačuvaj cheklistu
            </button>
          </div>
        )}
      </div>
    </div>
  );
});
