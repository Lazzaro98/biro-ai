import { describe, it, expect } from "vitest";
import {
  ensureSourceDateBlock,
  looksLikeChecklist,
  validateChecklistQuality,
} from "@/app/lib/checklist-quality";

describe("checklist quality", () => {
  it("detects checklist-like content", () => {
    expect(looksLikeChecklist("- [ ] Stavka 1\n- [ ] Stavka 2")).toBe(true);
    expect(looksLikeChecklist("Obično pitanje bez checkliste")).toBe(false);
  });

  it("appends sources/date block when missing", () => {
    const input = "## ✅ Checklista\n- [ ] Korak 1\n- [ ] Korak 2\n- [ ] Korak 3\n- [ ] Korak 4\nAPR";
    const output = ensureSourceDateBlock(input);
    expect(output).toContain("Izvori i datum provere");
    expect(output).toContain("Provereno:");
  });

  it("keeps non-checklist text unchanged", () => {
    const input = "Ćao! Kako mogu da pomognem?";
    expect(ensureSourceDateBlock(input)).toBe(input);
  });

  it("passes quality checks for valid checklist with source/date", () => {
    const text = `## ✅ Tvoja checklista
- [ ] Podnesi zahtev u APR
- [ ] Plati taksu
- [ ] Otvori račun u banci
- [ ] Prijavi porez u Poreskoj upravi

### 📚 Izvori i datum provere
- Provereno: **21.02.2026**
- Primarni izvori: **apr.gov.rs**, **purs.gov.rs**`;

    const result = validateChecklistQuality(text);
    expect(result.isChecklist).toBe(true);
    expect(result.ok).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it("reports issues for incomplete checklist", () => {
    const text = "- [ ] Jedna stavka";
    const result = validateChecklistQuality(text);
    expect(result.isChecklist).toBe(true);
    expect(result.ok).toBe(false);
    expect(result.issues.length).toBeGreaterThan(0);
  });
});
