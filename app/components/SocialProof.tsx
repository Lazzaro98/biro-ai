"use client";

import { useEffect, useState } from "react";

/* ── Configurable milestones — update as your app grows ── */
const STATS = [
  { label: "korisnika", value: 500, icon: "👥", suffix: "+" },
  { label: "checklisti", value: 1200, icon: "✅", suffix: "+" },
  { label: "razgovora", value: 800, icon: "💬", suffix: "+" },
];

/** Animate a number from 0 to target */
function useCountUp(target: number, durationMs = 1800) {
  const [current, setCurrent] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started) return;
    const start = performance.now();
    let raf: number;

    function tick() {
      const elapsed = performance.now() - start;
      const progress = Math.min(elapsed / durationMs, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(eased * target));
      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      }
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started, target, durationMs]);

  return { current, start: () => setStarted(true) };
}

function StatItem({ stat }: { stat: (typeof STATS)[number] }) {
  const counter = useCountUp(stat.value);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          counter.start();
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );

    const el = document.getElementById(`stat-${stat.label}`);
    if (el) observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      id={`stat-${stat.label}`}
      className="flex flex-col items-center gap-1 px-3 py-2"
    >
      <span className="text-lg" aria-hidden="true">
        {stat.icon}
      </span>
      <span className="text-xl font-bold text-foreground tabular-nums">
        {counter.current.toLocaleString("sr")}
        {stat.suffix}
      </span>
      <span className="text-xs text-muted-dark">{stat.label}</span>
    </div>
  );
}

export default function SocialProof() {
  return (
    <section
      className="flex items-center justify-center gap-4 sm:gap-8 rounded-2xl p-4
                 glass-card border border-border/40"
      aria-label="Statistika korišćenja"
    >
      {STATS.map((stat) => (
        <StatItem key={stat.label} stat={stat} />
      ))}
    </section>
  );
}
