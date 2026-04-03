/* ─────────────────────────────────────────────
 *  RAG retrieval — find relevant chunks for a query
 *
 *  Loads the pre-built embeddings index, embeds the
 *  user query, and returns top-K chunks by cosine
 *  similarity.
 * ───────────────────────────────────────────── */

import fs from "node:fs";
import path from "node:path";
import OpenAI from "openai";
import {
  EMBEDDING_MODEL,
  EMBEDDING_DIMENSION,
  TOP_K,
  MIN_SIMILARITY,
  EMBEDDINGS_PATH,
} from "./config";
import type { EmbeddingsIndex, RetrievalResult, DocumentChunk } from "./types";

/* ── singleton cache ────────────────────────── */

let cachedIndex: EmbeddingsIndex | null = null;

function loadIndex(): EmbeddingsIndex {
  if (cachedIndex) return cachedIndex;

  const filePath = path.resolve(process.cwd(), EMBEDDINGS_PATH);
  if (!fs.existsSync(filePath)) {
    throw new Error(
      `RAG embeddings not found at ${EMBEDDINGS_PATH}. Run "npm run ingest" first.`,
    );
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  cachedIndex = JSON.parse(raw) as EmbeddingsIndex;
  return cachedIndex;
}

/** Clear the cached index (useful for tests or hot-reload) */
export function clearIndexCache(): void {
  cachedIndex = null;
}

/* ── cosine similarity ──────────────────────── */

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

/* ── main retrieve function ─────────────────── */

export interface RetrieveOptions {
  /** Override number of results (default: TOP_K from config) */
  topK?: number;
  /** Override minimum similarity (default: MIN_SIMILARITY from config) */
  minSimilarity?: number;
  /** Filter chunks to only these flow IDs (checks document metadata) */
  flowId?: string;
}

/**
 * Retrieve the most relevant knowledge chunks for a query.
 *
 * @param query - The user's question or message
 * @param apiKey - OpenAI API key for embedding the query
 * @param options - Optional overrides
 * @returns Array of RetrievalResult sorted by descending similarity
 */
export async function retrieve(
  query: string,
  apiKey: string,
  options: RetrieveOptions = {},
): Promise<RetrievalResult[]> {
  const { topK = TOP_K, minSimilarity = MIN_SIMILARITY, flowId } = options;

  const openai = new OpenAI({ apiKey });

  // 1. Embed the query
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: query,
    dimensions: EMBEDDING_DIMENSION,
  });

  const queryEmbedding = response.data[0].embedding;

  // 2. Load index and score all chunks
  const index = loadIndex();
  let chunks: DocumentChunk[] = index.chunks;

  // 3. Optionally filter by flowId
  // We need document metadata to know which flows a document belongs to.
  // For now, we embed flowId info into document IDs. A more robust approach
  // would load metadata.json, but for simplicity we'll skip flow filtering
  // if there's no flowId, and use documentId prefix matching if there is.
  // The metadata.json approach can be added later if needed.
  if (flowId) {
    // Load metadata to get flow associations
    const metaPath = path.resolve(process.cwd(), "knowledge/metadata.json");
    if (fs.existsSync(metaPath)) {
      const metaRaw = fs.readFileSync(metaPath, "utf-8");
      const meta = JSON.parse(metaRaw) as {
        documents: Array<{ id: string; flows: string[] }>;
      };
      const relevantDocIds = new Set(
        meta.documents
          .filter((d) => d.flows.includes(flowId) || d.flows.includes("*"))
          .map((d) => d.id),
      );
      if (relevantDocIds.size > 0) {
        chunks = chunks.filter((c) => relevantDocIds.has(c.documentId));
      }
      // If no docs matched this flow, fall back to searching all chunks
    }
  }

  // 4. Compute cosine similarity
  const scored = chunks.map((chunk) => ({
    chunk,
    score: cosineSimilarity(queryEmbedding, chunk.embedding),
  }));

  // 5. Sort by score descending, filter by minSimilarity, take topK
  const results: RetrievalResult[] = scored
    .filter((s) => s.score >= minSimilarity)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((s) => ({
      text: s.chunk.text,
      section: s.chunk.section,
      documentId: s.chunk.documentId,
      source: s.chunk.source,
      score: s.score,
    }));

  return results;
}
