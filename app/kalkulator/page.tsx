"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import ThemeToggle from "../components/ThemeToggle";
import {
  calcFirma, calcNekretnine, calcVozilo,
  FIRMA_DEFAULTS, NEKRETNINE_DEFAULTS, VOZILO_DEFAULTS,
  formatRSD,
  type FirmaInputs, type NekretnineInputs, type VoziloInputs, type CostLine,
} from "../lib/calculator-data";

/* ── Tab config ── */
const TABS = [
  { id: "firma" as const, label: "Otvaranje firme", icon: "🏢" },
  { id: "nekretnina" as const, label: "Kupovina stana", icon: "🏠" },
  { id: "vozilo" as const, label: "Registracija vozila", icon: "🚗" },
] as const;
type TabId = (typeof TABS)[number]["id"];

/* ─────────────────────────────────────────── */
export default function KalkulatorPage() {
  const [tab, setTab] = useState<TabId>("firma");

  return (
    <main className="relative min-h-dvh px-4 py-8 sm:px-6" aria-label="Kalkulator troškova">
      {/* Theme toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="mx-auto max-w-2xl">
        {/* Back + Header */}
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-muted-dark hover:text-primary transition-colors mb-6"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Početna
        </Link>

        <div className="text-center mb-8 animate-fade-in-up">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-3xl glow-icon" aria-hidden="true">
            🧮
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            <span className="text-gradient-lg">Kalkulator</span>{" "}
            <span className="text-foreground">troškova</span>
          </h1>
          <p className="mt-2 text-muted-dark text-sm leading-relaxed max-w-md mx-auto">
            Izračunaj okvirne troškove za najčešće birokratske procese u Srbiji.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1 animate-fade-in-up-delay-1" role="tablist" aria-label="Tip kalkulatora">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200
                ${tab === t.id
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "bg-surface/80 text-muted-dark hover:text-foreground hover:bg-surface-alt border border-border/60"
                }`}
            >
              <span>{t.icon}</span>
              <span className="hidden sm:inline">{t.label}</span>
              <span className="sm:hidden">{t.label.split(" ")[0]}</span>
            </button>
          ))}
        </div>

        {/* Calculator panels */}
        <div className="animate-fade-in-up-delay-2">
          {tab === "firma" && <FirmaCalc />}
          {tab === "nekretnina" && <NekretnineCalc />}
          {tab === "vozilo" && <VoziloCalc />}
        </div>

        {/* Disclaimer */}
        <p className="mt-8 text-center text-xs text-muted leading-relaxed">
          Cene su okvirne i informativne. Stvarni troškovi mogu varirati.
          <br />Poslednje ažuriranje: januar 2026.
        </p>
      </div>
    </main>
  );
}

/* ════════════════════ FIRMA ════════════════════ */

function FirmaCalc() {
  const [inputs, setInputs] = useState<FirmaInputs>(FIRMA_DEFAULTS);

  const items = useMemo(() => calcFirma(inputs), [inputs]);
  const oneTime = items.filter((i) => !i.monthly && i.enabled !== false);
  const monthly = items.filter((i) => i.monthly && i.enabled !== false);
  const totalOneTime = oneTime.reduce((s, i) => s + i.amount, 0);
  const totalMonthly = monthly.reduce((s, i) => s + i.amount, 0);

  return (
    <div className="space-y-6">
      {/* Inputs card */}
      <div className="rounded-2xl glass-card p-5 sm:p-6 space-y-5">
        <h2 className="text-lg font-bold text-foreground">Podešavanja</h2>

        {/* Tip firme */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Tip firme</label>
          <div className="flex gap-2">
            {([["doo", "DOO (d.o.o.)"], ["preduzetnik", "Preduzetnik"]] as const).map(([val, label]) => (
              <button
                key={val}
                type="button"
                onClick={() => setInputs((p) => ({ ...p, tip: val, fiskalniUredjaj: val === "preduzetnik" ? p.fiskalniUredjaj : false }))}
                className={`flex-1 rounded-xl px-4 py-3 text-sm font-medium border transition-all duration-200
                  ${inputs.tip === val
                    ? "bg-primary/10 border-primary/40 text-primary"
                    : "bg-surface/60 border-border/60 text-muted-dark hover:border-primary/20"
                  }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Broj osnivača (DOO only) */}
        {inputs.tip === "doo" && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Broj osnivača
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setInputs((p) => ({ ...p, brojOsnivaca: Math.max(1, p.brojOsnivaca - 1) }))}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 text-foreground hover:bg-surface-alt transition-colors"
                disabled={inputs.brojOsnivaca <= 1}
              >
                −
              </button>
              <span className="w-10 text-center text-lg font-bold text-foreground">{inputs.brojOsnivaca}</span>
              <button
                type="button"
                onClick={() => setInputs((p) => ({ ...p, brojOsnivaca: Math.min(10, p.brojOsnivaca + 1) }))}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 text-foreground hover:bg-surface-alt transition-colors"
              >
                +
              </button>
            </div>
          </div>
        )}

        {/* Toggles */}
        <div className="space-y-3 border-t border-border/40 pt-4">
          <ToggleRow
            label="Izrada pečata"
            note="Nije obavezan od 2018."
            checked={inputs.pecat}
            onChange={(v) => setInputs((p) => ({ ...p, pecat: v }))}
          />
          <ToggleRow
            label="Knjigovodstvene usluge"
            note="Mesečni trošak"
            checked={inputs.knjigovodja}
            onChange={(v) => setInputs((p) => ({ ...p, knjigovodja: v }))}
          />
          {inputs.tip === "preduzetnik" && (
            <ToggleRow
              label="Fiskalni uređaj"
              note="Za maloprodaju / ugostiteljstvo"
              checked={inputs.fiskalniUredjaj}
              onChange={(v) => setInputs((p) => ({ ...p, fiskalniUredjaj: v }))}
            />
          )}
        </div>
      </div>

      {/* Results */}
      <CostBreakdown items={items} totalOneTime={totalOneTime} totalMonthly={totalMonthly} />

      {/* CTA */}
      <CTALink flowId="otvaranje-firme" label="Pokreni proceduru uz AI vodiča" />
    </div>
  );
}

/* ════════════════════ NEKRETNINE ════════════════════ */

function NekretnineCalc() {
  const [inputs, setInputs] = useState<NekretnineInputs>(NEKRETNINE_DEFAULTS);

  const items = useMemo(() => calcNekretnine(inputs), [inputs]);
  const enabledItems = items.filter((i) => i.enabled !== false);
  const total = enabledItems.reduce((s, i) => s + i.amount, 0);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl glass-card p-5 sm:p-6 space-y-5">
        <h2 className="text-lg font-bold text-foreground">Podešavanja</h2>

        {/* Cena nekretnine */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Cena nekretnine (€)
          </label>
          <input
            type="number"
            min={1000}
            step={1000}
            value={inputs.cena}
            onChange={(e) => setInputs((p) => ({ ...p, cena: Math.max(0, Number(e.target.value)) }))}
            className="w-full rounded-xl border border-border/60 bg-surface/60 px-4 py-3 text-foreground text-lg font-semibold
                       focus:border-primary/40 focus:ring-2 focus:ring-primary/10 outline-none transition-all"
          />
          <p className="mt-1 text-xs text-muted">
            ≈ {formatRSD(Math.round(inputs.cena * 117.2))}
          </p>
        </div>

        {/* Range slider for quick adjust */}
        <div>
          <input
            type="range"
            min={10000}
            max={500000}
            step={5000}
            value={inputs.cena}
            onChange={(e) => setInputs((p) => ({ ...p, cena: Number(e.target.value) }))}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-xs text-muted mt-1">
            <span>10.000 €</span>
            <span>500.000 €</span>
          </div>
        </div>

        <div className="space-y-3 border-t border-border/40 pt-4">
          <ToggleRow
            label="Kupovina od investitora"
            note="PDV već uračunat u cenu (nema poreza na prenos)"
            checked={inputs.odInvestitora}
            onChange={(v) => setInputs((p) => ({ ...p, odInvestitora: v }))}
          />
          <ToggleRow
            label="Agencija za nekretnine"
            note={`Provizija ${inputs.procenatAgencije}%`}
            checked={inputs.agencija}
            onChange={(v) => setInputs((p) => ({ ...p, agencija: v }))}
          />
          {inputs.agencija && (
            <div className="ml-14">
              <label className="block text-xs text-muted mb-1">Procenat provizije</label>
              <div className="flex gap-2">
                {[2, 3, 4].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setInputs((p) => ({ ...p, procenatAgencije: pct }))}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium border transition-all
                      ${inputs.procenatAgencije === pct
                        ? "bg-primary/10 border-primary/40 text-primary"
                        : "border-border/60 text-muted-dark hover:border-primary/20"
                      }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <CostBreakdown items={items} totalOneTime={total} />

      <CTALink flowId="kupovina-stana" label="Pokreni proceduru uz AI vodiča" />
    </div>
  );
}

/* ════════════════════ VOZILO ════════════════════ */

function VoziloCalc() {
  const [inputs, setInputs] = useState<VoziloInputs>(VOZILO_DEFAULTS);

  const items = useMemo(() => calcVozilo(inputs), [inputs]);
  const total = items.filter((i) => i.enabled !== false).reduce((s, i) => s + i.amount, 0);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl glass-card p-5 sm:p-6 space-y-5">
        <h2 className="text-lg font-bold text-foreground">Podaci o vozilu</h2>

        {/* Snaga */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Snaga motora (kW)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={30}
              max={500}
              value={inputs.snagaKW}
              onChange={(e) => setInputs((p) => ({ ...p, snagaKW: Math.max(1, Number(e.target.value)) }))}
              className="w-24 rounded-xl border border-border/60 bg-surface/60 px-3 py-2.5 text-foreground text-center font-semibold
                         focus:border-primary/40 focus:ring-2 focus:ring-primary/10 outline-none transition-all"
            />
            <span className="text-sm text-muted">kW</span>
            <span className="text-xs text-muted">(≈ {Math.round(inputs.snagaKW * 1.36)} KS)</span>
          </div>
          <input
            type="range"
            min={30}
            max={300}
            step={5}
            value={inputs.snagaKW}
            onChange={(e) => setInputs((p) => ({ ...p, snagaKW: Number(e.target.value) }))}
            className="w-full accent-primary mt-2"
          />
        </div>

        {/* Kubikaža */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Zapremina motora (cm³)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={600}
              max={7000}
              step={100}
              value={inputs.kubikaza}
              onChange={(e) => setInputs((p) => ({ ...p, kubikaza: Math.max(600, Number(e.target.value)) }))}
              className="w-24 rounded-xl border border-border/60 bg-surface/60 px-3 py-2.5 text-foreground text-center font-semibold
                         focus:border-primary/40 focus:ring-2 focus:ring-primary/10 outline-none transition-all"
            />
            <span className="text-sm text-muted">cm³</span>
          </div>
          <input
            type="range"
            min={600}
            max={5000}
            step={100}
            value={inputs.kubikaza}
            onChange={(e) => setInputs((p) => ({ ...p, kubikaza: Number(e.target.value) }))}
            className="w-full accent-primary mt-2"
          />
        </div>

        {/* Starost */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Starost vozila (godina)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={0}
              max={30}
              value={inputs.starostGodina}
              onChange={(e) => setInputs((p) => ({ ...p, starostGodina: Math.max(0, Number(e.target.value)) }))}
              className="w-20 rounded-xl border border-border/60 bg-surface/60 px-3 py-2.5 text-foreground text-center font-semibold
                         focus:border-primary/40 focus:ring-2 focus:ring-primary/10 outline-none transition-all"
            />
            <span className="text-sm text-muted">god.</span>
          </div>
        </div>

        {/* Zeleni karton toggle */}
        <div className="border-t border-border/40 pt-4">
          <ToggleRow
            label="Zeleni karton"
            note="Za putovanje van Srbije"
            checked={inputs.zeleniKarton}
            onChange={(v) => setInputs((p) => ({ ...p, zeleniKarton: v }))}
          />
        </div>
      </div>

      <CostBreakdown items={items} totalOneTime={total} yearlyLabel />

      <CTALink flowId="registracija-vozila" label="Pokreni proceduru uz AI vodiča" />
    </div>
  );
}

/* ════════════════════ SHARED COMPONENTS ════════════════════ */

/** Toggle switch row */
function ToggleRow({ label, note, checked, onChange }: {
  label: string;
  note?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20
          ${checked ? "bg-primary" : "bg-border dark:bg-border"}`}
      >
        <span
          className={`inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200
            ${checked ? "translate-x-[22px]" : "translate-x-[2px]"} mt-[2px]`}
        />
      </button>
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium text-foreground">{label}</span>
        {note && <p className="text-xs text-muted">{note}</p>}
      </div>
    </div>
  );
}

/** Cost breakdown results */
function CostBreakdown({ items, totalOneTime, totalMonthly, yearlyLabel }: {
  items: CostLine[];
  totalOneTime: number;
  totalMonthly?: number;
  yearlyLabel?: boolean;
}) {
  const enabledItems = items.filter((i) => i.enabled !== false);
  const oneTimeItems = enabledItems.filter((i) => !i.monthly);
  const monthlyItems = enabledItems.filter((i) => i.monthly);

  return (
    <div className="rounded-2xl glass-card gradient-border overflow-hidden">
      <div className="p-5 sm:p-6 space-y-1">
        <h3 className="text-lg font-bold text-foreground mb-4">
          {yearlyLabel ? "Godišnji troškovi" : "Pregled troškova"}
        </h3>

        {oneTimeItems.map((item, i) => (
          <div
            key={i}
            className="flex items-start justify-between py-2.5 border-b border-border/30 last:border-0 animate-card-in"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <div className="flex-1 min-w-0 pr-3">
              <span className="text-sm text-foreground">{item.label}</span>
              {item.note && <p className="text-xs text-muted mt-0.5">{item.note}</p>}
            </div>
            <span className={`text-sm font-semibold shrink-0 ${item.amount === 0 ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"}`}>
              {item.amount === 0 ? "—" : formatRSD(item.amount)}
            </span>
          </div>
        ))}

        {monthlyItems.length > 0 && (
          <>
            <div className="pt-2 pb-1">
              <span className="text-xs font-medium text-muted uppercase tracking-wider">Mesečni troškovi</span>
            </div>
            {monthlyItems.map((item, i) => (
              <div key={i} className="flex items-start justify-between py-2.5 border-b border-border/30 last:border-0">
                <div className="flex-1 min-w-0 pr-3">
                  <span className="text-sm text-foreground">{item.label}</span>
                  {item.note && <p className="text-xs text-muted mt-0.5">{item.note}</p>}
                </div>
                <span className="text-sm font-semibold text-foreground shrink-0">
                  {formatRSD(item.amount)}/mes.
                </span>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Total bar */}
      <div className="border-t border-border/50 bg-gradient-to-r from-primary/5 to-purple-500/5 px-5 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-dark">
            {yearlyLabel ? "Ukupno godišnje" : "Ukupno jednokratno"}
          </span>
          <span className="text-xl font-extrabold text-primary">
            {formatRSD(totalOneTime)}
          </span>
        </div>
        {totalMonthly && totalMonthly > 0 && (
          <div className="flex items-center justify-between mt-1">
            <span className="text-sm font-medium text-muted-dark">Ukupno mesečno</span>
            <span className="text-lg font-bold text-primary/80">
              + {formatRSD(totalMonthly)}/mes.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/** CTA link to the AI chat flow */
function CTALink({ flowId, label }: { flowId: string; label: string }) {
  return (
    <Link
      href={`/start/${flowId}`}
      className="group flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-primary-dark
                 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/20
                 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] transition-all duration-200"
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
      {label}
      <svg className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}
