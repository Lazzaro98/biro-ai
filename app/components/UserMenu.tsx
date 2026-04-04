"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";

export default function UserMenu() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  if (status === "loading") {
    return (
      <div className="h-8 w-8 rounded-full bg-surface-alt animate-pulse" />
    );
  }

  if (!session?.user) {
    return (
      <a
        href="/login"
        className="group relative flex items-center gap-2.5 rounded-full bg-primary/10 pl-2 pr-5 py-2
                   hover:bg-primary/20 hover:shadow-md hover:shadow-primary/10
                   transition-all duration-300 ring-1 ring-primary/20 hover:ring-primary/40"
      >
        {/* Animated avatar placeholder with glow */}
        <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-primary/20">
          <svg className="h-4.5 w-4.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
          {/* Pulse ring */}
          <span className="absolute inset-0 rounded-full animate-ping bg-primary/20" style={{ animationDuration: '2.5s' }} />
        </span>
        <span className="text-sm font-semibold text-primary group-hover:text-primary-dark transition-colors">
          Prijavi se
        </span>
      </a>
    );
  }

  const name = session.user.name ?? session.user.email?.split("@")[0] ?? "User";
  const initials = name.slice(0, 2).toUpperCase();
  const image = session.user.image;

  return (
    <div ref={ref} className="relative z-50">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-8 w-8 items-center justify-center rounded-full overflow-hidden
                   ring-2 ring-transparent hover:ring-primary/30 transition-all"
        aria-label="Korisnički meni"
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-primary/10 text-xs font-bold text-primary">
            {initials}
          </div>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-56 rounded-xl border border-border/60 bg-surface shadow-lg animate-fade-in-up">
          <div className="border-b border-border/40 px-4 py-3">
            <p className="text-sm font-medium truncate">{name}</p>
            {session.user.email && (
              <p className="text-xs text-muted truncate">{session.user.email}</p>
            )}
          </div>
          <div className="py-1">
            <a
              href="/checkliste"
              className="block px-4 py-2 text-sm text-muted-dark hover:bg-surface-alt hover:text-foreground transition-colors"
            >
              📋 Moje checkliste
            </a>
            <a
              href="/istorija"
              className="block px-4 py-2 text-sm text-muted-dark hover:bg-surface-alt hover:text-foreground transition-colors"
            >
              💬 Istorija razgovora
            </a>
          </div>
          <div className="border-t border-border/40 py-1">
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-500/5 transition-colors"
            >
              Odjavi se
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
