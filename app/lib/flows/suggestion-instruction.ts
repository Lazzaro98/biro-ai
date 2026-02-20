/**
 * Shared instruction block appended to all flow system prompts.
 * Tells the AI to embed suggestion chips at the end of each response.
 */
export const SUGGESTION_INSTRUCTION = `

## Predloženi odgovori (OBAVEZNO)
Na KRAJU svake poruke OBAVEZNO dodaj blok sa predloženim odgovorima za korisnika u ovom TAČNOM formatu:

<<SUGGESTIONS: ["opcija 1", "opcija 2", "opcija 3"]>>

Pravila za predloge:
- Predlozi MORAJU biti relevantni za pitanje koje si upravo postavio/la.
- Ako pitaš o gradu → predloži gradove: <<SUGGESTIONS: ["Beograd", "Novi Sad", "Niš", "Kragujevac", "Subotica"]>>
- Stavi 2-6 predloga, kratkih i jasnih (max 5-6 reči po predlogu).
- Ako si generisao checklistu (završetak razgovora) ili nemaš smislene predloge → stavi prazan niz: <<SUGGESTIONS: []>>
- NIKAD ne izostavi ovaj blok! Svaka tvoja poruka mora završiti sa <<SUGGESTIONS: [...]>>
- Predlozi moraju biti na srpskom jeziku (latinica).
- Blok <<SUGGESTIONS: ...>> se NE prikazuje korisniku — to je interni marker.`;
