"use client";

import { useEffect, useRef, useCallback, useState } from "react";

/* ── Themed SVG icons (bureaucracy / legal) ── */
const ICONS = {
  paragraph: (
    <path d="M12 2v20M8 2h7a4 4 0 0 1 0 8H8" strokeLinecap="round" strokeLinejoin="round" />
  ),
  document: (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="14 2 14 8 20 8" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="8" y1="13" x2="16" y2="13" strokeLinecap="round" />
      <line x1="8" y1="17" x2="13" y2="17" strokeLinecap="round" />
    </>
  ),
  stamp: (
    <>
      <rect x="3" y="17" width="18" height="4" rx="1" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 17V13a4 4 0 0 1 8 0v4" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="12" y1="9" x2="12" y2="5" strokeLinecap="round" />
      <circle cx="12" cy="4" r="1" />
    </>
  ),
  pen: (
    <>
      <path d="M12 20h9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  scale: (
    <>
      <path d="M12 3v18" strokeLinecap="round" />
      <path d="M4 7h16" strokeLinecap="round" />
      <path d="M4 7l2 8h0a3 3 0 0 0 6 0h0l-2-8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 7l2 8h0a3 3 0 0 0 6 0h0l-2-8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="3" r="1" />
    </>
  ),
  clipboard: (
    <>
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 14l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  gavel: (
    <>
      <path d="M14.5 3.5l6 6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11.5 6.5l6 6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 10L4 20" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 22h8" strokeLinecap="round" />
    </>
  ),
};

type IconKey = keyof typeof ICONS;

type FloatingItem = {
  id: number;
  icon: IconKey;
  baseX: number;
  baseY: number;
  size: number;
  speed: number;
  delay: number;
  opacity: number;
  depth: number;
};

const REPEL_RADIUS = 160;
const REPEL_STRENGTH = 70;

/* 24 items spread across the viewport */
const ITEMS: FloatingItem[] = [
  { id: 0,  icon: "paragraph",  baseX: 5,   baseY: 8,   size: 42, speed: 22, delay: 0,    opacity: 0.22, depth: 0.35 },
  { id: 1,  icon: "document",   baseX: 88,  baseY: 5,   size: 38, speed: 28, delay: -5,   opacity: 0.18, depth: 0.2 },
  { id: 2,  icon: "stamp",      baseX: 78,  baseY: 60,  size: 40, speed: 18, delay: -8,   opacity: 0.20, depth: 0.3 },
  { id: 3,  icon: "pen",        baseX: 12,  baseY: 70,  size: 34, speed: 25, delay: -12,  opacity: 0.18, depth: 0.15 },
  { id: 4,  icon: "scale",      baseX: 48,  baseY: 15,  size: 46, speed: 30, delay: -3,   opacity: 0.16, depth: 0.4 },
  { id: 5,  icon: "clipboard",  baseX: 28,  baseY: 88,  size: 38, speed: 20, delay: -7,   opacity: 0.20, depth: 0.25 },
  { id: 6,  icon: "gavel",      baseX: 94,  baseY: 38,  size: 34, speed: 24, delay: -15,  opacity: 0.16, depth: 0.2 },
  { id: 7,  icon: "paragraph",  baseX: 62,  baseY: 48,  size: 30, speed: 35, delay: -10,  opacity: 0.14, depth: 0.15 },
  { id: 8,  icon: "document",   baseX: 38,  baseY: 32,  size: 36, speed: 27, delay: -18,  opacity: 0.16, depth: 0.3 },
  { id: 9,  icon: "stamp",      baseX: 18,  baseY: 42,  size: 28, speed: 32, delay: -2,   opacity: 0.14, depth: 0.1 },
  { id: 10, icon: "pen",        baseX: 72,  baseY: 78,  size: 32, speed: 19, delay: -14,  opacity: 0.18, depth: 0.35 },
  { id: 11, icon: "scale",      baseX: 3,   baseY: 28,  size: 38, speed: 26, delay: -6,   opacity: 0.16, depth: 0.25 },
  { id: 12, icon: "clipboard",  baseX: 55,  baseY: 72,  size: 30, speed: 33, delay: -9,   opacity: 0.14, depth: 0.2 },
  { id: 13, icon: "gavel",      baseX: 33,  baseY: 6,   size: 34, speed: 21, delay: -16,  opacity: 0.18, depth: 0.3 },
  { id: 14, icon: "document",   baseX: 82,  baseY: 85,  size: 32, speed: 23, delay: -4,   opacity: 0.15, depth: 0.2 },
  { id: 15, icon: "paragraph",  baseX: 45,  baseY: 55,  size: 28, speed: 29, delay: -11,  opacity: 0.13, depth: 0.15 },
  { id: 16, icon: "stamp",      baseX: 8,   baseY: 92,  size: 36, speed: 17, delay: -1,   opacity: 0.17, depth: 0.3 },
  { id: 17, icon: "pen",        baseX: 92,  baseY: 18,  size: 30, speed: 31, delay: -13,  opacity: 0.15, depth: 0.25 },
  { id: 18, icon: "scale",      baseX: 22,  baseY: 58,  size: 34, speed: 22, delay: -17,  opacity: 0.14, depth: 0.2 },
  { id: 19, icon: "clipboard",  baseX: 68,  baseY: 28,  size: 32, speed: 26, delay: -8,   opacity: 0.16, depth: 0.35 },
  { id: 20, icon: "gavel",      baseX: 52,  baseY: 92,  size: 30, speed: 34, delay: -6,   opacity: 0.13, depth: 0.15 },
  { id: 21, icon: "document",   baseX: 15,  baseY: 18,  size: 26, speed: 28, delay: -19,  opacity: 0.14, depth: 0.1 },
  { id: 22, icon: "stamp",      baseX: 85,  baseY: 50,  size: 28, speed: 20, delay: -3,   opacity: 0.15, depth: 0.25 },
  { id: 23, icon: "pen",        baseX: 42,  baseY: 78,  size: 32, speed: 25, delay: -10,  opacity: 0.16, depth: 0.3 },
];

export default function BackgroundScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const smoothMouseRef = useRef({ x: -1000, y: -1000 });
  const iconRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rafRef = useRef<number>(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // On mobile, show only 8 items and skip the animation loop
  const visibleItems = isMobile ? ITEMS.slice(0, 8) : ITEMS;

  const handleMouseMove = useCallback((e: MouseEvent) => {
    mouseRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  /* Pure-DOM animation loop — no React state, no re-renders */
  useEffect(() => {
    // Skip animation loop on mobile to save battery/CPU
    if (isMobile) return;

    const spotEl = document.getElementById("bg-spotlight");

    const animate = () => {
      // Smooth lerp
      smoothMouseRef.current.x += (mouseRef.current.x - smoothMouseRef.current.x) * 0.06;
      smoothMouseRef.current.y += (mouseRef.current.y - smoothMouseRef.current.y) * 0.06;

      const mx = smoothMouseRef.current.x;
      const my = smoothMouseRef.current.y;
      const ww = window.innerWidth;
      const wh = window.innerHeight;

      // Spotlight follows cursor
      if (spotEl) {
        const isDark = document.documentElement.classList.contains("dark");
        const c1 = isDark ? "rgba(99,102,241,0.15)" : "rgba(99,102,241,0.10)";
        const c2 = isDark ? "rgba(168,85,247,0.06)" : "rgba(168,85,247,0.04)";
        spotEl.style.background = `radial-gradient(600px circle at ${mx}px ${my}px, ${c1}, ${c2} 40%, transparent 70%)`;      }

      // Update each icon: parallax + repel
      for (let i = 0; i < ITEMS.length; i++) {
        const el = iconRefs.current[i];
        if (!el) continue;
        const item = ITEMS[i];

        // Base position (px)
        const bx = (item.baseX / 100) * ww;
        const by = (item.baseY / 100) * wh;

        // Parallax
        const parX = ((mx / ww) - 0.5) * item.depth * -50;
        const parY = ((my / wh) - 0.5) * item.depth * -50;

        // Repel from cursor
        const dx = (bx + parX) - mx;
        const dy = (by + parY) - my;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let repelX = 0;
        let repelY = 0;
        let scale = 1;
        let extraOpacity = 0;

        if (dist < REPEL_RADIUS && dist > 0) {
          const force = 1 - dist / REPEL_RADIUS;
          const angle = Math.atan2(dy, dx);
          repelX = Math.cos(angle) * force * REPEL_STRENGTH;
          repelY = Math.sin(angle) * force * REPEL_STRENGTH;
          scale = 1 + force * 0.35;     // grow when near
          extraOpacity = force * 0.15;   // brighten when near
        }

        const tx = parX + repelX;
        const ty = parY + repelY;

        el.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;

        // Update opacity on the SVG inside
        const svg = el.firstElementChild as SVGElement;
        if (svg) {
          svg.style.opacity = String(item.opacity + extraOpacity);
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isMobile]);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Mouse-following spotlight */}
      <div id="bg-spotlight" className="absolute inset-0" />

      {/* Dot grid */}
      <div className="absolute inset-0 bg-dot-grid" />

      {/* Floating themed icons */}
      {visibleItems.map((item, i) => (
        <div
          key={item.id}
          ref={(el) => { iconRefs.current[i] = el; }}
          className="absolute"
          style={{
            left: `${item.baseX}%`,
            top: `${item.baseY}%`,
            willChange: "transform",
          }}
        >
          <svg
            width={item.size}
            height={item.size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.2}
            className="text-primary"
            style={{
              opacity: item.opacity,
              animation: `icon-float ${item.speed}s ease-in-out ${item.delay}s infinite`,
              transition: "opacity 0.2s ease-out",
            }}
          >
            {ICONS[item.icon]}
          </svg>
        </div>
      ))}

      {/* Orbs for color depth — hidden on mobile for perf */}
      {!isMobile && (
        <>
          <div className="bg-orb bg-orb--1" style={{ top: "-50px", right: "10%" }} />
          <div className="bg-orb bg-orb--2" style={{ top: "50%", left: "-100px" }} />
          <div className="bg-orb bg-orb--3" style={{ bottom: "10%", right: "20%" }} />
        </>
      )}
    </div>
  );
}
