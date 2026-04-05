import dynamic from "next/dynamic";
import { FLOW_CARDS, CONSULT_CARD } from "./lib/flows";

const NewsletterSignup = dynamic(() => import("./components/NewsletterSignup"));
const LandingClient = dynamic(() => import("./components/LandingClient"));
import UserMenu from "./components/UserMenu";

/* ── JSON-LD Structured Data ── */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "BezPapira",
  url: process.env.NEXT_PUBLIC_BASE_URL || "https://biro-ai.vercel.app",
  description:
    "Završi sve iz prve — bez čekanja, bez grešaka. Besplatan vodič kroz birokratske procese u Srbiji.",
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
    title: "Izaberi šta ti treba",
    description: "Firma, stan, vozilo — ili opiši svoju situaciju.",
    icon: "🎯",
  },
  {
    number: "2",
    title: "Odgovori na par pitanja",
    description: "Pitamo samo ono što je bitno za tvoj slučaj.",
    icon: "💬",
  },
  {
    number: "3",
    title: "Dobij gotovu listu koraka",
    description: "Svi dokumenti, rokovi i troškovi — na jednom mestu.",
    icon: "✅",
  },
];

/* ── Example checklist items (registracija vozila) ── */
const EXAMPLE_CHECKLIST = [
  { text: "Ugovor o kupoprodaji vozila (overen kod notara)", checked: true },
  { text: "Polisa osiguranja (registruj se kod osiguravajuće kuće)", checked: true },
  { text: "Tehnički pregled vozila (stanica tehničkog pregleda)", checked: false },
  { text: "Uplata takse za registraciju (~5.000 RSD)", checked: false },
  { text: "Prijava u MUP — šalter za registraciju vozila", checked: false },
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
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-3 sm:px-8
                      bg-surface/80 backdrop-blur-md border-b border-border/40">
        <a href="/" className="flex items-center gap-2 group">
          <span className="text-2xl" aria-hidden="true">📋</span>
          <span className="font-bold text-foreground text-sm tracking-tight group-hover:text-primary transition-colors">
            BezPapira
          </span>
        </a>
        <div className="flex items-center gap-2">
          <UserMenu />
        </div>
      </div>

      {/* ════════════════════════════════════════════ */}
      {/*  SECTION 1 — Hero (pain-driven)             */}
      {/* ════════════════════════════════════════════ */}
      <section className="min-h-[85dvh] flex flex-col items-center justify-center px-5 py-24 text-center relative">
        <div className="absolute top-16 left-1/2 -translate-x-1/2 w-12 h-1 rounded-full bg-primary/25" aria-hidden="true" />

        <div className="animate-fade-in-up max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Besplatno · Bez registracije · Na srpskom
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
            <span className="text-foreground">Ne idi na šalter</span>
            <br />
            <span className="text-gradient-lg">nespreman.</span>
          </h1>

          <p className="mt-5 text-lg sm:text-xl text-muted-dark leading-relaxed max-w-md mx-auto">
            Reci nam šta ti treba — a mi ćemo ti reći tačno koje papire da spremiš, gde da odeš i koliko košta.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="#procesi"
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-7 py-3.5 text-sm font-semibold text-white
                         hover:bg-primary-dark active:scale-[0.97] transition-all shadow-lg shadow-primary/25"
            >
              Probaj besplatno
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
            <a
              href="/checkliste"
              className="inline-flex items-center gap-2 rounded-2xl border border-border bg-surface/80 backdrop-blur-sm px-6 py-3.5 text-sm font-medium text-muted-dark
                         shadow-sm hover:text-foreground hover:border-primary/40 hover:shadow-md transition-all"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              Moje liste koraka
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <a href="#problem" className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5 animate-bounce
                  rounded-full bg-surface-alt/80 backdrop-blur-sm px-4 py-2 shadow-sm
                  border border-border/50 hover:border-primary/40 transition-all cursor-pointer">
          <span className="text-xs font-medium text-muted-dark">Saznaj više</span>
          <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </a>
      </section>

      {/* Client-side sections with scroll reveal */}
      <LandingClient
        steps={STEPS}
        flowCards={FLOW_CARDS}
        consultCard={CONSULT_CARD}
        exampleChecklist={EXAMPLE_CHECKLIST}
      />

      {/* ════════════════════════════════════════════ */}
      {/*  FINAL CTA                                  */}
      {/* ════════════════════════════════════════════ */}
      <section className="px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-lg text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
            Završi sve iz prve.
          </h2>
          <p className="text-muted-dark mb-8 max-w-sm mx-auto">
            Bez vraćanja, bez čekanja, bez iznenađenja. Spremi se za šalter za 5 minuta.
          </p>
          <a
            href="#procesi"
            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-8 py-4 text-base font-semibold text-white
                       hover:bg-primary-dark active:scale-[0.97] transition-all shadow-lg shadow-primary/25"
          >
            Kreni odmah
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </section>

      {/* ════════════════════════════════════════════ */}
      {/*  Newsletter + Footer                        */}
      {/* ════════════════════════════════════════════ */}
      <section className="section-tinted px-5 pb-16 pt-12 sm:px-8">
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