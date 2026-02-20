/**
 * Lightweight client-side analytics.
 *
 * Fires events to /api/analytics (fire-and-forget).
 * Falls back silently on error — never blocks the UI.
 *
 * Usage:
 *   import { track } from "@/app/lib/analytics";
 *   track("chat.started");
 *   track("checklist.saved", { step: 4 });
 */

export function track(event: string, data?: Record<string, unknown>) {
  try {
    const payload = {
      event,
      ts: new Date().toISOString(),
      url: window.location.pathname,
      ...data,
    };

    // Use sendBeacon for reliability (survives page close)
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/analytics",
        new Blob([JSON.stringify(payload)], { type: "application/json" }),
      );
    } else {
      fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    // Never throw — analytics must not break the app
  }
}
