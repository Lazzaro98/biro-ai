"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

type FormState = "idle" | "sending" | "sent" | "error";

export default function AdvokatPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");

  const canSubmit =
    name.trim().length >= 2 &&
    email.trim().includes("@") &&
    description.trim().length >= 10;

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!canSubmit) return;

      setFormState("sending");
      try {
        const res = await fetch("/api/advokat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim() || undefined,
            description: description.trim(),
          }),
        });
        if (!res.ok) throw new Error("Failed");
        setFormState("sent");
      } catch {
        setFormState("error");
      }
    },
    [canSubmit, name, email, phone, description],
  );

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-surface/60 backdrop-blur-sm">
        <div className="mx-auto max-w-2xl px-4 py-4 flex items-center gap-3">
          <Link
            href="/"
            className="text-muted hover:text-foreground transition-colors"
            aria-label="Nazad na početnu"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>
          <h1 className="text-lg font-bold text-foreground">Konsultacija sa advokatom</h1>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-8 space-y-8">
        {/* Hero section */}
        <section className="text-center space-y-3">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10 text-3xl mx-auto">
            ⚖️
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            Trebate siguran pravni savet?
          </h2>
          <p className="text-muted-dark text-[15px] leading-relaxed max-w-lg mx-auto">
            BezPapira daje informativne smernice, ali za složenije situacije preporučujemo
            konsultaciju sa advokatom. Opišite vašu situaciju i povezaćemo vas sa
            pravnim stručnjakom.
          </p>
        </section>

        {/* How it works */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: "📝",
              title: "Opišite situaciju",
              desc: "Ukratko opišite vaš pravni problem ili pitanje.",
            },
            {
              icon: "🔍",
              title: "Mi pronalazimo",
              desc: "Povezujemo vas sa advokatom specijalizovanim za vaš slučaj.",
            },
            {
              icon: "📞",
              title: "Advokat vas kontaktira",
              desc: "Advokat vam se javlja u roku od 24h sa ponudom za konsultaciju.",
            },
          ].map((step) => (
            <div
              key={step.title}
              className="rounded-xl border border-border/60 bg-card-bg p-4 text-center space-y-2"
            >
              <div className="text-2xl">{step.icon}</div>
              <h3 className="font-semibold text-sm text-foreground">{step.title}</h3>
              <p className="text-xs text-muted-dark leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </section>

        {/* Form or success state */}
        {formState === "sent" ? (
          <section className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-6 text-center space-y-3">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100 mx-auto">
              <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-emerald-800">Zahtev poslat!</h3>
            <p className="text-sm text-emerald-700">
              Primili smo vaš zahtev. Advokat će vas kontaktirati u roku od <strong>24 sata</strong>.
              Proverite i spam folder.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-emerald-700 hover:text-emerald-900 font-medium"
            >
              ← Nazad na početnu
            </Link>
          </section>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="rounded-2xl border border-border/60 bg-card-bg p-5 space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Vaši podaci
              </h3>

              <div className="space-y-3">
                <div>
                  <label htmlFor="name" className="block text-xs font-medium text-muted-dark mb-1">
                    Ime i prezime <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Petar Petrović"
                    className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground
                               placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                               transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs font-medium text-muted-dark mb-1">
                    Email adresa <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="petar@email.com"
                    className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground
                               placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                               transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-xs font-medium text-muted-dark mb-1">
                    Telefon <span className="text-muted text-[10px]">(opciono)</span>
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="060 123 4567"
                    className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground
                               placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                               transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border/60 bg-card-bg p-5 space-y-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                Opišite vaš problem
              </h3>

              <div>
                <label htmlFor="description" className="block text-xs font-medium text-muted-dark mb-1">
                  Kratak opis <span className="text-red-400">*</span>
                </label>
                <textarea
                  id="description"
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Npr: Kupujem stan sa hipotekom i treba mi pravni pregled ugovora pre potpisivanja..."
                  className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground
                             placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                             transition-all resize-none"
                />
                <p className="mt-1 text-[11px] text-muted">
                  Minimum 10 karaktera. Što detaljniji opis, to bolji izbor advokata.
                </p>
              </div>
            </div>

            {formState === "error" && (
              <div className="rounded-xl border border-red-200 bg-red-50/60 px-4 py-3 text-sm text-red-700">
                Došlo je do greške. Pokušajte ponovo ili nas kontaktirajte na{" "}
                <a href="mailto:info@bezpapira.rs" className="underline">info@bezpapira.rs</a>.
              </div>
            )}

            <button
              type="submit"
              disabled={!canSubmit || formState === "sending"}
              className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white
                         hover:bg-primary-dark active:scale-[0.98] transition-all
                         disabled:opacity-50 disabled:cursor-not-allowed
                         flex items-center justify-center gap-2"
            >
              {formState === "sending" ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Šaljem...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Pošalji zahtev za konsultaciju
                </>
              )}
            </button>

            <p className="text-center text-[11px] text-muted leading-relaxed">
              Vaši podaci se koriste isključivo za povezivanje sa advokatom.
              Nećemo ih deliti sa trećim licima niti koristiti u marketinške svrhe.
            </p>
          </form>
        )}

        {/* FAQ */}
        <section className="space-y-3">
          <h3 className="font-semibold text-foreground text-sm">Česta pitanja</h3>
          {[
            {
              q: "Koliko košta konsultacija?",
              a: "Prve konsultacije su obično besplatne ili uz simboličnu naknadu (1.000–3.000 RSD). Advokat će vam unapred saopštiti cenu.",
            },
            {
              q: "Ko su advokati sa kojima sarađujete?",
              a: "Sarađujemo sa licenciranim advokatima koji su članovi Advokatske komore Srbije i specijalizovani za oblasti koje pokrivamo (privredno pravo, nekretnine, upravno pravo).",
            },
            {
              q: "Koliko brzo ću dobiti odgovor?",
              a: "Advokat vas kontaktira u roku od 24 sata radnim danima. Vikendom može potrajati do 48 sati.",
            },
            {
              q: "Da li BezPapira daje pravne savete?",
              a: "Ne. BezPapira pruža informativne smernice bazirane na javno dostupnim informacijama. Za pravni savet koji ima pravnu snagu potreban je advokat.",
            },
          ].map((faq) => (
            <details
              key={faq.q}
              className="group rounded-xl border border-border/60 bg-card-bg overflow-hidden"
            >
              <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-foreground flex items-center justify-between hover:bg-surface-alt/40 transition-colors">
                {faq.q}
                <svg
                  className="h-4 w-4 text-muted shrink-0 transition-transform group-open:rotate-180"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className="px-4 pb-3 text-xs text-muted-dark leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </section>
      </div>
    </main>
  );
}
