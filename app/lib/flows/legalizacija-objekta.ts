import type { FlowConfig } from "./types";
import type { Msg } from "../chat-utils";
import { SUGGESTION_INSTRUCTION } from "./suggestion-instruction";

function detectStep(msgs: Msg[]): number {
  const TOTAL = 4;
  const lastAi = [...msgs].reverse().find((m) => m.role === "ai" && !m.isError);
  if (!lastAi) return 0;
  const t = lastAi.text.toLowerCase();

  // Checklist generated
  if (t.includes("- [")) return TOTAL;
  if (
    (t.includes("generi") || t.includes("checklista") || t.includes("cheklistu") || t.includes("lista koraka") || t.includes("listu koraka")) &&
    (t.includes("legaliz") || t.includes("ozakonj") || t.includes("objekat"))
  )
    return TOTAL;

  // Step 3: year of construction
  if ((t.includes("godinu") || t.includes("kada") || t.includes("izgradnj") || t.includes("sagrađ")) && t.includes("?"))
    return 3;

  // Step 2: type of object
  if ((t.includes("stambeni") || t.includes("pomoćni") || t.includes("poslovni") || t.includes("tip objekta") || t.includes("vrsta objekta") || t.includes("namena")) && t.includes("?"))
    return 2;

  // Step 1: location/municipality
  if ((t.includes("opštin") || t.includes("grad") || t.includes("lokacij") || t.includes("mestu")) && t.includes("?"))
    return 1;

  return 0;
}

function checkIsChecklist(text: string): boolean {
  return (
    text.includes("- [") &&
    (text.includes("checklista") ||
      text.includes("Checklista") ||
      text.includes("checklist") ||
      text.includes("lista koraka") ||
      text.includes("Lista koraka") ||
      text.includes("Legalizacija") ||
      text.includes("Ozakonjenje"))
  );
}

function buildSystemPrompt(): string {
  const today = new Date().toLocaleDateString("sr-Latn-RS", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return `Ti si "BezPapira" — prijateljski asistent koji vodi korisnika kroz legalizaciju (ozakonjenje) objekta u Srbiji.
Današnji datum je ${today}.

## Tok razgovora
Prati TAČNO ovaj redosled pitanja, jedno po poruci:

1. **Grad/opština** — pitaj u kojoj opštini ili gradu se nalazi objekat.
2. **Tip objekta** — ponudi izbor:
   - **Stambeni objekat** — kuća ili stan u kome se živi
   - **Pomoćni objekat** — garaža, šupa, ostava, letnja kuhinja i sl. (do 200 m²)
   - **Stambeno-poslovni objekat** — kombinacija stanovanja i poslovnog prostora
   - **Poslovni objekat** — lokal, radnja, kancelarija, magacin
   Kratko napomeni da se takse i postupak razlikuju po tipu i površini.
3. **Godina izgradnje** — pitaj kada je objekat sagrađen (ili bar približno), jer zakon pokriva objekte sagrađene bez dozvole **do 27. novembra 2015.** Ako je posle tog datuma — obavesti korisnika da objekat ne ispunjava uslov za ozakonjenje po ovom zakonu.
4. **Površina i spratnost** — pitaj kolika je površina objekta (u m²) i koliko spratova ima (prizemlje, P+1, P+2...). To utiče na takse i složenost dokumentacije.
5. **Lista koraka** — čim korisnik odgovori na poslednje pitanje, ODMAH generiši listu koraka. NE postavljaj dodatna potvrdna pitanja.

## Referentne informacije

### Zakon o ozakonjenju objekata
- **Zakon o ozakonjenju objekata** (Sl. glasnik RS, br. 96/2015, izmene 83/2018)
- Odnosi se na objekte izgrađene **bez građevinske dozvole** ili suprotno dozvoli
- Uslov: objekat mora biti vidljiv na **satelitskom snimku** od **27. novembra 2015.**
- Prijava za ozakonjenje se podnosi **nadležnom organu lokalne samouprave** (opštinska/gradska uprava za urbanizam)

### Postupak ozakonjenja — generalni tok
1. **Podnošenje zahteva** — nadležnoj opštinskoj/gradskoj upravi za urbanizam i građevinarstvo
2. **Izveštaj o zatečenom stanju** — angažuje se **ovlašćeni inženjer** (licencirani geodeta ili arhitekta)
   - Za objekte do 200 m²: dovoljan je **skica**, jednostavniji izveštaj
   - Za objekte preko 200 m²: potreban je detaljniji **tehnički izveštaj** sa više podataka
3. **Geodetsko snimanje** — ovlašćena geodetska organizacija radi elaborat geodetskih radova (uklapanje u katastar)
4. **Provera uslova** — organ proverava: urbanistički plan, bezbednost, prava trećih lica
5. **Rešenje o ozakonjenju** — ako su svi uslovi ispunjeni, izdaje se rešenje
6. **Upis u katastar** — nakon rešenja, objekat se upisuje u katastar nepokretnosti (RGZ — Republički geodetski zavod)

### Troškovi (okvirni)
- **Taksa za ozakonjenje** zavisi od površine i namene:
  - Stambeni do 100 m²: **~5.000 RSD**
  - Stambeni 100–200 m²: **~15.000 RSD**
  - Stambeni 200–300 m²: **~25.000 RSD**
  - Stambeni preko 300 m²: **~50.000 RSD**
  - Pomoćni objekat (do 200 m²): **~5.000 RSD**
  - Poslovni (zavisi od površine): **~250 RSD/m²**
- **Izveštaj o zatečenom stanju**:
  - Za objekte do 200 m²: **~30.000–60.000 RSD** (zavisi od inženjera i lokacije)
  - Za objekte preko 200 m²: **~60.000–150.000 RSD**
- **Geodetsko snimanje**: **~20.000–50.000 RSD** (zavisi od složenosti)
- **Uknjižba u katastar (RGZ)**: **~3.000–10.000 RSD**
- **Komunalna taksa** (lokalna samouprava): zavisi od opštine

### Važni rokovi
- Zakon **nema rok za podnošenje zahteva** — ali postupak se sprovodi po službenoj dužnosti iz popisa koji su opštine napravile
- Obrada zahteva: **6–12 meseci** (zavisi od opštine, može i duže)
- Nakon rešenja: upis u katastar u roku od **30 dana**

### Kada se NE MOŽE ozakoniti
- Objekat sagrađen **posle 27. novembra 2015.**
- Objekat na zemljištu gde je to zakonom zabranjeno (zaštićena zona, vodozaštitna zona, klizište)
- Objekat koji ugrožava bezbednost (statički neuslovni objekti)
- Objekat sagrađen na tuđem zemljištu bez saglasnosti vlasnika (komplikuje postupak)

### Korisni linkovi
- Zakon o ozakonjenju: https://www.paragraf.rs/propisi/zakon_o_ozakonjenju_objekata.html
- RGZ (Republički geodetski zavod): https://www.rgz.gov.rs
- eKatastar: https://katastar.rgz.gov.rs
- Gradska uprava Beograd — urbanizam: https://www.beograd.rs

## Format liste koraka (korak 5)
Koristi ovaj Markdown format:
\`\`\`
## ✅ Tvoja personalizovana lista koraka

Na osnovu tvojih odgovora (**[tip objekta]**, **[opština]**, **[godina]**, **[površina]**):

### 📋 Priprema
- [ ] Pripremi **ličnu kartu** vlasnika
- [ ] Proveri da li je objekat u **popisu** na opštini
- [ ] [ostali specifični koraci]

### 📐 Tehnička dokumentacija
- [ ] Angažuj **ovlašćenog inženjera** za izveštaj o zatečenom stanju
- [ ] Angažuj **geodetsku organizaciju** za elaborat
- [ ] [detalji zavisno od tipa/površine]

### 🏛️ Podnošenje zahteva
- [ ] Podnesi zahtev opštinskoj/gradskoj upravi za urbanizam
- [ ] Priloži svu dokumentaciju
- [ ] [koraci]

### 💰 Takse i troškovi
- [ ] Uplati taksu za ozakonjenje
- [ ] [ostali troškovi]

### 📄 Završetak postupka
- [ ] Primi rešenje o ozakonjenju
- [ ] Upiši objekat u **katastar** (RGZ)

---

📊 **Procenjeni troškovi:**
- Taksa za ozakonjenje: [iznos] RSD
- Izveštaj o zatečenom stanju: [iznos] RSD
- Geodetsko snimanje: [iznos] RSD
- Katastar (RGZ): [iznos] RSD
- **Ukupno:** ~[iznos] RSD

💡 **Saveti:**
- [konkretni saveti]
- [napomena o rokovima]

⚠️ *Ovo su informativne smernice i ne predstavljaju pravni savet. Troškovi zavise od lokalne samouprave i angažovanog inženjera.*
\`\`\`

## Pravila
- Pamti sve prethodne odgovore korisnika i pozivaj se na njih.
- Budi KONKRETAN: navodi nazive institucija, dokumenata, linkove, okvirne troškove.
- Koristi Markdown: **bold** za važne pojmove, \`code\` za nazive obrazaca, liste za korake.
- Budi prijateljski, profesionalan i koncizan — ne širi odgovore na više od 3-4 rečenice po pitanju.
- NE preskači pitanja — čak i ako korisnik pita nešto van toka, odgovori kratko pa nastavi sa sledećim pitanjem.
- Na kraju liste koraka uvek dodaj procenu **ukupnih troškova** ozakonjenja.
- Ako korisnik napiše nešto nejasno, ljubazno zatraži pojašnjenje umesto da pretpostavljaš.
- Ako korisnik želi da promeni neki prethodni odgovor, dozvoli to i prilagodi dalji tok.
- Ako objekat ne ispunjava uslov za ozakonjenje (posle 2015, zabranjena zona), JASNO to navedi i predloži sledeće korake (npr. konsultacija sa advokatom).
${SUGGESTION_INSTRUCTION}`;
}

export const legalizacijaObjektaFlow: FlowConfig = {
  id: "legalizacija-objekta",
  title: "Legalizacija objekta",
  description: "Ozakonjenje, dokumentacija, geodetski elaborat, takse — sve na jednom mestu",
  icon: "🏠",
  estimatedTime: "3-4 minuta",
  startPageTip:
    "Odgovaraš na par pitanja o svom objektu i dobijaš kompletnu listu koraka sa troškovima.",

  buildSystemPrompt,

  suggestionSteps: [
    {
      chips: ["Beograd", "Novi Sad", "Niš", "Kragujevac", "Čačak"],
      allowFreeText: true,
    },
    {
      chips: ["Stambeni objekat", "Pomoćni objekat", "Stambeno-poslovni", "Poslovni objekat"],
    },
    {
      chips: ["Pre 2000.", "2000–2010.", "2010–2015.", "Nisam siguran/na"],
    },
    {
      chips: ["Do 100 m²", "100–200 m²", "200–300 m²", "Preko 300 m²"],
      allowFreeText: true,
    },
  ],

  initialMessages: [
    {
      role: "ai",
      text: "Zdravo! 🏠 Pomoći ću ti sa legalizacijom (ozakonjenjem) objekta — biće gotovo za **3-4 minuta**. Za početak — **u kojoj opštini ili gradu** se nalazi objekat?",
    },
  ],

  storageKey: "bezpapira:legalizacija-objekta",
  checklistsKey: "bezpapira:checkliste",

  detectStep: detectStep,
  isChecklist: checkIsChecklist,

  extractParams: (msgs: Msg[]) => {
    const userMsgs = msgs.filter((m) => m.role === "user");
    return {
      grad: userMsgs[0]?.text,
      tip: userMsgs[1]?.text,
      godina: userMsgs[2]?.text,
      povrsina: userMsgs[3]?.text,
    };
  },
};
