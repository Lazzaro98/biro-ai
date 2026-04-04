import dynamic from "next/dynamic";
import { FLOW_CARDS, CONSULT_CARD } from "./lib/flows";

const SocialProof = dynamic(() => import("./components/SocialProof"));
const NewsletterSignup = dynamic(() => import("./components/NewsletterSignup"));
const LandingClient = dynamic(() => import("./components/LandingClient"));
import ThemeToggle from "./components/ThemeToggle";
import UserMenu from "./components/UserMenu";

/* ── JSON-LD Structured Data ── */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "BezPapira",
  url: process.env.NEXT_PUBLIC_BASE_URL || "https://biro-ai.vercel.app",
  description:
    "AI asistent koji te vodi korak po korak kroz birokratske procese u Srbiji — otvaranje firme, checkliste i više.",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "RSD" },
  inLanguage: "sr",
  author: {
    "@type": "Organization",
    name: "BezPapira",
    url: process.env.NEXT_PUBLIC_BASE_URL || "https://biro-ai.vercel.app",
  },
};

/* ── Steps data ── */
const STEPS = [
  {
    number: "1",
    title: "Izaberi proces",
    description: "Otvaranje firme, kupovina stana, registracija vozila — ili opiši svoju situaciju.",
    icon: "🎯",
  },
  {
    number: "2",
    title: "Odgovaraj na pitanja",
    description: "AI asistent te pita samo ono što je bitno za tvoj slučaj. Bez nepotrebnih koraka.",
    icon: "💬",
  },
  {
    number: "3",
    title: "Dobij checklistu",
    description: "Personalizovana checklista sa svim koracima, dokumentima i rokovima. Sačuvaj ili podeli.",
    icon: "✅",
  },
];

export default function Home() {
  return (
    <main className="relative overflow-x-hidden" aria-label="BezPapira — Početna">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-3 sm:px-8">
        <a href="/" className="flex items-center gap-2 group">
          <span className="text-2xl" aria-hidden="true">📋</span>
          <span className="font-bold text-foreground text-sm tracking-tight group-hover:text-primary transition-colors">
            BezPapira
          </span>
        </a>
        <div className="flex items-center gap-2">
          <UserMenu />
          <ThemeToggle />
        </div>
      </div>

      {/* ════════════════════════════════════════════ */}
      {/*  SECTION 1 — Hero                           */}
      {/* ════════════════════════════════════════════ */}
      <section className="min-h-[85dvh] flex flex-col items-center justify-center px-5 py-24 text-center relative">
        <div className="animate-fade-in-up max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 dark:bg-primary/15 px-4 py-1.5 text-xs font-medium text-primary mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Besplatno · Bez registracije · Na srpskom
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
            <span className="text-gradient-lg">Papirologiju</span>
            <br />
            <span className="text-foreground">ostavi nama.</span>
          </h1>

          <p className="mt-5 text-lg sm:text-xl text-muted-dark leading-relaxed max-w-md mx-auto">
            AI asistent koji te vodi korak po korak kroz birokratske procese u Srbiji.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="#procesi"
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-7 py-3.5 text-sm font-semibold text-white
                         hover:bg-primary-dark active:scale-[0.97] transition-all shadow-lg shadow-primary/25"
            >
              Započni besplatno
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </a>
            <a
              href="/checkliste"
              className="inline-flex items-center gap-2 rounded-2xl border border-border/60 bg-surface/60 backdrop-blur-sm px-6 py-3.5 text-sm font-medium text-muted-dark
                         hover:text-foreground hover:border-primary/30 transition-all"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              Moje checkliste
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-xs font-medium text-muted-dark/70">Kako funkcioniše ↓</span>
          <svg className="h-5 w-5 text-primary/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* Client-side sections with scroll reveal */}
      <LandingClient
        steps={STEPS}
        flowCards={FLOW_CARDS}
        consultCard={CONSULT_CARD}
      />

      {/* ════════════════════════════════════════════ */}
      {/*  SECTION 4 — Stats                          */}
      {/* ════════════════════════════════════════════ */}
      <section className="px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-2xl">
          <SocialProof />
        </div>
      </section>

      {/* ════════════════════════════════════════════ */}
      {/*  SECTION 5 — Newsletter + Footer             */}
      {/* ════════════════════════════════════════════ */}
      <section className="px-5 pb-16 sm:px-8">
        <div className="mx-auto max-w-md">
          <NewsletterSignup />
        </div>
        <p className="mt-8 text-center text-xs text-muted leading-relaxed max-w-md mx-auto">
          Aplikacija daje informativne smernice i ne predstavlja pravni savet.
          <br />
          © {new Date().getFullYear()} BezPapira
        </p>
      </section>
    </main>
  );
}