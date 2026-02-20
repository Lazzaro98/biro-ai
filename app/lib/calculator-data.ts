/**
 * Cost calculator data for Serbian bureaucratic processes.
 * Prices are approximate and based on 2025/2026 tariffs.
 */

/* ─── Otvaranje firme ─── */

export interface FirmaInputs {
  tip: "doo" | "preduzetnik";
  brojOsnivaca: number;
  pecat: boolean;
  knjigovodja: boolean;
  fiskalniUredjaj: boolean;
}

export const FIRMA_DEFAULTS: FirmaInputs = {
  tip: "doo",
  brojOsnivaca: 1,
  pecat: true,
  knjigovodja: true,
  fiskalniUredjaj: false,
};

export interface CostLine {
  label: string;
  amount: number;
  note?: string;
  monthly?: boolean;
  optional?: boolean;
  enabled?: boolean;
}

export function calcFirma(inputs: FirmaInputs): CostLine[] {
  if (inputs.tip === "doo") {
    return [
      { label: "Registracija u APR-u", amount: 6_500, note: "Republička administrativna taksa" },
      {
        label: "Overa osnivačkog akta (notar)",
        amount: 12_000 + Math.max(0, inputs.brojOsnivaca - 1) * 4_000,
        note: `Za ${inputs.brojOsnivaca} osnivač${inputs.brojOsnivaca === 1 ? "a" : "a"}`,
      },
      { label: "Overa OP obrasca", amount: 2_200, note: "Overa potpisa direktora" },
      { label: "Osnivački kapital (minimum)", amount: 100, note: "Zakonski minimum je 100 RSD" },
      ...(inputs.pecat
        ? [{ label: "Izrada pečata", amount: 3_000, note: "Nije obavezan od 2018.", optional: true, enabled: true }]
        : [{ label: "Izrada pečata", amount: 3_000, note: "Nije obavezan od 2018.", optional: true, enabled: false }]),
      ...(inputs.knjigovodja
        ? [{ label: "Knjigovodstvene usluge", amount: 15_000, monthly: true, note: "Prosečna cena za DOO", optional: true, enabled: true }]
        : [{ label: "Knjigovodstvene usluge", amount: 15_000, monthly: true, note: "Prosečna cena za DOO", optional: true, enabled: false }]),
    ];
  }

  // Preduzetnik
  return [
    { label: "Registracija u APR-u", amount: 1_600, note: "Republička administrativna taksa" },
    ...(inputs.pecat
      ? [{ label: "Izrada pečata", amount: 3_000, note: "Nije obavezan od 2018.", optional: true, enabled: true }]
      : [{ label: "Izrada pečata", amount: 3_000, note: "Nije obavezan od 2018.", optional: true, enabled: false }]),
    ...(inputs.fiskalniUredjaj
      ? [{ label: "Fiskalni uređaj", amount: 50_000, note: "Obavezan za maloprodaju i ugostiteljstvo", optional: true, enabled: true }]
      : [{ label: "Fiskalni uređaj", amount: 50_000, note: "Obavezan za maloprodaju i ugostiteljstvo", optional: true, enabled: false }]),
    ...(inputs.knjigovodja
      ? [{ label: "Knjigovodstvene usluge", amount: 10_000, monthly: true, note: "Paušalci često ne trebaju", optional: true, enabled: true }]
      : [{ label: "Knjigovodstvene usluge", amount: 10_000, monthly: true, note: "Paušalci često ne trebaju", optional: true, enabled: false }]),
  ];
}

/* ─── Kupovina nekretnine ─── */

export interface NekretnineInputs {
  cena: number; // in EUR
  odInvestitora: boolean;
  agencija: boolean;
  procenatAgencije: number; // 2-4
}

export const NEKRETNINE_DEFAULTS: NekretnineInputs = {
  cena: 80_000,
  odInvestitora: false,
  agencija: true,
  procenatAgencije: 2,
};

const EUR_TO_RSD = 117.2; // approximate fixed rate

export function calcNekretnine(inputs: NekretnineInputs): CostLine[] {
  const cenaRSD = inputs.cena * EUR_TO_RSD;

  const items: CostLine[] = [];

  if (inputs.odInvestitora) {
    items.push({
      label: "PDV (uračunat u cenu)",
      amount: 0,
      note: "Kupovina od investitora — PDV je već uračunat u cenu stana",
    });
  } else {
    items.push({
      label: "Porez na prenos apsolutnih prava (2.5%)",
      amount: Math.round(cenaRSD * 0.025),
      note: "Plaća kupac, rok 30 dana od overe ugovora",
    });
  }

  // Notar — approximate tariff based on value
  let notarCost: number;
  if (cenaRSD <= 1_000_000) notarCost = 12_000;
  else if (cenaRSD <= 5_000_000) notarCost = 25_000;
  else if (cenaRSD <= 15_000_000) notarCost = 40_000;
  else if (cenaRSD <= 30_000_000) notarCost = 55_000;
  else notarCost = 70_000;

  items.push({
    label: "Overa ugovora kod notara",
    amount: notarCost,
    note: "Zavisi od vrednosti nekretnine (tabelarno)",
  });

  items.push({
    label: "Uknjižba u katastru",
    amount: 6_300,
    note: "Republički geodetski zavod",
  });

  items.push({
    label: "Taksa za poresku prijavu",
    amount: 1_100,
    note: "Poreska uprava",
  });

  if (inputs.agencija) {
    items.push({
      label: `Provizija agencije (${inputs.procenatAgencije}%)`,
      amount: Math.round(cenaRSD * (inputs.procenatAgencije / 100)),
      note: "Opciono — ako koristiš agenciju za nekretnine",
      optional: true,
      enabled: true,
    });
  }

  return items;
}

/* ─── Registracija vozila ─── */

export interface VoziloInputs {
  snagaKW: number;
  kubikaza: number;
  starostGodina: number;
  zeleniKarton: boolean;
}

export const VOZILO_DEFAULTS: VoziloInputs = {
  snagaKW: 85,
  kubikaza: 1600,
  starostGodina: 5,
  zeleniKarton: false,
};

export function calcVozilo(inputs: VoziloInputs): CostLine[] {
  // Tehnički pregled (approximate, varies by station)
  const tehPregled = 7_200;

  // Registracione nalepnice + admin takse
  const regTakse = 5_500;

  // Obavezno osiguranje — very rough estimate based on kW
  let osiguranje: number;
  if (inputs.snagaKW <= 44) osiguranje = 12_000;
  else if (inputs.snagaKW <= 55) osiguranje = 14_000;
  else if (inputs.snagaKW <= 66) osiguranje = 17_000;
  else if (inputs.snagaKW <= 80) osiguranje = 21_000;
  else if (inputs.snagaKW <= 100) osiguranje = 26_000;
  else if (inputs.snagaKW <= 130) osiguranje = 33_000;
  else osiguranje = 42_000;

  // Eco tax / porez na upotrebu motornih vozila (based on cm³)
  let porezUpotreba: number;
  if (inputs.kubikaza <= 1150) porezUpotreba = 3_520;
  else if (inputs.kubikaza <= 1300) porezUpotreba = 5_220;
  else if (inputs.kubikaza <= 1600) porezUpotreba = 8_400;
  else if (inputs.kubikaza <= 2000) porezUpotreba = 14_000;
  else if (inputs.kubikaza <= 2500) porezUpotreba = 22_080;
  else if (inputs.kubikaza <= 3000) porezUpotreba = 39_600;
  else porezUpotreba = 57_600;

  // Depreciation factor by age
  const ageFactor =
    inputs.starostGodina <= 1 ? 1.0
    : inputs.starostGodina <= 3 ? 0.9
    : inputs.starostGodina <= 5 ? 0.8
    : inputs.starostGodina <= 8 ? 0.7
    : inputs.starostGodina <= 12 ? 0.6
    : 0.5;

  porezUpotreba = Math.round(porezUpotreba * ageFactor);

  const items: CostLine[] = [
    { label: "Tehnički pregled", amount: tehPregled, note: "Cena varira po stanici" },
    { label: "Registracija (nalepnice + takse)", amount: regTakse },
    {
      label: "Obavezno osiguranje (AO)",
      amount: osiguranje,
      note: `Procena za ${inputs.snagaKW} kW — tačna cena zavisi od osiguravajuće kuće`,
    },
    {
      label: "Porez na upotrebu motornog vozila",
      amount: porezUpotreba,
      note: `${inputs.kubikaza} cm³, starost ${inputs.starostGodina} god.`,
    },
  ];

  if (inputs.zeleniKarton) {
    items.push({
      label: "Zeleni karton",
      amount: 5_000,
      note: "Za putovanje u inostranstvo",
      optional: true,
      enabled: true,
    });
  }

  return items;
}

/* ─── Helpers ─── */

export function formatRSD(amount: number): string {
  return new Intl.NumberFormat("sr-Latn-RS").format(amount) + " RSD";
}

export function formatEUR(amount: number): string {
  return new Intl.NumberFormat("sr-Latn-RS").format(amount) + " €";
}
