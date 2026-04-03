/**
 * Auth.js v5 configuration.
 *
 * Providers:
 *   - Google OAuth (one-click login)
 *   - Email magic link (passwordless via Resend)
 *
 * Adapter: Upstash Redis (same instance as analytics)
 * Session strategy: JWT (no database sessions — simpler, faster)
 */

import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import { UpstashRedisAdapter } from "@auth/upstash-redis-adapter";
import { Redis } from "@upstash/redis";

function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

const redis = getRedis();

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: redis ? UpstashRedisAdapter(redis) : undefined,

  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: process.env.EMAIL_FROM || "BezPapira <noreply@bezpapira.rs>",
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  pages: {
    signIn: "/login",
    verifyRequest: "/login?verify=1",
    error: "/login?error=1",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },

  // Trust Vercel proxy headers
  trustHost: true,
});
