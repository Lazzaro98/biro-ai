import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BezPapira — Linkovi",
  description:
    "Svi korisni linkovi BezPapira aplikacije na jednom mestu. AI asistent za birokratiju u Srbiji.",
  openGraph: {
    title: "BezPapira — Linkovi",
    description:
      "AI asistent koji te vodi korak po korak kroz birokratske procese u Srbiji.",
  },
};

export default function LinkLayout({ children }: { children: React.ReactNode }) {
  return children;
}
