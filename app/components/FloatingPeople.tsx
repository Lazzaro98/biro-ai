"use client";

import React from "react";
import Image from "next/image";

/**
 * Organic, asymmetric testimonial cards floating around the landing page.
 * Desktop: 5 full cards at edges. Mobile: 3 smaller, semi-transparent background cards.
 *
 * Photos: Pexels (free licence).
 */

type Testimonial = {
  src: string;
  name: string;
  role: string;
  quote: string;
  /** Desktop CSS inset values */
  desktopStyle: React.CSSProperties;
  /** Mobile CSS inset values — only first 3 used */
  mobileStyle: React.CSSProperties;
  /** Card width class: desktop / mobile */
  width: string;
  mobileWidth: string;
  /** Avatar size */
  avatarSize: number;
  /** Float animation duration (seconds) */
  floatSpeed: number;
  /** Animation delay for entrance */
  enterDelay: number;
  /** Show on mobile? */
  showMobile: boolean;
};

const TESTIMONIALS: Testimonial[] = [
  // ── Row 1 (top) ──
  {
    src: "/mascot.jpg",
    name: "Jelena M.",
    role: "Osnivačica DOO",
    quote: "Sve mi je bilo jasno od prvog koraka — čista ušteda vremena!",
    desktopStyle: { left: 20, top: "12vh", transform: "rotate(-3deg)" },
    mobileStyle: { left: "2%", top: 20, transform: "rotate(-5deg)" },
    width: "w-[210px] xl:w-[240px]",
    mobileWidth: "w-[130px]",
    avatarSize: 44,
    floatSpeed: 7,
    enterDelay: 0.2,
    showMobile: true,
  },
  {
    src: "/person-1.jpg",
    name: "Ana S.",
    role: "Paušalni preduzetnik",
    quote: "Otvorila firmu za 3 dana, bez advokata.",
    desktopStyle: { right: 32, top: "8vh", transform: "rotate(1.5deg)" },
    mobileStyle: { left: "34%", top: 14, transform: "rotate(3deg)" },
    width: "w-[190px] xl:w-[215px]",
    mobileWidth: "w-[125px]",
    avatarSize: 38,
    floatSpeed: 9,
    enterDelay: 0.35,
    showMobile: true,
  },
  {
    src: "/person-2.jpg",
    name: "Marko D.",
    role: "Freelancer",
    quote: "Konačno neko objašnjava paušal ljudskim jezikom.",
    desktopStyle: { left: 50, top: "55vh", transform: "rotate(2deg)" },
    mobileStyle: { right: "2%", top: 30, transform: "rotate(-3deg)" },
    width: "w-[195px] xl:w-[220px]",
    mobileWidth: "w-[120px]",
    avatarSize: 40,
    floatSpeed: 8,
    enterDelay: 0.5,
    showMobile: true,
  },
  {
    src: "/person-3.jpg",
    name: "Ivana P.",
    role: "Vlasnica agencije",
    quote: "Checklista je bila tačno ono što mi je trebalo. Preporučujem!",
    desktopStyle: { right: 16, top: "52vh", transform: "rotate(-2.5deg)" },
    mobileStyle: { left: "18%", top: 62, transform: "rotate(4deg)" },
    width: "w-[220px] xl:w-[250px]",
    mobileWidth: "w-[125px]",
    avatarSize: 46,
    floatSpeed: 6,
    enterDelay: 0.65,
    showMobile: true,
  },
  // ── Row 2 (below) ──
  {
    src: "/person-4.jpg",
    name: "Stefan R.",
    role: "IT preduzetnik",
    quote: "Mislio sam da moram da platim advokata. Hvala, BezPapira!",
    desktopStyle: { left: 36, top: "82vh", transform: "rotate(-1deg)" },
    mobileStyle: { left: "5%", top: 76, transform: "rotate(-2.5deg)" },
    width: "w-[180px] xl:w-[205px]",
    mobileWidth: "w-[120px]",
    avatarSize: 36,
    floatSpeed: 10,
    enterDelay: 0.8,
    showMobile: true,
  },
  {
    src: "/mascot.jpg",
    name: "Milica T.",
    role: "Dizajnerka",
    quote: "Brzo i jednostavno!",
    desktopStyle: { left: 8, top: "40vh", transform: "rotate(1deg)" },
    mobileStyle: { left: "42%", top: 70, transform: "rotate(-4.5deg)" },
    width: "w-[190px] xl:w-[210px]",
    mobileWidth: "w-[130px]",
    avatarSize: 38,
    floatSpeed: 8,
    enterDelay: 0.95,
    showMobile: true,
  },
  {
    src: "/person-1.jpg",
    name: "Nikola V.",
    role: "E-commerce",
    quote: "Preporuka svima koji kreću!",
    desktopStyle: { right: 10, top: "75vh", transform: "rotate(-1.5deg)" },
    mobileStyle: { right: "3%", top: 80, transform: "rotate(3deg)" },
    width: "w-[185px] xl:w-[210px]",
    mobileWidth: "w-[125px]",
    avatarSize: 40,
    floatSpeed: 9,
    enterDelay: 1.1,
    showMobile: true,
  },
];

function TestimonialCard({
  t,
  i,
  mobile,
}: {
  t: Testimonial;
  i: number;
  mobile: boolean;
}) {
  const avatarSz = mobile ? 28 : t.avatarSize;

  if (mobile) {
    /* ── Mobile: compact card with avatar, name, quote, stars ── */
    return (
      <div
        className={`absolute pointer-events-none block lg:hidden ${t.mobileWidth} z-[1]`}
        style={{
          ...t.mobileStyle,
          animation: `fade-in-up 0.5s ease-out ${t.enterDelay}s both`,
        }}
      >
        <div
          className="rounded-xl bg-card-bg backdrop-blur-sm border border-card-border
                     shadow-md shadow-primary/[0.06] p-2.5"
          style={{
            animation: `icon-float ${t.floatSpeed}s ease-in-out ${-i * 2}s infinite`,
          }}
        >
          <div className="flex items-center gap-1.5 mb-1">
            <div
              className="relative shrink-0 rounded-full overflow-hidden ring-1.5 ring-primary/15"
              style={{ width: avatarSz, height: avatarSz }}
            >
              <Image
                src={t.src}
                alt={t.name}
                fill
                className="object-cover object-top"
                sizes={`${avatarSz}px`}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-bold text-foreground/80 leading-tight truncate">
                {t.name}
              </p>
              <div className="flex gap-px mt-0.5">
                {[...Array(5)].map((_, j) => (
                  <svg key={j} className="h-1.5 w-1.5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          </div>
          <p className="text-[8px] leading-[1.4] text-muted-dark/70 italic line-clamp-2">
            &ldquo;{t.quote}&rdquo;
          </p>
        </div>
      </div>
    );
  }

  /* ── Desktop: full card ── */
  return (
    <div
      className={`absolute pointer-events-none hidden lg:block ${t.width} z-[1]`}
      style={{
        ...t.desktopStyle,
        animation: `fade-in-up 0.7s ease-out ${t.enterDelay}s both`,
      }}
    >
      <div
        className="rounded-2xl border border-card-border shadow-lg shadow-primary/[0.06] pointer-events-auto transition-all duration-300 cursor-default
                   bg-card-bg-solid backdrop-blur-md p-4 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1"
        style={{
          animation: `icon-float ${t.floatSpeed}s ease-in-out ${-i * 1.7}s infinite`,
        }}
      >
        {/* Header: avatar + info */}
        <div className="flex items-center gap-2.5 mb-2">
          <div
            className="relative shrink-0 rounded-full overflow-hidden ring-2 ring-primary/20 ring-offset-1 ring-offset-surface"
            style={{ width: t.avatarSize, height: t.avatarSize }}
          >
            <Image
              src={t.src}
              alt={t.name}
              fill
              className="object-cover object-top"
              sizes={`${t.avatarSize}px`}
            />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-foreground leading-tight truncate text-[12px]">
              {t.name}
            </p>
            <p className="text-primary/70 font-semibold leading-tight text-[10px]">
              {t.role}
            </p>
          </div>
        </div>

        {/* Quote */}
        <p className="leading-[1.45] text-muted-dark/90 italic text-[11px]">
          &ldquo;{t.quote}&rdquo;
        </p>

        {/* Stars */}
        <div className="flex gap-0.5 mt-1.5">
          {[...Array(5)].map((_, j) => (
            <svg
              key={j}
              className="text-amber-400 h-2.5 w-2.5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function FloatingPeople() {
  return (
    <div aria-hidden="true">
      {TESTIMONIALS.map((t, i) => (
        <React.Fragment key={t.name}>
          {/* Desktop: full card */}
          <TestimonialCard t={t} i={i} mobile={false} />
          {/* Mobile: compact card clustered at top */}
          {t.showMobile && <TestimonialCard t={t} i={i} mobile={true} />}
        </React.Fragment>
      ))}
    </div>
  );
}
