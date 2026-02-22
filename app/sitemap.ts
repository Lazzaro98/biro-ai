import type { MetadataRoute } from "next";
import { FLOW_IDS } from "./lib/flows";

const BASE = process.env.NEXT_PUBLIC_BASE_URL || "https://biro-ai.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const flowPages = FLOW_IDS.flatMap((id) => [
    {
      url: `${BASE}/chat/${id}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
  ]);

  return [
    {
      url: BASE,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...flowPages,
    {
      url: `${BASE}/checkliste`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE}/link`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];
}
