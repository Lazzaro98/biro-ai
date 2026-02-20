import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chat — Otvaranje firme",
  description:
    "Razgovaraj sa AI asistentom i dobij personalizovanu checklistu za otvaranje firme u Srbiji.",
  openGraph: {
    title: "Chat — Otvaranje firme | Biro AI",
    description:
      "AI vodič kroz korake za registraciju preduzetnika ili DOO u Srbiji.",
  },
  robots: { index: false }, // chat pages are dynamic, no indexing
};

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
