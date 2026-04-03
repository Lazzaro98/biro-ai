/**
 * NextAuth.js API route handler.
 * Handles /api/auth/* routes (signin, callback, signout, etc.)
 */

import { handlers } from "@/app/lib/auth";

export const { GET, POST } = handlers;
