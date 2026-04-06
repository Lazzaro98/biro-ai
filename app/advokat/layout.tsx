import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Konsultacija sa advokatom",
  description:
    "Povežite se sa advokatom za siguran pravni savet. BezPapira vas povezuje sa proverenim pravnim stručnjacima.",
  openGraph: {
    title: "Konsultacija sa advokatom | BezPapira",
    description:
      "Potreban vam je pravni savet? Povežite se sa advokatom direktno kroz BezPapira.",
  },
};

export default function AdvokatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
