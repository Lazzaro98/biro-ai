import dynamic from "next/dynamic";
import { FLOW_CARDS } from "./lib/flows";

// Lazy-load decorative components — not needed for FCP/LCP
const FloatingPeople = dynamic(() => import("./components/FloatingPeople"));
import ThemeToggle from "./components/ThemeToggle";

/* ── JSON-LD Structured Data ── */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Biro AI",
  url: "https://biro-ai.rs",
  description:
    "AI asistent koji te vodi korak po korak kroz birokratske procese u Srbiji — otvaranje firme, checkliste i više.",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "RSD",
  },
  inLanguage: "sr",
  author: {
    "@type": "Organization",
    name: "Biro AI",
    url: "https://biro-ai.rs",
  },
};

export default function Home() {
  return (
    <main className="relative min-h-dvh flex flex-col items-center justify-center px-5 py-16 overflow-x-hidden" aria-label="Biro AI — Početna">
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Theme toggle — top right */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* People floating around the edges (desktop only) */}
      <FloatingPeople />

      <div className="relative z-10 w-full max-w-lg">
        {/* Logo / Brand */}
        <div className="mb-10 text-center animate-fade-in-up">
          <div className="mx-auto mb-5 flex h-18 w-18 items-center justify-center rounded-2xl bg-primary/10 text-4xl shadow-lg glow-icon" aria-hidden="true">
            📋
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            <span className="text-gradient-lg">Biro</span>{" "}
            <span className="text-foreground">AI</span>
          </h1>
          <p className="mt-3 text-muted-dark text-lg leading-relaxed max-w-sm mx-auto">
            Vodič kroz papirologiju u Srbiji.
            <br className="hidden sm:block" />
            Reci šta želiš — AI te vodi korak po korak.
          </p>
        </div>

        {/* Process cards */}
        <nav className="space-y-3 animate-fade-in-up-delay-1" aria-label="Dostupni procesi">
          {FLOW_CARDS.map((flow) => (
            <a
              key={flow.id}
              href={`/start/${flow.id}`}
              className="group flex items-center gap-4 rounded-2xl p-5 glass-card gradient-border
                         hover:shadow-lg hover:shadow-primary/10 transition-all duration-300"
            >
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-purple-500/10 text-xl
                            group-hover:from-primary/25 group-hover:to-purple-500/15 transition-all duration-300"
                aria-hidden="true"
              >
                {flow.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {flow.title}
                </div>
                <div className="text-sm text-muted-dark mt-0.5">
                  {flow.description}
                </div>
              </div>
              <svg
                className="h-5 w-5 text-muted shrink-0 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </a>
          ))}
        </nav>

        {/* Saved checklists link */}
        <a
          href="/checkliste"
          className="mt-6 flex items-center justify-center gap-2 rounded-xl border border-border/60 bg-surface/60 dark:bg-surface/80 backdrop-blur-sm p-3
                     text-sm font-medium text-muted-dark hover:text-primary hover:border-primary/30 hover:bg-surface/80 transition-all duration-200 animate-fade-in-up-delay-2"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          Moje sačuvane checkliste
        </a>

        {/* Footer note */}
        <p className="mt-8 text-center text-xs text-muted leading-relaxed">
          Aplikacija daje informativne smernice i ne predstavlja pravni savet.
        </p>
      </div>
    </main>
  );
}