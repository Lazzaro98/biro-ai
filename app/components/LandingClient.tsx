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

interface LandingClientProps {
  steps: Step[];
  flowCards: FlowCard[];
  consultCard: FlowCard;
}

export default function LandingClient({ steps, flowCards, consultCard }: LandingClientProps) {
  return (
    <>
      {/* ════════════════════════════════════════════ */}
      {/*  SECTION 2 — How it works                   */}
      {/* ════════════════════════════════════════════ */}
      <section id="kako-funkcionise" className="section-tinted px-5 py-20 sm:px-8 scroll-mt-16">
        <div className="mx-auto max-w-3xl">
          <ScrollReveal>
            <div className="text-center mb-14">
              <span className="inline-block text-xs font-semibold tracking-widest text-primary uppercase mb-3">
                Kako funkcioniše
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                Tri koraka do tvoje checkliste
              </h2>
              <p className="mt-3 text-muted-dark max-w-md mx-auto">
                Bez čekanja, bez komplikovanih formulara. Samo razgovor.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            {steps.map((step, i) => (
              <ScrollReveal key={step.number} delay={i * 150}>
                <div className="relative text-center p-6 rounded-2xl bg-surface border border-border/60 shadow-sm hover:shadow-md transition-shadow">
                  {/* Step number badge */}
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

                  {/* Connecting line (desktop only, not on last item) */}
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
      {/*  SECTION 3 — Processes                      */}
      {/* ════════════════════════════════════════════ */}
      <section id="procesi" className="px-5 py-20 sm:px-8 scroll-mt-20">
        <div className="mx-auto max-w-2xl">
          <ScrollReveal>
            <div className="text-center mb-10">
              <span className="inline-block text-xs font-semibold tracking-widest text-primary uppercase mb-3">
                Procesi
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
                  Ne znaš tačno šta ti treba? Opiši svoju situaciju i AI asistent će te uputiti na pravi put.
                </p>
              </a>
            </ScrollReveal>
          </nav>
        </div>
      </section>
    </>
  );
}
