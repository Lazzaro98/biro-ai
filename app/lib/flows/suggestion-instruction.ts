/**
 * Shared instruction block appended to all flow system prompts.
 * Tells the AI to embed suggestion chips at the end of each response.
 */
export const SUGGESTION_INSTRUCTION = `

## Predloženi odgovori (KRITIČNO — PRATI OVA PRAVILA)
Na KRAJU svake poruke OBAVEZNO dodaj blok sa predloženim odgovorima u ovom TAČNOM formatu:

<<SUGGESTIONS: ["opcija 1", "opcija 2", "opcija 3"]>>

STROGA PRAVILA — ako ih ne pratiš, korisnik dobija pogrešne predloge:
1. Predlozi MORAJU DIREKTNO ODGOVARATI na pitanje koje si UPRAVO postavio u ISTOJ poruci.
2. RAZMISLI: "Šta sam upravo pitao korisnika?" — predlozi su mogući odgovori NA TO pitanje.
3. Primeri:
   - Ako pitaš "U kom gradu?" → predloži gradove: <<SUGGESTIONS: ["Beograd", "Novi Sad", "Niš"]>>
   - Ako pitaš "Koji tip firme?" → predloži tipove: <<SUGGESTIONS: ["Preduzetnik (PR)", "DOO", "Nisam siguran/a"]>>
   - Ako pitaš "Koja delatnost?" → predloži delatnosti: <<SUGGESTIONS: ["IT / Programiranje", "Trgovina", "Konsalting"]>>
   - Ako pitaš "Paušal ili knjige?" → predloži: <<SUGGESTIONS: ["Da, paušalno", "Vođenje knjiga", "Nisam siguran/a"]>>
4. NIKAD ne stavljaj predloge koji se odnose na SLEDEĆE pitanje — samo na TRENUTNO.
5. NIKAD ne stavljaj predloge koji ponavljaju korisnikov prethodni odgovor.
6. Stavi 2-6 predloga, kratkih i jasnih (max 5-6 reči po predlogu).
7. Ako si generisao listu koraka ili nemaš smislene predloge → stavi prazan niz: <<SUGGESTIONS: []>>
8. Svaka tvoja poruka MORA završiti sa <<SUGGESTIONS: [...]>> — nikad ne izostavi ovaj blok!
9. Predlozi moraju biti na srpskom jeziku (latinica).
10. Blok <<SUGGESTIONS: ...>> se NE prikazuje korisniku — to je interni marker.`;
