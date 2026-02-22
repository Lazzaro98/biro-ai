"use client";

import { useState, useCallback } from "react";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email.trim()) return;

      setStatus("loading");
      try {
        const res = await fetch("/api/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim() }),
        });
        const data = await res.json();

        if (res.ok) {
          setStatus("success");
          setMessage(data.message || "Hvala na prijavi!");
          setEmail("");
        } else {
          setStatus("error");
          setMessage(data.error || "Nešto nije u redu.");
        }
      } catch {
        setStatus("error");
        setMessage("Nema konekcije. Pokušaj ponovo.");
      }

      // Reset after 5s
      setTimeout(() => {
        setStatus((s) => (s === "loading" ? s : "idle"));
        setMessage("");
      }, 5000);
    },
    [email],
  );

  return (
    <section className="rounded-2xl border border-border/40 bg-surface/60 dark:bg-surface/80 backdrop-blur-sm p-5">
      <div className="text-center mb-3">
        <span className="text-xl" aria-hidden="true">📬</span>
        <h2 className="text-sm font-semibold text-foreground mt-1">
          Budi u toku
        </h2>
        <p className="text-xs text-muted-dark mt-0.5">
          Prijavi se za obaveštenja o novim vodičima i alatima.
        </p>
      </div>

      {status === "success" ? (
        <div className="flex items-center justify-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 font-medium py-2">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          {message}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tvoj@email.com"
            required
            className="flex-1 min-w-0 rounded-xl border border-border/60 bg-background px-3 py-2 text-sm text-foreground
                       placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50
                       transition-all"
            disabled={status === "loading"}
          />
          <button
            type="submit"
            disabled={status === "loading" || !email.trim()}
            className="shrink-0 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white
                       hover:bg-primary-dark active:scale-95 transition-all
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === "loading" ? (
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              "Prijavi se"
            )}
          </button>
        </form>
      )}

      {status === "error" && message && (
        <p className="text-xs text-red-500 mt-2 text-center">{message}</p>
      )}

      <p className="text-[10px] text-muted mt-2 text-center">
        Bez spama. Otkazivanje u svakom trenutku.
      </p>
    </section>
  );
}
