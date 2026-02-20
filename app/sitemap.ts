import type { MetadataRoute } from "next";
import { FLOW_IDS } from "./lib/flows";

const BASE = "https://biro-ai.rs";

export default function sitemap(): MetadataRoute.Sitemap {
  const flowPages = FLOW_IDS.flatMap((id) => [
    {
      url: `${BASE}/start/${id}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      url: `${BASE}/chat/${id}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
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
  ];
}
