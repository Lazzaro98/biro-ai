"use client";

import { useEffect } from "react";
import { track } from "../../lib/analytics";

export default function ChatError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    track("error.page", { message: error.message, digest: error.digest });
  }, [error]);

  return (
    <div className="flex min-h-dvh items-center justify-center p-8">
      <div className="max-w-md rounded-2xl border border-border/60 bg-card-bg p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 text-2xl">
          ⚠️
        </div>
        <h2 className="text-lg font-semibold mb-2">Nešto je pošlo naopako</h2>
        <p className="text-sm text-muted-dark mb-6">
          Došlo je do neočekivane greške. Probaj ponovo ili se vrati na početnu.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            type="button"
            onClick={reset}
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white
                       hover:bg-primary-dark active:scale-95 transition-all"
          >
            Probaj ponovo
          </button>
          <a
            href="/"
            className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-muted-dark
                       hover:bg-surface-alt active:scale-95 transition-all inline-flex items-center"
          >
            Početna
          </a>
        </div>
      </div>
    </div>
  );
}
