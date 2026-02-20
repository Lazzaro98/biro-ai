import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Deljena checklista | Biro AI",
  description: "Pogledaj deljenu cheklistu za birokratski proces u Srbiji.",
  openGraph: {
    title: "Deljena checklista | Biro AI",
    description: "Pogledaj deljenu cheklistu — koraci za birokratski proces u Srbiji.",
  },
};

export default function ShareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
