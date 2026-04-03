/* ─────────────────────────────────────────────
 *  RAG configuration constants
 * ───────────────────────────────────────────── */

/** OpenAI embedding model to use */
export const EMBEDDING_MODEL = "text-embedding-3-small";

/** Dimension of the embedding vectors (text-embedding-3-small default) */
export const EMBEDDING_DIMENSION = 1536;

/** How many top chunks to retrieve per query */
export const TOP_K = 5;

/** Minimum cosine similarity score to include a chunk in results */
export const MIN_SIMILARITY = 0.3;

/** Maximum chunk size in characters (soft limit — we split by sections first) */
export const MAX_CHUNK_CHARS = 1500;

/** Overlap in characters when a section exceeds MAX_CHUNK_CHARS */
export const CHUNK_OVERLAP_CHARS = 200;

/* ── File paths (relative to project root) ── */

/** Directory containing markdown source documents */
export const DOCUMENTS_DIR = "knowledge/documents";

/** Metadata registry of all documents */
export const METADATA_PATH = "knowledge/metadata.json";

/** Generated embeddings index */
export const EMBEDDINGS_PATH = "knowledge/embeddings.json";
