/**
 * GET /api/stats
 *
 * Returns public analytics counters (visitors, checklists, chats).
 * Used by the SocialProof component on the landing page.
 * Cached for 60 seconds to avoid hammering Redis on every page load.
 */

import { getStats } from "@/app/lib/stats";

export async function GET() {
  const stats = await getStats();

  return Response.json(stats, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
    },
  });
}
