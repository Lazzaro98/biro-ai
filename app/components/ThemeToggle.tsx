"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "biro-ai:theme";

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  const resolved = theme === "system" ? getSystemTheme() : theme;
  document.documentElement.classList.toggle("dark", resolved === "dark");
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");
  const [mounted, setMounted] = useState(false);

  // Load saved preference
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
      if (saved && ["light", "dark", "system"].includes(saved)) {
        setTheme(saved);
        applyTheme(saved);
      } else {
        applyTheme("system");
      }
    } catch {
      applyTheme("system");
    }
  }, []);

  // Listen for system theme changes when set to "system"
  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme("system");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  function cycle() {
    const order: Theme[] = ["light", "dark", "system"];
    const next = order[(order.indexOf(theme) + 1) % order.length];
    setTheme(next);
    applyTheme(next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch { /* ignore */ }
  }

  // Avoid hydration mismatch — render nothing on server
  if (!mounted) {
    return (
      <button
        type="button"
        className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-surface-alt transition-colors"
        aria-label="Promeni temu"
      >
        <div className="h-4.5 w-4.5" />
      </button>
    );
  }

  const resolved = theme === "system" ? getSystemTheme() : theme;

  return (
    <button
      type="button"
      onClick={cycle}
      className="flex h-9 w-9 items-center justify-center rounded-xl
                 hover:bg-surface-alt transition-colors group"
      aria-label={`Tema: ${theme === "system" ? "sistemska" : theme === "dark" ? "tamna" : "svetla"}. Klikni za promenu.`}
      aria-live="polite"
      title={theme === "system" ? "Sistemska tema" : theme === "dark" ? "Tamna tema" : "Svetla tema"}
    >
      {theme === "system" ? (
        /* Monitor icon for system */
        <svg className="h-4.5 w-4.5 text-muted-dark group-hover:text-foreground transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ) : resolved === "dark" ? (
        /* Moon icon */
        <svg className="h-4.5 w-4.5 text-muted-dark group-hover:text-foreground transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ) : (
        /* Sun icon */
        <svg className="h-4.5 w-4.5 text-muted-dark group-hover:text-foreground transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )}
    </button>
  );
}
