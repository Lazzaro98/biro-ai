import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Moje checkliste",
  description:
    "Pregledaj i upravljaj sačuvanim checklistama za birokratske procese u Srbiji.",
  openGraph: {
    title: "Moje checkliste | Biro AI",
    description: "Sačuvane checkliste za otvaranje firme i druge procese.",
  },
};

export default function ChecklisteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
