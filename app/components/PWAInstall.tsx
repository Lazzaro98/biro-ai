"use client";

import { useEffect, useState, useCallback } from "react";

/**
 * Handles service-worker registration + PWA install prompt.
 * Renders an install banner when the `beforeinstallprompt` event fires.
 */
export default function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.warn("SW registration failed:", err);
      });
    }

    // Listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Only show if user hasn't dismissed recently
      try {
        const dismissedAt = localStorage.getItem("bezpapira:pwa-dismissed");
        if (dismissedAt && Date.now() - Number(dismissedAt) < 7 * 24 * 60 * 60 * 1000) return;
      } catch { /* ignore */ }
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    setShowBanner(false);
    setDismissed(true);
    try {
      localStorage.setItem("bezpapira:pwa-dismissed", String(Date.now()));
    } catch { /* ignore */ }
  }, []);

  if (!showBanner || dismissed) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md animate-fade-in-up sm:left-auto sm:right-4 sm:w-auto">
      <div className="rounded-2xl glass-card border border-primary/20 shadow-xl shadow-primary/10 p-4 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-lg" aria-hidden="true">
          📲
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">Instaliraj BezPapira</p>
          <p className="text-xs text-muted-dark mt-0.5">Koristi offline, brži pristup</p>
        </div>
        <button
          type="button"
          onClick={handleInstall}
          className="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white
                     hover:bg-primary-dark active:scale-95 transition-all"
        >
          Instaliraj
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          className="shrink-0 flex h-7 w-7 items-center justify-center rounded-lg text-muted hover:text-foreground hover:bg-surface-alt transition-colors"
          aria-label="Zatvori"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
