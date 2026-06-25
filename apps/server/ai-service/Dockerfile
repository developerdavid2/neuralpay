FROM oven/bun:1.3.11-alpine AS base
RUN bun add -g turbo@2.8.12
WORKDIR /app

# ── Stage 1: Prune monorepo to only what this service needs
FROM base AS pruner
COPY . .
RUN turbo prune @neuralpay/ai-service --docker

# ── Stage 2: Install dependencies
FROM base AS installer
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/bun.lock ./bun.lock
RUN bun install

# ── Stage 3: Build
FROM base AS builder
COPY --from=installer /app .
COPY --from=pruner /app/out/full/ .
RUN bun run build --filter=@neuralpay/ai-service

# ── Stage 4: Production runner
FROM oven/bun:1.3.11-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy only the built output and production deps
COPY --from=builder /app/apps/server/ai-service/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 4003

CMD ["bun", "run", "dist/index.mjs"]