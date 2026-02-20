import type { FlowConfig } from "./types";
import type { Msg } from "../chat-utils";
import { SUGGESTION_INSTRUCTION } from "./suggestion-instruction";

function detectStep(msgs: Msg[]): number {
  // Free-form conversation doesn't have rigid steps.
  // We track rough progress: 0 = start, 1 = user explained, 2 = AI answered, 3 = follow-up, 4 = done (checklist)
  const TOTAL = 4;
  const userMsgs = msgs.filter((m) => m.role === "user").length;
  const lastAi = [...msgs].reverse().find((m) => m.role === "ai" && !m.isError);
  if (!lastAi) return 0;
  const t = lastAi.text.toLowerCase();

  if (t.includes("- [")) return TOTAL;
  if (userMsgs >= 3) return 3;
  if (userMsgs >= 2) return 2;
  if (userMsgs >= 1) return 1;
  return 0;
}

function checkIsChecklist(text: string): boolean {
  return (
    text.includes("- [") &&
    (text.includes("koraci") ||
      text.includes("korak") ||
      text.includes("checklista") ||
      text.includes("Checklista") ||
      text.includes("checklist") ||
      text.includes("potrebno") ||
      text.includes("procedura"))
  );
}

function buildSystemPrompt(): string {
  const today = new Date().toLocaleDateString("sr-Latn-RS", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return `Ti si Biro AI — stručni pravni asistent specijalizovan za birokratske procese u Srbiji.

DATUM: ${today}

ULOGA:
Korisnik će ti opisati svoju situaciju ili pitanje vezano za pravne, administrativne i birokratske postupke u Srbiji.
Tvoj posao je da:
1. Pažljivo saslušaš i razumeš korisnikovu situaciju
2. Ako treba, postaviš potpitanja da razjasniš detalje
3. Daš jasan, strukturiran odgovor sa svim potrebnim koracima
4. Na kraju, ako je primenjivo, generišeš checklistu koraka

OBLASTI EKSPERTIZE:
- Registracija preduzetnika i firmi (DOO, preduzetnik, ortačko društvo)
- Kupoprodaja nekretnina (stanovi, kuće, zemljište)
- Registracija i odjava vozila
- Lična dokumenta (lična karta, pasoš, vozačka dozvola)
- Poreski postupci (prijave, povraćaj, olakšice)
- Radni odnosi (zapošljavanje, otkaz, prava radnika)
- Carina i uvoz robe
- Građevinske dozvole i urbanizam
- Socijalna zaštita i prava (zdravstveno, penzijsko, nezaposlenost)
- Upis u katastar i imovinsko-pravni odnosi
- Sudski i upravni postupci
- Bilo koji drugi pravni/birokratski proces u Srbiji

STIL KOMUNIKACIJE:
- Koristi srpski jezik (latinica).
- Budi prijateljski ali profesionalan — obraćaj se sa "ti".
- Svaki odgovor neka bude jasan i strukturiran.
- Ako nečega nisi siguran, reci to otvoreno.

CHECKLISTA:
Ako korisnik traži konkretne korake za neki proces, ili ako iz razgovora jasno proizilazi koji proces treba pratiti, generiši checklistu u ovom formatu:

## ✅ Checklista: [Naslov procesa]

- [ ] Korak 1 — opis
- [ ] Korak 2 — opis
...

Svaki korak mora biti konkretan i sprovediv.

NAPOMENA:
Dajes informativne smernice. Ovo NIJE pravni savet i korisnik treba da se konsultuje sa advokatom za specifične pravne situacije.
${SUGGESTION_INSTRUCTION}`;
}

export const slobodanRazgovorFlow: FlowConfig = {
  id: "slobodan-razgovor",
  title: "Opšta konsultacija",
  description: "Opiši svoju situaciju — AI pravni asistent ti pomaže",
  icon: "💬",
  estimatedTime: "5–15 minuta",
  startPageTip:
    "Slobodno opiši šta te zanima — od dokumenata i poreza do registracija i dozvola. AI asistent će te voditi kroz ceo proces.",

  buildSystemPrompt,
  suggestionSteps: [
    {
      chips: [
        "Želim da otvorim biznis",
        "Imam pitanje o dokumentima",
        "Treba mi pomoć oko poreza",
        "Pitanje o nekretninama",
        "Radno pravo i zapošljavanje",
        "Nešto drugo",
      ],
      allowFreeText: true,
    },
    {
      chips: [],
      allowFreeText: true,
    },
    {
      chips: ["Možeš li mi napraviti checklistu?", "Imam još pitanja"],
      allowFreeText: true,
    },
    {
      chips: ["Generiši mi checklistu koraka", "Hvala, to je sve!"],
      allowFreeText: true,
    },
  ],

  initialMessages: [
    {
      role: "ai",
      text: "Zdravo! 👋 Ja sam Biro AI — tvoj pravni asistent za birokratiju u Srbiji.\n\nOpiši mi svoju situaciju ili pitanje, a ja ću ti pomoći da se snaðeš kroz sve potrebne korake, dokumenta i postupke.\n\nMožeš pitati bilo šta — od otvaranja firme, kupovine stana, do registracije vozila ili bilo kog drugog administrativnog procesa. 🏛️",
    },
  ],

  storageKey: "biro-ai:slobodan-razgovor",
  checklistsKey: "biro-ai:checkliste",

  detectStep,
  isChecklist: checkIsChecklist,

  extractParams(msgs: Msg[]): Record<string, string | undefined> {
    const firstUser = msgs.find((m) => m.role === "user");
    return {
      tema: firstUser?.text?.slice(0, 50) || undefined,
    };
  },
};
