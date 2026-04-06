"use client";

import { memo } from "react";
import Link from "next/link";

/**
 * CTA banner shown after a checklist, encouraging users to consult a lawyer.
 * Phase 1: simple redirect to /advokat form.
 */
export const LawyerCTA = memo(function LawyerCTA() {
  return (
    <div className="no-print flex gap-3 animate-msg-in">
      <div className="w-8 shrink-0" />
      <div className="flex-1 rounded-2xl border border-amber-200/60 bg-amber-50/50 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-lg" aria-hidden="true">⚖️</span>
              <h4 className="text-sm font-semibold text-amber-900">
                Želite siguran pravni savet?
              </h4>
            </div>
            <p className="text-xs text-amber-800/80 leading-relaxed">
              Ovo su informativne smernice. Za pravno obavezujući savet,
              povežite se sa advokatom — besplatna prva konsultacija.
            </p>
          </div>
          <Link
            href="/advokat"
            className="inline-flex items-center justify-center gap-1.5 shrink-0 rounded-xl
                       bg-amber-600 hover:bg-amber-700 active:scale-95
                       px-4 py-2 text-sm font-semibold text-white
                       transition-all"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Kontaktiraj advokata
          </Link>
        </div>
      </div>
    </div>
  );
});

export default LawyerCTA;
