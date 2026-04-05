import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Prijava",
  description: "Prijavi se na BezPapira — sačuvaj liste koraka i pristupi sa bilo kog uređaja.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
