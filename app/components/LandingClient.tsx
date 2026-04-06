"use client";

import ScrollReveal from "./ScrollReveal";

interface Step {
  number: string;
  title: string;
  description: string;
  icon: string;
}

interface FlowCard {
  id: string;
  title: string;
  description: string;
  icon: string;
}

interface ExampleItem {
  text: string;
  checked: boolean;
  faded?: boolean;
}

interface LandingClientProps {
  steps: Step[];
  flowCards: FlowCard[];
  consultCard: FlowCard;
  exampleChecklist: ExampleItem[];
}

const FRUSTRATIONS = [
  { icon: "📄", text: "Stigneš na šalter. Fali overa. Vrate te kući." },
  { icon: "🔄", text: "Preskočiš korak. Moraš sve ispočetka." },
  { icon: "💸", text: "Platiš taksu. Pogrešan iznos. Platiš ponovo." },
  { icon: "⏳", text: "Izgubiš ceo dan. A moglo je za 30 minuta." },
];

const STATS = [
  { value: "2.500+", label: "korisnika" },
  { value: "~15 min", label: "umesto celog dana" },
  { value: "94%", label: "završi iz prvog puta" },
];

export default function LandingClient({ steps, flowCards, consultCard, exampleChecklist }: LandingClientProps) {
  return (
    <>
      {/* ════════════════════════════════════════════ */}
      {/*  PROBLEM SECTION                            */}
      {/* ════════════════════════════════════════════ */}
      <section id="problem" className="section-tinted px-5 py-20 sm:px-8 scroll-mt-16">
        <div className="mx-auto max-w-2xl">
          <ScrollReveal>
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                Svima se ovo dešava.
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FRUSTRATIONS.map((item, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-surface border border-border/60">
                  <span className="text-xl shrink-0 mt-0.5" aria-hidden="true">{item.icon}</span>
                  <p className="text-sm text-foreground leading-relaxed font-medium">{item.text}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={450}>
            <p className="text-center mt-10 text-base text-foreground font-semibold">
              Ne mora tako.
            </p>
            <p className="text-center mt-1 text-muted-dark text-sm">
              Spremi se za šalter za 5 minuta — i završi sve iz prve.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ════════════════════════════════════════════ */}
      {/*  HOW IT WORKS                               */}
      {/* ════════════════════════════════════════════ */}
      <section id="kako-funkcionise" className="px-5 py-20 sm:px-8 scroll-mt-16">
        <div className="mx-auto max-w-3xl">
          <ScrollReveal>
            <div className="text-center mb-14">
              <span className="inline-block text-xs font-semibold tracking-widest text-primary uppercase mb-3">
                Kako funkcioniše
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                Tri koraka. To je sve.
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            {steps.map((step, i) => (
              <ScrollReveal key={step.number} delay={i * 150}>
                <div className="relative text-center p-6 rounded-2xl bg-surface border border-border/60 shadow-sm hover:shadow-md transition-shadow">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white text-sm font-bold shadow-lg shadow-primary/25">
                    {step.number}
                  </div>

                  <div className="mt-4 text-3xl mb-3" aria-hidden="true">
                    {step.icon}
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-dark leading-relaxed">
                    {step.description}
                  </p>

                  {i < steps.length - 1 && (
                    <div className="hidden sm:block absolute top-8 -right-4 sm:-right-5 w-8 sm:w-10 h-px bg-border/60" aria-hidden="true" />
                  )}
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════ */}
      {/*  EXAMPLE CHECKLIST                          */}
      {/* ════════════════════════════════════════════ */}
      <section className="section-tinted px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-lg">
          <ScrollReveal>
            <div className="text-center mb-8">
              <span className="inline-block text-xs font-semibold tracking-widest text-primary uppercase mb-3">
                Primer liste
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                Otvaranje firme — evo šta dobijaš
              </h2>
              <p className="mt-3 text-muted-dark text-sm max-w-sm mx-auto">
                Ovo je samo deo liste. Tvoja će biti prilagođena tvojim odgovorima.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={150}>
            <div className="relative rounded-2xl bg-surface border border-border/60 shadow-md overflow-hidden">
              {/* Header bar */}
              <div className="flex items-center gap-2 px-6 py-4 border-b border-border/40 bg-surface-alt/30">
                <span className="text-lg">🏢</span>
                <h3 className="text-sm font-semibold text-foreground">Otvaranje preduzetničke radnje (PR)</h3>
                <span className="ml-auto text-xs text-muted bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">3/7 završeno</span>
              </div>

              <ul className="px-6 py-5 space-y-3">
                {exampleChecklist.map((item, i) => (
                  <li key={i} className={`flex items-start gap-3 ${item.faded ? 'opacity-40' : ''}`}>
                    <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs
                      ${item.checked
                        ? "bg-primary/15 border-primary/40 text-primary"
                        : "border-border bg-surface-alt/50 text-transparent"
                      }`}>
                      {item.checked && "✓"}
                    </span>
                    <span className={`text-sm leading-relaxed ${item.checked ? "text-muted-dark line-through" : "text-foreground"}`}>
                      {item.text}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Fade-out overlay */}
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-surface via-surface/80 to-transparent pointer-events-none" />

              {/* CTA over fade */}
              <div className="relative z-10 pb-6 pt-2 text-center">
                <a
                  href="/chat/otvaranje-firme"
                  className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-white
                             hover:bg-primary-dark active:scale-[0.97] transition-all shadow-lg shadow-primary/25"
                >
                  Generiši svoju listu
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </a>
                <p className="mt-2 text-xs text-muted-dark">Besplatno · 2 minuta · Bez registracije</p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ════════════════════════════════════════════ */}
      {/*  SOCIAL PROOF STATS                         */}
      {/* ════════════════════════════════════════════ */}
      <section className="px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-2xl">
          <ScrollReveal>
            <div className="grid grid-cols-3 gap-4 sm:gap-8 rounded-2xl p-6 sm:p-8 glass-card border border-border/50">
              {STATS.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-muted-dark mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ════════════════════════════════════════════ */}
      {/*  PROCESSES                                  */}
      {/* ════════════════════════════════════════════ */}
      <section id="procesi" className="section-tinted px-5 py-20 sm:px-8 scroll-mt-20">
        <div className="mx-auto max-w-2xl">
          <ScrollReveal>
            <div className="text-center mb-10">
              <span className="inline-block text-xs font-semibold tracking-widest text-primary uppercase mb-3">
                Izaberi proces
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                Šta ti treba?
              </h2>
            </div>
          </ScrollReveal>

          <nav className="space-y-3" aria-label="Dostupni procesi">
            {flowCards.map((flow, i) => (
              <ScrollReveal key={flow.id} delay={i * 100}>
                <a
                  href={`/chat/${flow.id}`}
                  className="group flex items-center gap-4 rounded-2xl p-5
                             bg-surface border border-border/60 shadow-sm
                             hover:shadow-lg hover:shadow-primary/10 hover:border-primary/40 transition-all duration-300"
                >
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xl
                                group-hover:bg-primary/15 transition-all duration-300"
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
              </ScrollReveal>
            ))}

            {/* Consult card */}
            <ScrollReveal delay={flowCards.length * 100}>
              <a
                href={`/chat/${consultCard.id}`}
                className="group block rounded-2xl p-5
                           bg-gradient-to-r from-primary/[0.07] to-purple-500/[0.05]
                           border border-primary/25 shadow-sm
                           hover:shadow-lg hover:shadow-primary/15 hover:border-primary/40 transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-xl
                                group-hover:bg-primary/20 transition-all duration-300"
                    aria-hidden="true"
                  >
                    {consultCard.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-primary transition-colors">
                      {consultCard.title}
                    </div>
                    <div className="text-sm text-muted-dark mt-0.5">
                      {consultCard.description}
                    </div>
                  </div>
                  <svg
                    className="h-5 w-5 text-primary/60 shrink-0 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <p className="mt-3 text-xs text-muted leading-relaxed pl-16">
                  Ne znaš tačno šta ti treba? Opiši svoju situaciju i pomoći ćemo ti.
                </p>
              </a>
            </ScrollReveal>
          </nav>
        </div>
      </section>
    </>
  );
}
