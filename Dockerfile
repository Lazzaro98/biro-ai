# ───────────────────────────────────────────────────
# Multi-stage Dockerfile for biro-ai (Next.js 16)
# Produces a lean production image (~180 MB)
# ───────────────────────────────────────────────────

# ── 1. Base ──────────────────────────────────────
FROM node:22-alpine AS base
WORKDIR /app

# ── 2. Dependencies ─────────────────────────────
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts

# ── 3. Build ─────────────────────────────────────
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects telemetry by default — disable in CI/prod
ENV NEXT_TELEMETRY_DISABLED=1

# Need a dummy key at build time so the env validation doesn't crash
# (the real key is injected at runtime via docker run --env or compose)
ARG OPENAI_API_KEY=build-placeholder
ENV OPENAI_API_KEY=$OPENAI_API_KEY

RUN npm run build

# ── 4. Production ────────────────────────────────
FROM base AS runner

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Don't run as root
RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nextjs

# Copy only what's needed to run
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]
