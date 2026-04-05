import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Moje liste koraka",
  description:
    "Pregledaj i upravljaj sačuvanim listama koraka za birokratske procese u Srbiji.",
  openGraph: {
    title: "Moje liste koraka | BezPapira",
    description: "Sačuvane liste koraka za otvaranje firme i druge procese.",
  },
};

export default function ChecklisteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
