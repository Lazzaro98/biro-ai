import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Biro AI — Vodič kroz papirologiju",
    short_name: "Biro AI",
    description:
      "AI asistent koji te vodi korak po korak kroz birokratske procese u Srbiji.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#0f0e1a",
    theme_color: "#6366f1",
    categories: ["productivity", "utilities", "business"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    screenshots: [],
  };
}
