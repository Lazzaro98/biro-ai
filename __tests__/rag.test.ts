import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

/* ─────────────────────────────────────────────
 *  RAG unit tests
 *
 *  Tests document parsing, chunking logic, and
 *  metadata integrity. Does NOT call OpenAI
 *  (no API key needed to run these tests).
 * ───────────────────────────────────────────── */

const DOCS_DIR = path.resolve(__dirname, "../knowledge/documents");
const METADATA_PATH = path.resolve(__dirname, "../knowledge/metadata.json");

/* ── Document structure tests ───────────────── */

describe("knowledge documents", () => {
  const mdFiles = fs.existsSync(DOCS_DIR)
    ? fs.readdirSync(DOCS_DIR).filter((f) => f.endsWith(".md") && f !== "README.md")
    : [];

  it("has at least one knowledge document", () => {
    expect(mdFiles.length).toBeGreaterThanOrEqual(1);
  });

  it.each(mdFiles)("%s has valid YAML frontmatter", (file) => {
    const raw = fs.readFileSync(path.join(DOCS_DIR, file), "utf-8");

    // Must start with --- and have closing ---
    expect(raw).toMatch(/^---\r?\n/);
    expect(raw).toMatch(/\r?\n---\r?\n/);

    // Must have required frontmatter fields
    const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    expect(fmMatch).not.toBeNull();

    const yaml = fmMatch![1];
    expect(yaml).toMatch(/^id:\s*.+/m);
    expect(yaml).toMatch(/^title:\s*.+/m);
    expect(yaml).toMatch(/^institution:\s*.+/m);
    expect(yaml).toMatch(/^url:\s*.+/m);
    expect(yaml).toMatch(/^type:\s*.+/m);
    expect(yaml).toMatch(/^verifiedDate:\s*.+/m);
  });

  it.each(mdFiles)("%s has at least one ## section", (file) => {
    const raw = fs.readFileSync(path.join(DOCS_DIR, file), "utf-8");
    const body = raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "");
    expect(body).toMatch(/^##\s+.+/m);
  });

  it.each(mdFiles)("%s id matches filename", (file) => {
    const raw = fs.readFileSync(path.join(DOCS_DIR, file), "utf-8");
    const idMatch = raw.match(/^id:\s*(.+)/m);
    expect(idMatch).not.toBeNull();

    const id = idMatch![1].trim().replace(/^["']|["']$/g, "");
    const expectedId = file.replace(/\.md$/, "");
    expect(id).toBe(expectedId);
  });
});

/* ── Metadata tests ─────────────────────────── */

describe("metadata.json", () => {
  it("exists and is valid JSON", () => {
    expect(fs.existsSync(METADATA_PATH)).toBe(true);
    const raw = fs.readFileSync(METADATA_PATH, "utf-8");
    const meta = JSON.parse(raw);
    expect(meta).toHaveProperty("version");
    expect(meta).toHaveProperty("documents");
    expect(Array.isArray(meta.documents)).toBe(true);
  });

  it("has entries for all document files", () => {
    const mdFiles = fs.readdirSync(DOCS_DIR)
      .filter((f) => f.endsWith(".md") && f !== "README.md")
      .map((f) => f.replace(/\.md$/, ""));

    const raw = fs.readFileSync(METADATA_PATH, "utf-8");
    const meta = JSON.parse(raw);
    const metaIds = meta.documents.map((d: { id: string }) => d.id);

    for (const fileId of mdFiles) {
      expect(metaIds).toContain(fileId);
    }
  });

  it("each entry has required fields", () => {
    const raw = fs.readFileSync(METADATA_PATH, "utf-8");
    const meta = JSON.parse(raw);

    for (const doc of meta.documents) {
      expect(doc).toHaveProperty("id");
      expect(doc).toHaveProperty("title");
      expect(doc).toHaveProperty("institution");
      expect(doc).toHaveProperty("flows");
      expect(typeof doc.id).toBe("string");
      expect(typeof doc.title).toBe("string");
      expect(Array.isArray(doc.flows)).toBe(true);
    }
  });

  it("document files referenced in metadata exist on disk", () => {
    const raw = fs.readFileSync(METADATA_PATH, "utf-8");
    const meta = JSON.parse(raw);

    for (const doc of meta.documents) {
      const filePath = path.join(DOCS_DIR, `${doc.id}.md`);
      expect(fs.existsSync(filePath)).toBe(true);
    }
  });
});

/* ── Chunking logic tests ───────────────────── */

describe("section splitting", () => {
  // Re-implement the splitting logic here to test it in isolation
  function splitBySections(body: string): { heading: string; text: string }[] {
    const lines = body.split("\n");
    const sections: { heading: string; text: string }[] = [];
    let currentHeading = "";
    let currentLines: string[] = [];

    for (const line of lines) {
      const headingMatch = line.match(/^##\s+(.+)/);
      if (headingMatch) {
        if (currentLines.length > 0) {
          const text = currentLines.join("\n").trim();
          if (text) sections.push({ heading: currentHeading, text });
        }
        currentHeading = headingMatch[1].trim();
        currentLines = [];
      } else {
        currentLines.push(line);
      }
    }

    if (currentLines.length > 0) {
      const text = currentLines.join("\n").trim();
      if (text) sections.push({ heading: currentHeading, text });
    }

    return sections;
  }

  it("splits markdown by ## headings", () => {
    const body = `# Main Title

Some intro text.

## Section One

Content of section one.

## Section Two

Content of section two.
More content.

## Section Three

Final content.`;

    const sections = splitBySections(body);
    expect(sections).toHaveLength(4); // intro + 3 sections
    expect(sections[0].heading).toBe("");
    expect(sections[0].text).toContain("Main Title");
    expect(sections[1].heading).toBe("Section One");
    expect(sections[2].heading).toBe("Section Two");
    expect(sections[3].heading).toBe("Section Three");
  });

  it("handles empty sections", () => {
    const body = `## A

Content A

## B

## C

Content C`;

    const sections = splitBySections(body);
    // Section B has no content, so it should be skipped
    expect(sections.length).toBe(2);
    expect(sections[0].heading).toBe("A");
    expect(sections[1].heading).toBe("C");
  });

  it("does not split on ### (sub-headings)", () => {
    const body = `## Main

### Sub-heading

Content under sub-heading.`;

    const sections = splitBySections(body);
    expect(sections).toHaveLength(1);
    expect(sections[0].text).toContain("### Sub-heading");
  });
});

/* ── Config tests ───────────────────────────── */

describe("RAG config", () => {
  it("exports valid constants", async () => {
    const config = await import("@/app/lib/rag/config");

    expect(config.EMBEDDING_MODEL).toBe("text-embedding-3-small");
    expect(config.EMBEDDING_DIMENSION).toBe(1536);
    expect(config.TOP_K).toBeGreaterThan(0);
    expect(config.MIN_SIMILARITY).toBeGreaterThanOrEqual(0);
    expect(config.MIN_SIMILARITY).toBeLessThan(1);
    expect(config.MAX_CHUNK_CHARS).toBeGreaterThan(100);
    expect(config.CHUNK_OVERLAP_CHARS).toBeGreaterThan(0);
    expect(config.CHUNK_OVERLAP_CHARS).toBeLessThan(config.MAX_CHUNK_CHARS);
  });
});

/* ── Cosine similarity tests ────────────────── */

describe("cosine similarity", () => {
  // Inline the function so we don't need to export it
  function cosineSimilarity(a: number[], b: number[]): number {
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    return denom === 0 ? 0 : dot / denom;
  }

  it("returns 1 for identical vectors", () => {
    const v = [0.1, 0.2, 0.3, 0.4];
    expect(cosineSimilarity(v, v)).toBeCloseTo(1.0);
  });

  it("returns 0 for orthogonal vectors", () => {
    const a = [1, 0, 0];
    const b = [0, 1, 0];
    expect(cosineSimilarity(a, b)).toBeCloseTo(0.0);
  });

  it("returns -1 for opposite vectors", () => {
    const a = [1, 0];
    const b = [-1, 0];
    expect(cosineSimilarity(a, b)).toBeCloseTo(-1.0);
  });

  it("returns 0 for zero vectors", () => {
    const a = [0, 0, 0];
    const b = [1, 2, 3];
    expect(cosineSimilarity(a, b)).toBe(0);
  });
});
