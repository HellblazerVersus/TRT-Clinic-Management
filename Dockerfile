FROM node:20-alpine AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# ─── deps: install all dependencies + generate Prisma client ─────────────────
FROM base AS deps
RUN apk add --no-cache libc6-compat openssl python3 make g++
COPY package.json ./
# Copy schema first so prisma postinstall can generate the client (with engine)
COPY prisma ./prisma
# npm install downloads the prisma query engine binary and generates the client
RUN npm install

# ─── builder: compile Next.js production build ────────────────────────────────
FROM base AS builder
RUN apk add --no-cache openssl
# node_modules already contains the Prisma engine + generated client from deps
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# NOTE: We do NOT run `prisma generate` here again because:
#  - The client + engine were already generated/downloaded in the deps stage
#  - Re-running generate in builder would fail (no network) or produce engine=none client
RUN npm run build

# ─── runner: minimal production image ────────────────────────────────────────
FROM base AS runner
RUN apk add --no-cache openssl
ENV NODE_ENV=production
# Required for NextAuth v5 when running behind Docker/proxy
ENV AUTH_TRUST_HOST=true

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

RUN mkdir -p /app/public
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/prisma ./prisma

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
