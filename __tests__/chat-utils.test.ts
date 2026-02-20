import { describe, it, expect } from "vitest";
import { detectFlowStep, isChecklist } from "@/app/lib/chat-utils";
import type { Msg } from "@/app/lib/chat-utils";

describe("detectFlowStep", () => {
  it("returns 0 (city) when there are no messages", () => {
    expect(detectFlowStep([])).toBe(0);
  });

  it("returns 0 when only user messages exist (no AI response yet)", () => {
    const msgs: Msg[] = [{ role: "user", text: "Zdravo!" }];
    expect(detectFlowStep(msgs)).toBe(0);
  });

  it("returns 0 (city) for the initial AI greeting", () => {
    const msgs: Msg[] = [
      { role: "ai", text: "Ćao! 👋 Hajde da zajedno prođemo kroz proces otvaranja firme. Za početak — u kom gradu planiraš da otvoriš firmu?" },
    ];
    expect(detectFlowStep(msgs)).toBe(0);
  });

  it("returns 1 (business type) when AI asks about PR/DOO", () => {
    const msgs: Msg[] = [
      { role: "ai", text: "Odlično! Da li želiš da budeš Preduzetnik ili DOO (Društvo sa ograničenom odgovornošću)?" },
    ];
    expect(detectFlowStep(msgs)).toBe(1);
  });

  it("returns 2 (activity) when AI asks about delatnost", () => {
    const msgs: Msg[] = [
      { role: "ai", text: "Super izbor! Čime će se tvoja firma baviti? Koja je tvoja delatnost?" },
    ];
    expect(detectFlowStep(msgs)).toBe(2);
  });

  it("returns 2 when AI asks about šifra delatnosti", () => {
    const msgs: Msg[] = [
      { role: "ai", text: "Koja šifra delatnosti ti odgovara?" },
    ];
    expect(detectFlowStep(msgs)).toBe(2);
  });

  it("returns 3 (taxation) when AI asks about paušal", () => {
    const msgs: Msg[] = [
      { role: "ai", text: "Da li želiš paušalno oporezivanje ili vođenje knjiga?" },
    ];
    expect(detectFlowStep(msgs)).toBe(3);
  });

  it("returns 3 when AI asks about oporezivanje", () => {
    const msgs: Msg[] = [
      { role: "ai", text: "Kako želiš da rešiš oporezivanje? Evo opcija..." },
    ];
    expect(detectFlowStep(msgs)).toBe(3);
  });

  it("returns 4 (done) when checklist is generated", () => {
    const msgs: Msg[] = [
      { role: "ai", text: "## ✅ Tvoja checklista\n\n- [ ] Korak 1\n- [ ] Korak 2" },
    ];
    expect(detectFlowStep(msgs)).toBe(4);
  });

  it("returns 4 when AI confirms and is about to generate checklist (generiš + paušal)", () => {
    const msgs: Msg[] = [
      { role: "ai", text: "Odlično, generišem cheklistu za paušal..." },
    ];
    expect(detectFlowStep(msgs)).toBe(4);
  });

  it("returns 4 when AI confirms user's taxation choice (odlučio + paušal)", () => {
    const msgs: Msg[] = [
      { role: "ai", text: "Super, odlučio si se za paušal! Evo chekliste..." },
    ];
    expect(detectFlowStep(msgs)).toBe(4);
  });

  it("returns 4 when AI confirms with izabrao + knjiga", () => {
    const msgs: Msg[] = [
      { role: "ai", text: "Izabrao si vođenje knjiga. Sad ću ti napraviti checklistu." },
    ];
    expect(detectFlowStep(msgs)).toBe(4);
  });

  it("ignores error messages when detecting flow step", () => {
    const msgs: Msg[] = [
      { role: "ai", text: "Da li želiš paušalno oporezivanje?" },
      { role: "user", text: "Da" },
      { role: "ai", text: "⚠️ Greška pri slanju poruke.", isError: true },
    ];
    expect(detectFlowStep(msgs)).toBe(3);
  });

  it("uses only the LAST AI message for detection", () => {
    const msgs: Msg[] = [
      { role: "ai", text: "U kom gradu?" },
      { role: "user", text: "Beograd" },
      { role: "ai", text: "Preduzetnik ili DOO (Društvo sa ograničenom odgovornošću)?" },
    ];
    // Should detect step 1 based on last AI message, not step 0
    expect(detectFlowStep(msgs)).toBe(1);
  });

  it("handles greeting + city question flow correctly", () => {
    const msgs: Msg[] = [
      { role: "user", text: "Zdravo!" },
      { role: "ai", text: "Ćao! U kom gradu planiraš da otvoriš firmu?" },
    ];
    // AI asks about city → step 0
    expect(detectFlowStep(msgs)).toBe(0);
  });
});

describe("isChecklist", () => {
  it("returns true for a valid checklist with checkbox syntax", () => {
    const text = "## ✅ Tvoja Checklista\n\n- [ ] Korak 1\n- [ ] Korak 2";
    expect(isChecklist(text)).toBe(true);
  });

  it("returns true for checklist with Registracija keyword", () => {
    const text = "### Registracija u APR-u\n- [ ] Podnesi zahtev\n- [ ] Plati taksu";
    expect(isChecklist(text)).toBe(true);
  });

  it("returns false for regular AI messages", () => {
    expect(isChecklist("Ćao! U kom gradu planiraš da otvoriš firmu?")).toBe(false);
  });

  it("returns false for messages with checkboxes but no checklist keywords", () => {
    expect(isChecklist("- [ ] random item")).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(isChecklist("")).toBe(false);
  });
});
