"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

/**
 * Mascot — a photo of a young professional woman with a folder,
 * plus an animated speech-bubble slogan.
 *
 * Photo: Pexels #12902926 (free Pexels license).
 */
export default function LawyerCharacter() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 800);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative inline-flex items-end justify-center select-none">
      {/* Speech bubble */}
      <div
        className={`absolute -top-3 -right-6 sm:-right-10 z-10 w-[200px] sm:w-[220px]
          transition-all duration-700 ease-out
          ${show ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-90"}`}
      >
        <div
          className="relative bg-white/90 backdrop-blur-md rounded-2xl rounded-bl-sm px-4 py-3
                      shadow-lg shadow-primary/10 border border-primary/20"
        >
          <p className="text-[13px] font-semibold leading-snug text-foreground">
            Bez brige — vodim te
            <br />
            kroz svaki korak! 💼
          </p>
          {/* Bubble tail */}
          <div
            className="absolute -bottom-[7px] left-6 h-3.5 w-3.5 rotate-45 rounded-br-[3px]
                        bg-white/90 border-b border-r border-primary/20"
          />
        </div>
      </div>

      {/* Photo */}
      <div className="relative h-[220px] w-[165px] sm:h-[260px] sm:w-[195px] overflow-hidden rounded-2xl shadow-xl shadow-primary/15 border-2 border-white/60">
        <Image
          src="/mascot.jpg"
          alt="Mlada profesionalka s fasciklom"
          fill
          className="object-cover object-top"
          sizes="195px"
          priority
        />
        {/* Subtle gradient overlay at bottom for text contrast */}
        <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-primary/15 to-transparent pointer-events-none rounded-b-2xl" />
      </div>
    </div>
  );
}
