/**
 * Environment variable validation.
 * Import at app startup to fail fast if required env vars are missing.
 *
 * Usage (in layout.tsx or route.ts):
 *   import "@/app/lib/env";
 */

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `❌ Missing required environment variable: ${name}\n` +
        `   Add it to .env.local (dev) or your hosting provider's env config (prod).`,
    );
  }
  return value;
}

function optional(name: string, fallback: string): string {
  return process.env[name] || fallback;
}

/** Validated environment variables — import this object instead of using process.env directly. */
export const env = {
  /** OpenAI API key for GPT-4o-mini (fallback when Perplexity is not configured) */
  OPENAI_API_KEY: required("OPENAI_API_KEY"),

  /** Perplexity API key — enables web-search-grounded answers with real citations */
  PERPLEXITY_API_KEY: optional("PERPLEXITY_API_KEY", ""),

  /** Node environment */
  NODE_ENV: optional("NODE_ENV", "development"),

  /** Base URL for metadata / sitemap (no trailing slash) */
  NEXT_PUBLIC_BASE_URL: optional("NEXT_PUBLIC_BASE_URL", "https://biro-ai.vercel.app"),

  /** Upstash Redis — persistent analytics counters */
  UPSTASH_REDIS_REST_URL: optional("UPSTASH_REDIS_REST_URL", ""),
  UPSTASH_REDIS_REST_TOKEN: optional("UPSTASH_REDIS_REST_TOKEN", ""),

  /** Auth.js / NextAuth — authentication */
  AUTH_SECRET: optional("AUTH_SECRET", ""),
  GOOGLE_CLIENT_ID: optional("GOOGLE_CLIENT_ID", ""),
  GOOGLE_CLIENT_SECRET: optional("GOOGLE_CLIENT_SECRET", ""),
  RESEND_API_KEY: optional("RESEND_API_KEY", ""),
  EMAIL_FROM: optional("EMAIL_FROM", "BezPapira <noreply@bezpapira.rs>"),
} as const;
