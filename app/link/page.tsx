import { FLOW_CARDS, CONSULT_CARD } from "../lib/flows";
import ThemeToggle from "../components/ThemeToggle";
import dynamic from "next/dynamic";

const NewsletterSignup = dynamic(() => import("../components/NewsletterSignup"));

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://biro-ai.vercel.app";

const SOCIAL_LINKS = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/bezpapira",
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
];

const EXTRA_LINKS = [
  {
    label: "🧮 Kalkulator troškova",
    description: "Izračunaj troškove otvaranja firme, kupovine stana i registracije vozila",
    href: "/kalkulator",
  },
  {
    label: "📋 Moje checkliste",
    description: "Sačuvane checkliste — prati napredak korak po korak",
    href: "/checkliste",
  },
  {
    label: "📜 Istorija razgovora",
    description: "Pregledaj prethodne razgovore sa AI asistentom",
    href: "/istorija",
  },
];

export default function LinkPage() {
  return (
    <main
      className="relative min-h-dvh flex flex-col items-center px-5 py-12 overflow-x-hidden"
      aria-label="BezPapira — Link u bio"
    >
      {/* Theme toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md animate-fade-in-up">
        {/* Avatar / Brand */}
        <div className="text-center mb-8">
          <div
            className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-4xl shadow-lg glow-icon"
            aria-hidden="true"
          >
            📋
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            <span className="text-gradient-lg">Bez</span>{" "}
            <span className="text-foreground">Papira</span>
          </h1>
          <p className="mt-1.5 text-muted-dark text-sm leading-relaxed">
            AI vodič kroz papirologiju u Srbiji 🇷🇸
          </p>

          {/* Social icons row */}
          <div className="mt-3 flex items-center justify-center gap-3">
            {SOCIAL_LINKS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-alt hover:bg-primary/15 text-muted-dark hover:text-primary transition-all duration-200"
                aria-label={s.label}
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* CTA — Main app */}
        <a
          href="/"
          className="group mb-6 flex items-center justify-center gap-2 rounded-2xl p-4
                     bg-gradient-to-r from-primary to-purple-500 text-white font-semibold text-base
                     shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30
                     hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
        >
          Otvori aplikaciju
          <svg
            className="h-4 w-4 group-hover:translate-x-0.5 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </a>

        {/* AI Chat flows */}
        <div className="space-y-2.5 mb-6">
          <p className="text-xs font-semibold text-muted uppercase tracking-wider px-1">
            AI Vodiči
          </p>
          {FLOW_CARDS.map((flow) => (
            <a
              key={flow.id}
              href={`/chat/${flow.id}`}
              className="group flex items-center gap-3 rounded-xl p-3.5 glass-card gradient-border
                         hover:shadow-md hover:shadow-primary/10 transition-all duration-200"
            >
              <span className="text-xl" aria-hidden="true">
                {flow.icon}
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                  {flow.title}
                </div>
                <div className="text-xs text-muted-dark mt-0.5 line-clamp-1">
                  {flow.description}
                </div>
              </div>
              <svg
                className="h-4 w-4 text-muted shrink-0 group-hover:text-primary group-hover:translate-x-0.5 transition-all"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </a>
          ))}

          {/* Free-form consultation */}
          <a
            href={`/chat/${CONSULT_CARD.id}`}
            className="group flex items-center gap-3 rounded-xl p-3.5
                       bg-gradient-to-r from-primary/[0.08] to-purple-500/[0.06] dark:from-primary/[0.12] dark:to-purple-500/[0.08]
                       border border-primary/20 dark:border-primary/30
                       hover:shadow-md hover:shadow-primary/15 hover:border-primary/40 transition-all duration-200"
          >
            <span className="text-xl" aria-hidden="true">
              {CONSULT_CARD.icon}
            </span>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-primary transition-colors">
                {CONSULT_CARD.title}
              </div>
              <div className="text-xs text-muted-dark mt-0.5 line-clamp-1">
                {CONSULT_CARD.description}
              </div>
            </div>
            <svg
              className="h-4 w-4 text-primary/60 shrink-0 group-hover:text-primary group-hover:translate-x-0.5 transition-all"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        {/* Extra links */}
        <div className="space-y-2.5 mb-8">
          <p className="text-xs font-semibold text-muted uppercase tracking-wider px-1">
            Alati
          </p>
          {EXTRA_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="group flex items-center gap-3 rounded-xl p-3.5 glass-card gradient-border
                         hover:shadow-md hover:shadow-primary/10 transition-all duration-200"
            >
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                  {link.label}
                </div>
                <div className="text-xs text-muted-dark mt-0.5 line-clamp-1">
                  {link.description}
                </div>
              </div>
              <svg
                className="h-4 w-4 text-muted shrink-0 group-hover:text-primary group-hover:translate-x-0.5 transition-all"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </a>
          ))}
        </div>

        {/* Newsletter */}
        <div className="mb-8">
          <NewsletterSignup />
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} BezPapira · Informativne smernice, ne pravni savet.
          </p>
        </div>
      </div>
    </main>
  );
}
