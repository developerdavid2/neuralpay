FROM oven/bun:1.3.11-alpine AS base
RUN bun add -g turbo@2.8.12
WORKDIR /app

# ── Stage 1: Prune monorepo to only what this service needs
FROM base AS pruner
COPY . .
RUN turbo prune @neuralpay/api-gateway --docker

# ── Stage 2: Install dependencies
FROM base AS installer
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/bun.lock ./bun.lock
RUN bun install

# ── Stage 3: Build
FROM base AS builder
COPY --from=installer /app .
COPY --from=pruner /app/out/full/ .
RUN bun run build --filter=@neuralpay/api-gateway

# ── Stage 4: Production runner
FROM oven/bun:1.3.11-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup -S app && adduser -S -G app app


# Copy only the built output and production deps
COPY --from=builder --chown=app:app /app/apps/server/api-gateway/dist ./dist
COPY --from=builder --chown=app:app /app/node_modules ./node_modules

USER app


EXPOSE 4000

CMD ["bun", "run", "dist/index.mjs"]