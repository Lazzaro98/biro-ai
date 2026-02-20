import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kalkulator troškova",
  description:
    "Izračunaj okvirne troškove za otvaranje firme, kupovinu nekretnine ili registraciju vozila u Srbiji.",
  keywords: [
    "kalkulator troškova",
    "otvaranje firme cena",
    "registracija vozila cena",
    "porez na prenos nekretnine",
    "APR taksa",
    "Srbija troškovi",
  ],
};

export default function KalkulatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
