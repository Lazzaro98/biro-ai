import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import dynamic from "next/dynamic";
const PWAInstall = dynamic(
  () => import("./components/PWAInstall"),
);
const StorageMigration = dynamic(
  () => import("./components/StorageMigration"),
);
const PageViewTracker = dynamic(
  () => import("./components/PageViewTracker"),
);
import AuthProvider from "./components/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "BezPapira — Vodič kroz papirologiju",
    template: "%s | BezPapira",
  },
  description:
    "AI asistent koji te vodi korak po korak kroz birokratske procese u Srbiji. Otvaranje firme, liste koraka i više.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "https://biro-ai.vercel.app"
  ),
  keywords: [
    "otvaranje firme",
    "Srbija",
    "papiologija",
    "birokracija",
    "AI asistent",
    "lista koraka",
    "preduzetnik",
    "DOO",
    "APR",
  ],
  authors: [{ name: "BezPapira" }],
  creator: "BezPapira",
  openGraph: {
    type: "website",
    locale: "sr_RS",
    siteName: "BezPapira",
    title: "BezPapira — Vodič kroz papirologiju",
    description:
      "AI asistent koji te vodi korak po korak kroz birokratske procese u Srbiji.",
  },
  twitter: {
    card: "summary_large_image",
    title: "BezPapira — Vodič kroz papirologiju",
    description:
      "AI asistent koji te vodi korak po korak kroz birokratske procese u Srbiji.",
  },
  other: {
    "theme-color": "#6366f1",
    "viewport": "width=device-width, initial-scale=1, viewport-fit=cover",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // No dark mode — single theme
  return (
    <html lang="sr">
      <head />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased text-foreground`}
      >
        <AuthProvider>
        {/* Skip to main content — a11y */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100]
                     focus:rounded-xl focus:bg-primary focus:px-4 focus:py-2 focus:text-white focus:text-sm focus:font-semibold
                     focus:shadow-lg focus:outline-none"
        >
          Preskoči na sadržaj
        </a>

        {/* Main content */}
        <div id="main-content" className="relative z-10" role="main">
          {children}
        </div>
        {/* PWA install prompt */}
        <PWAInstall />
        {/* Migrate old localStorage keys */}
        <StorageMigration />
        {/* Track page views for analytics */}
        <PageViewTracker />
        </AuthProvider>
      </body>
    </html>
  );
}
