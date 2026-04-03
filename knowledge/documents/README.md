# Knowledge Base — Zvanični dokumenti

Ovaj folder sadrži kurirane, verifikovane dokumente iz zvaničnih izvora
(APR, Službeni glasnik, Poreska uprava, RGZ, MUP itd.).

## Struktura fajla

Svaki dokument je Markdown fajl sa YAML frontmatter zaglavljem:

```markdown
---
id: apr-registracija-pr
title: "Registracija preduzetnika — APR uputstvo"
institution: "Agencija za privredne registre"
url: "https://www.apr.gov.rs/registri/preduzetnici/uputstva.html"
type: uputstvo
publishedDate: "2025-01-15"
verifiedDate: "2026-04-01"
sluzbeniGlasnik: ""
flows:
  - otvaranje-firme
---

# Registracija preduzetnika

## Potrebna dokumentacija
- ...
```

## Pravila

1. **Samo zvanični izvori** — ne blogovi, ne forumi, ne novinski članci
2. **Uvek navesti URL** odakle je dokument preuzet
3. **Datum provere** (`verifiedDate`) ažurirati kad ponoviš proveru
4. **Struktura po sekcijama** — koristi `##` zaglavlja za logičke celine
   (svaka sekcija postaje jedan chunk za pretragu)
5. **Bez interpretacije** — prepiši šta dokument kaže, ne dodaj mišljanje
