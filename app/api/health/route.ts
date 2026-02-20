import { env } from "@/app/lib/env";

/**
 * GET /api/health
 *
 * Returns 200 with basic health info.
 * Used by Docker HEALTHCHECK, load balancers, and uptime monitors.
 */
export async function GET() {
  const now = new Date().toISOString();

  // Light-touch check: verify the OpenAI key is configured (not that it works)
  const openaiConfigured = !!env.OPENAI_API_KEY;

  const payload = {
    status: "ok",
    timestamp: now,
    version: process.env.npm_package_version || "0.1.0",
    checks: {
      openai: openaiConfigured ? "configured" : "missing",
    },
  };

  const allHealthy = openaiConfigured;

  return Response.json(payload, {
    status: allHealthy ? 200 : 503,
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}
