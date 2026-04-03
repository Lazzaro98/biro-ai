"use client";

import { useEffect, useRef } from "react";
import { track } from "@/app/lib/analytics";

/**
 * Fires a `page_view` analytics event once per page load.
 * Rendered in the root layout so every route is tracked.
 */
export default function PageViewTracker() {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    track("page_view");
  }, []);

  return null;
}
