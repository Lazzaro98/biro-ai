/* ─────────────────────────────────────────────
 *  RAG ingest pipeline
 *
 *  Reads markdown documents from knowledge/documents/,
 *  splits them into chunks by ## headings,
 *  generates embeddings via OpenAI, and writes
 *  the resulting index to knowledge/embeddings.json.
 *
 *  Usage:  npx tsx app/lib/rag/ingest.ts
 * ───────────────────────────────────────────── */

import fs from "node:fs";
import path from "node:path";
import OpenAI from "openai";
import {
  EMBEDDING_MODEL,
  EMBEDDING_DIMENSION,
  MAX_CHUNK_CHARS,
  CHUNK_OVERLAP_CHARS,
  DOCUMENTS_DIR,
  EMBEDDINGS_PATH,
} from "./config";

/* ── load .env.local (no dotenv dependency needed) ── */
function loadEnvFile() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let value = trimmed.slice(eqIdx + 1).trim();
    // strip surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}
loadEnvFile();
import type {
  DocumentChunk,
  DocumentSource,
  EmbeddingsIndex,
} from "./types";

/* ── helpers ────────────────────────────────── */

interface ParsedFrontmatter {
  id: string;
  title: string;
  institution: string;
  url: string;
  type: DocumentSource["type"];
  publishedDate: string;
  verifiedDate: string;
  sluzbeniGlasnik?: string;
  flows: string[];
}

/** Very small YAML-frontmatter parser (avoids adding gray-matter dep) */
function parseFrontmatter(raw: string): { meta: ParsedFrontmatter; body: string } {
  const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!fmMatch) throw new Error("Missing YAML frontmatter");

  const yamlBlock = fmMatch[1];
  const body = fmMatch[2];

  const get = (key: string): string => {
    const m = yamlBlock.match(new RegExp(`^${key}:\\s*"?(.+?)"?\\s*$`, "m"));
    return m ? m[1].replace(/^["']|["']$/g, "") : "";
  };

  const getList = (key: string): string[] => {
    const singleLine = yamlBlock.match(new RegExp(`^${key}:\\s*\\[(.+?)\\]`, "m"));
    if (singleLine) {
      return singleLine[1].split(",").map((s) => s.trim().replace(/^["']|["']$/g, ""));
    }
    // multi-line YAML list
    const items: string[] = [];
    const multiMatch = yamlBlock.match(new RegExp(`^${key}:\\s*\\n((?:\\s+-\\s+.+\\n?)+)`, "m"));
    if (multiMatch) {
      for (const line of multiMatch[1].split("\n")) {
        const val = line.match(/^\s+-\s+(.+)/);
        if (val) items.push(val[1].trim().replace(/^["']|["']$/g, ""));
      }
    }
    return items;
  };

  const meta: ParsedFrontmatter = {
    id: get("id"),
    title: get("title"),
    institution: get("institution"),
    url: get("url"),
    type: (get("type") || "ostalo") as DocumentSource["type"],
    publishedDate: get("publishedDate"),
    verifiedDate: get("verifiedDate"),
    sluzbeniGlasnik: get("sluzbeniGlasnik") || undefined,
    flows: getList("flows"),
  };

  if (!meta.id) throw new Error("Frontmatter missing 'id'");

  return { meta, body };
}

/** Split markdown body into sections by ## headings */
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

  // last section
  if (currentLines.length > 0) {
    const text = currentLines.join("\n").trim();
    if (text) sections.push({ heading: currentHeading, text });
  }

  return sections;
}

/** Further split a section if it exceeds MAX_CHUNK_CHARS */
function splitLargeSection(
  heading: string,
  text: string,
): { heading: string; text: string }[] {
  if (text.length <= MAX_CHUNK_CHARS) return [{ heading, text }];

  const results: { heading: string; text: string }[] = [];
  let start = 0;

  while (start < text.length) {
    let end = start + MAX_CHUNK_CHARS;

    // try to break at a paragraph/newline boundary
    if (end < text.length) {
      const lastNewline = text.lastIndexOf("\n", end);
      if (lastNewline > start + MAX_CHUNK_CHARS / 2) {
        end = lastNewline;
      }
    } else {
      end = text.length;
    }

    results.push({
      heading: heading + (results.length > 0 ? ` (nastavak)` : ""),
      text: text.slice(start, end).trim(),
    });

    start = end - CHUNK_OVERLAP_CHARS;
    if (start < 0) start = 0;
    // avoid infinite loop
    if (start >= text.length) break;
    if (end >= text.length) break;
  }

  return results;
}

/* ── main ───────────────────────────────────── */

async function ingest() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("❌ OPENAI_API_KEY not set. Add it to .env.local or export it.");
    process.exit(1);
  }

  const openai = new OpenAI({ apiKey });

  const docsDir = path.resolve(process.cwd(), DOCUMENTS_DIR);
  const files = fs.readdirSync(docsDir).filter((f) => f.endsWith(".md") && f !== "README.md");

  if (files.length === 0) {
    console.error("❌ No .md documents found in", docsDir);
    process.exit(1);
  }

  console.log(`📂 Found ${files.length} document(s) in ${DOCUMENTS_DIR}/`);

  // 1. Parse all documents and build chunks
  const allChunks: Omit<DocumentChunk, "embedding">[] = [];

  for (const file of files) {
    const raw = fs.readFileSync(path.join(docsDir, file), "utf-8");
    const { meta, body } = parseFrontmatter(raw);

    console.log(`  📄 ${meta.id} — ${meta.title}`);

    const source: DocumentSource = {
      institution: meta.institution,
      url: meta.url,
      type: meta.type,
      publishedDate: meta.publishedDate,
      verifiedDate: meta.verifiedDate,
      sluzbeniGlasnik: meta.sluzbeniGlasnik,
    };

    const sections = splitBySections(body);
    let chunkIndex = 0;

    for (const section of sections) {
      const subChunks = splitLargeSection(section.heading, section.text);
      for (const sub of subChunks) {
        // Skip trivially small chunks (< 20 chars)
        if (sub.text.length < 20) continue;

        allChunks.push({
          id: `${meta.id}#${chunkIndex}`,
          documentId: meta.id,
          section: sub.heading,
          text: sub.text,
          source,
        });
        chunkIndex++;
      }
    }
  }

  console.log(`\n🔪 Created ${allChunks.length} chunks total`);

  // 2. Generate embeddings in batches (OpenAI supports up to 2048 inputs)
  const BATCH_SIZE = 100;
  const textInputs = allChunks.map((c) => c.text);
  const allEmbeddings: number[][] = [];

  for (let i = 0; i < textInputs.length; i += BATCH_SIZE) {
    const batch = textInputs.slice(i, i + BATCH_SIZE);
    console.log(
      `  🧠 Embedding batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(textInputs.length / BATCH_SIZE)} (${batch.length} chunks)...`,
    );

    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: batch,
      dimensions: EMBEDDING_DIMENSION,
    });

    for (const item of response.data) {
      allEmbeddings.push(item.embedding);
    }
  }

  // 3. Combine chunks with embeddings
  const indexedChunks: DocumentChunk[] = allChunks.map((chunk, i) => ({
    ...chunk,
    embedding: allEmbeddings[i],
  }));

  // 4. Write embeddings index
  const index: EmbeddingsIndex = {
    model: EMBEDDING_MODEL,
    dimension: EMBEDDING_DIMENSION,
    generatedAt: new Date().toISOString(),
    chunks: indexedChunks,
  };

  const outPath = path.resolve(process.cwd(), EMBEDDINGS_PATH);
  fs.writeFileSync(outPath, JSON.stringify(index), "utf-8");

  const sizeKB = (fs.statSync(outPath).size / 1024).toFixed(1);
  console.log(`\n✅ Wrote ${EMBEDDINGS_PATH} (${sizeKB} KB, ${indexedChunks.length} chunks)`);
}

ingest().catch((err) => {
  console.error("❌ Ingest failed:", err);
  process.exit(1);
});
