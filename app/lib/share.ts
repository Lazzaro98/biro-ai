import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string";

/** Data encoded in a share link */
export interface SharedChecklist {
  /** Flow title (e.g. "Otvaranje firme") */
  title: string;
  /** Flow ID */
  flowId?: string;
  /** User params (grad, tip, etc.) */
  params: Record<string, string | undefined>;
  /** Raw markdown with `- [ ]` items */
  markdown: string;
  /** ISO date when originally created */
  date: string;
}

/**
 * Encode a checklist into a URL-safe compressed string.
 * Typical checklist (1-3KB) compresses to ~500-1000 chars.
 */
export function encodeChecklist(data: SharedChecklist): string {
  const json = JSON.stringify(data);
  return compressToEncodedURIComponent(json);
}

/**
 * Decode a compressed share string back to checklist data.
 * Returns null on invalid/corrupt data.
 */
export function decodeChecklist(encoded: string): SharedChecklist | null {
  try {
    const json = decompressFromEncodedURIComponent(encoded);
    if (!json) return null;
    const data = JSON.parse(json);
    // Basic validation
    if (!data.markdown || typeof data.markdown !== "string") return null;
    return data as SharedChecklist;
  } catch {
    return null;
  }
}

/**
 * Build a full share URL for a checklist.
 */
export function buildShareUrl(data: SharedChecklist): string {
  const base = typeof window !== "undefined"
    ? window.location.origin
    : (process.env.NEXT_PUBLIC_BASE_URL || "https://biro-ai.vercel.app");
  const encoded = encodeChecklist(data);
  return `${base}/share?d=${encoded}`;
}
