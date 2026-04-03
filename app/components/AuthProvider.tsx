"use client";

/**
 * Client-side session provider.
 * Wraps the app to make useSession() available everywhere.
 */

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

export default function AuthProvider({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
