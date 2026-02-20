import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import dynamic from "next/dynamic";

// Lazy-load decorative/non-critical components
const BackgroundScene = dynamic(
  () => import("./components/BackgroundScene"),
);
const PWAInstall = dynamic(
  () => import("./components/PWAInstall"),
);

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
    default: "Biro AI — Vodič kroz papirologiju",
    template: "%s | Biro AI",
  },
  description:
    "AI asistent koji te vodi korak po korak kroz birokratske procese u Srbiji. Otvaranje firme, checkliste i više.",
  metadataBase: new URL("https://biro-ai.rs"),
  keywords: [
    "otvaranje firme",
    "Srbija",
    "papiologija",
    "birokracija",
    "AI asistent",
    "checklista",
    "preduzetnik",
    "DOO",
    "APR",
  ],
  authors: [{ name: "Biro AI" }],
  creator: "Biro AI",
  openGraph: {
    type: "website",
    locale: "sr_RS",
    siteName: "Biro AI",
    title: "Biro AI — Vodič kroz papirologiju",
    description:
      "AI asistent koji te vodi korak po korak kroz birokratske procese u Srbiji.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Biro AI — Vodič kroz papirologiju",
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
  // Inline script to apply dark class before paint (prevents FOUC)
  const themeScript = `(function(){try{var t=localStorage.getItem('biro-ai:theme');var d=t==='dark'||(t!=='light'&&matchMedia('(prefers-color-scheme:dark)').matches);if(d)document.documentElement.classList.add('dark')}catch(e){}})()`;

  return (
    <html lang="sr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased text-foreground`}
      >
        {/* Skip to main content — a11y */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100]
                     focus:rounded-xl focus:bg-primary focus:px-4 focus:py-2 focus:text-white focus:text-sm focus:font-semibold
                     focus:shadow-lg focus:outline-none"
        >
          Preskoči na sadržaj
        </a>

        {/* Interactive background */}
        <BackgroundScene />
        <div id="main-content" className="relative z-10" role="main">
          {children}
        </div>
        {/* PWA install prompt */}
        <PWAInstall />
      </body>
    </html>
  );
}
