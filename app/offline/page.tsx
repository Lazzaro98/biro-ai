"use client";

export default function OfflinePage() {
  return (
    <main className="relative min-h-dvh flex flex-col items-center justify-center px-5 py-16">
      <div className="relative z-10 w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-4xl">
          📡
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">Nema interneta</h1>
        <p className="mt-4 text-muted-dark text-lg leading-relaxed">
          BezPapira zahteva internet konekciju za razgovor sa AI asistentom.
        </p>
        <p className="mt-2 text-muted text-sm">
          Tvoje sačuvane liste koraka su dostupne i offline u pretraživaču.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-dark px-6 py-3 text-white font-semibold
                       hover:shadow-lg hover:shadow-primary/25 active:scale-95 transition-all"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Probaj ponovo
          </button>
          <a
            href="/checkliste"
            className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-surface/60 px-5 py-3 text-sm font-medium text-muted-dark
                       hover:text-primary hover:border-primary/30 transition-all"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            Moje liste koraka
          </a>
        </div>
      </div>
    </main>
  );
}
