import { describe, it, expect } from "vitest";
import { encodeChecklist, decodeChecklist } from "../app/lib/share";

describe("share — encode / decode", () => {
  const sampleChecklist = {
    title: "Otvaranje firme",
    flowId: "otvaranje-firme",
    params: { grad: "Beograd", tip: "DOO" },
    markdown: "## Checklista\n\n- [ ] Korak 1\n- [ ] Korak 2\n- [ ] Korak 3",
    date: "2026-01-15T12:00:00.000Z",
  };

  it("roundtrips correctly", () => {
    const encoded = encodeChecklist(sampleChecklist);
    expect(typeof encoded).toBe("string");
    expect(encoded.length).toBeGreaterThan(0);

    const decoded = decodeChecklist(encoded);
    expect(decoded).toEqual(sampleChecklist);
  });

  it("produces URL-safe string", () => {
    const encoded = encodeChecklist(sampleChecklist);
    // Should not contain characters that break URLs
    expect(encoded).not.toMatch(/[&=?#\s]/);
  });

  it("compresses significantly", () => {
    const longChecklist = {
      ...sampleChecklist,
      markdown: Array.from({ length: 30 }, (_, i) =>
        `- [ ] Korak ${i + 1}: Opis koraka koji je relativno dugačak i sadrži detalje`
      ).join("\n"),
    };
    const json = JSON.stringify(longChecklist);
    const encoded = encodeChecklist(longChecklist);
    // Compressed should be smaller than raw JSON
    expect(encoded.length).toBeLessThan(json.length);
  });

  it("returns null for invalid input", () => {
    expect(decodeChecklist("")).toBeNull();
    expect(decodeChecklist("garbage-data-xyz")).toBeNull();
    expect(decodeChecklist("{}")).toBeNull();
  });

  it("returns null when markdown is missing", () => {
    const noMarkdown = { title: "Test", params: {}, date: "2026-01-01" };
    const encoded = encodeChecklist(noMarkdown as never);
    // Even though it encodes, the decode validation should catch missing markdown
    // Actually lz-string will encode anything, but decode checks for markdown field
    const decoded = decodeChecklist(encoded);
    expect(decoded).toBeNull();
  });
});
