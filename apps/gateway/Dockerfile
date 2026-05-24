FROM node:20-alpine AS base
RUN corepack enable pnpm

FROM base AS deps
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/gateway/package.json ./apps/gateway/
COPY packages/shared/package.json ./packages/shared/
COPY packages/db/package.json ./packages/db/
RUN pnpm install --frozen-lockfile --filter @devlock/gateway...

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/gateway/node_modules ./apps/gateway/node_modules
COPY --from=deps /app/packages ./packages
COPY apps/gateway ./apps/gateway
COPY packages/shared ./packages/shared
COPY packages/db ./packages/db
COPY tsconfig.base.json ./
RUN pnpm --filter @devlock/shared build
RUN pnpm --filter @devlock/db build
RUN pnpm --filter @devlock/gateway build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 devlock
COPY --from=builder --chown=devlock:nodejs /app/apps/gateway/dist ./dist
COPY --from=builder --chown=devlock:nodejs /app/apps/gateway/node_modules ./node_modules
COPY --from=builder --chown=devlock:nodejs /app/packages/shared/dist ./node_modules/@devlock/shared/dist
COPY --from=builder --chown=devlock:nodejs /app/packages/db/dist ./node_modules/@devlock/db/dist
USER devlock
EXPOSE 3000
CMD ["node", "dist/index.js"]
