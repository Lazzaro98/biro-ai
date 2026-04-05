"use client";

import { useEffect, useState, useRef } from "react";

/* ── Types ── */
interface Stats {
  visitors: number;
  checklists: number;
  chats: number;
}

const STAT_CONFIG = [
  { key: "visitors" as const, label: "posetilaca", icon: "👥" },
  { key: "checklists" as const, label: "listi koraka", icon: "✅" },
  { key: "chats" as const, label: "razgovora", icon: "💬" },
];

/** Animate a number from 0 to target */
function useCountUp(target: number, durationMs = 1800) {
  const [current, setCurrent] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started || target <= 0) return;
    const start = performance.now();
    let raf: number;

    function tick() {
      const elapsed = performance.now() - start;
      const progress = Math.min(elapsed / durationMs, 1);
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

function StatItem({ label, icon, value }: { label: string; icon: string; value: number }) {
  const counter = useCountUp(value);

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

    const el = document.getElementById(`stat-${label}`);
    if (el) observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      id={`stat-${label}`}
      className="flex flex-col items-center gap-1 px-3 py-2"
    >
      <span className="text-lg" aria-hidden="true">
        {icon}
      </span>
      <span className="text-xl font-bold text-foreground tabular-nums">
        {value > 0 ? counter.current.toLocaleString("sr") : "—"}
      </span>
      <span className="text-xs text-muted-dark">{label}</span>
    </div>
  );
}

export default function SocialProof() {
  const [stats, setStats] = useState<Stats | null>(null);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    fetch("/api/stats")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && typeof data.visitors === "number") setStats(data);
      })
      .catch(() => {});
  }, []);

  // Don't render until we have real data
  if (!stats) return null;
  // Don't show if all stats are 0 (fresh install)
  if (stats.visitors === 0 && stats.checklists === 0 && stats.chats === 0) return null;

  return (
    <section
      className="flex items-center justify-center gap-4 sm:gap-8 rounded-2xl p-4
                 glass-card border border-border/50"
      aria-label="Statistika korišćenja"
    >
      {STAT_CONFIG.map((cfg) => (
        <StatItem key={cfg.key} label={cfg.label} icon={cfg.icon} value={stats[cfg.key]} />
      ))}
    </section>
  );
}
