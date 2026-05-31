FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# scripts/postinstall-patches.cjs runs during install, so copy it first.
COPY scripts ./scripts
# Use `npm install` instead of `npm ci` so npm can add missing platform-specific
# optional native deps (e.g. @emnapi/runtime on Linux) without failing strict
# lock-file check. The lock is regenerated locally — this keeps prod builds
# resilient against macOS↔Linux optional-dep drift that npm ci can't tolerate.
RUN npm install --no-audit --no-fund

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 8080
CMD ["node", "server.js"]
