import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Deljena lista koraka | BezPapira",
  description: "Pogledaj deljenu listu koraka za birokratski proces u Srbiji.",
  openGraph: {
    title: "Deljena lista koraka | BezPapira",
    description: "Pogledaj deljenu listu koraka — koraci za birokratski proces u Srbiji.",
  },
};

export default function ShareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
