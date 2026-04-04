"use client";

/**
 * Minimal social proof — replaces the old floating testimonial cards.
 * Shows a short trust line beneath the landing hero.
 */
export default function FloatingPeople() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none hidden lg:flex fixed inset-x-0 top-[18vh] justify-center z-[1]"
    >
      <div className="flex items-center gap-6 text-xs text-muted-dark dark:text-muted-dark select-none bg-surface/50 dark:bg-surface/40 backdrop-blur-sm rounded-full px-5 py-2 border border-border/30">
        <span className="flex items-center gap-1.5">
          <svg className="h-3.5 w-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
          Besplatno i bez registracije
        </span>
        <span className="h-3 w-px bg-border" />
        <span className="flex items-center gap-1.5">
          <svg className="h-3.5 w-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Gotovo za 2-3 minuta
        </span>
        <span className="h-3 w-px bg-border" />
        <span className="flex items-center gap-1.5">
          <svg className="h-3.5 w-3.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Personalizovana checklista
        </span>
      </div>
    </div>
  );
}

