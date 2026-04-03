/* ─────────────────────────────────────────────
 *  RAG types — Knowledge base & retrieval
 * ───────────────────────────────────────────── */

/** A source document in the knowledge base */
export interface KnowledgeDocument {
  /** Unique slug, matches the filename without extension (e.g. "apr-registracija-pr") */
  id: string;

  /** Human-readable title */
  title: string;

  /** Which flow(s) this document is relevant to. Use "*" for all flows. */
  flows: string[];

  /** Where this document came from */
  source: DocumentSource;

  /** Raw markdown content (loaded from file) */
  content: string;
}

/** Provenance metadata for a document */
export interface DocumentSource {
  /** Name of the institution (e.g. "Agencija za privredne registre") */
  institution: string;

  /** Official URL where the document was obtained */
  url: string;

  /** Type of official document */
  type: "zakon" | "uredba" | "uputstvo" | "tarifa" | "vodic" | "pravilnik" | "ostalo";

  /** Date the document was published or last updated by the institution (ISO date) */
  publishedDate: string;

  /** Date when we last verified this document is still current (ISO date) */
  verifiedDate: string;

  /** Optional: Službeni glasnik reference (e.g. "Sl. glasnik RS, br. 36/2011") */
  sluzbeniGlasnik?: string;
}

/** A chunk extracted from a document for embedding */
export interface DocumentChunk {
  /** Unique chunk ID: `{documentId}#{chunkIndex}` */
  id: string;

  /** ID of the parent document */
  documentId: string;

  /** The section heading this chunk belongs to (if any) */
  section: string;

  /** The actual text content of this chunk */
  text: string;

  /** Embedding vector (from OpenAI text-embedding-3-small) */
  embedding: number[];

  /** Metadata carried from the parent document for citation */
  source: DocumentSource;
}

/** Stored embeddings file format */
export interface EmbeddingsIndex {
  /** Model used to generate embeddings */
  model: string;

  /** Embedding vector dimension */
  dimension: number;

  /** When the index was last rebuilt */
  generatedAt: string;

  /** All chunks with their embeddings */
  chunks: DocumentChunk[];
}

/** A retrieval result returned to the chat API */
export interface RetrievalResult {
  /** The chunk text */
  text: string;

  /** Section heading */
  section: string;

  /** Source document ID */
  documentId: string;

  /** Source metadata for citation */
  source: DocumentSource;

  /** Cosine similarity score (0–1) */
  score: number;
}

/** Document metadata entry (stored in metadata.json) */
export interface DocumentMeta {
  /** Must match the markdown filename (without .md) */
  id: string;

  /** Human-readable title */
  title: string;

  /** Relevant flow IDs, or ["*"] for all */
  flows: string[];

  /** Source provenance */
  source: DocumentSource;
}

/** Shape of knowledge/metadata.json */
export interface MetadataFile {
  /** Schema version for future migrations */
  version: number;

  /** All registered documents */
  documents: DocumentMeta[];
}
