import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Istorija razgovora",
  description: "Pregledaj sve prethodne razgovore sa BezPapira asistentom.",
  robots: { index: false },
};

export default function IstorijaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
