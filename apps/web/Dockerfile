# ------------------------------------------------
# Base
# ------------------------------------------------
FROM oven/bun:1.3.11-alpine AS base

RUN bun add -g turbo@2.8.12

WORKDIR /app

# ------------------------------------------------
# Source stage
# ------------------------------------------------
FROM base AS source

COPY . .

# ------------------------------------------------
# Prune stage
# ------------------------------------------------
FROM source AS pruner

RUN turbo prune web --docker

# ------------------------------------------------
# Install dependencies
# ------------------------------------------------
FROM base AS installer

COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/bun.lock ./bun.lock

RUN bun install

# ------------------------------------------------
# Build stage
# ------------------------------------------------
FROM base AS builder

COPY --from=installer /app .
COPY --from=pruner /app/out/full/ .

# Build args
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_SERVER_URL
ARG NEXT_PUBLIC_BETTER_AUTH_URL
ARG NEXT_PUBLIC_AUTH_BASE_PATH

ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_SERVER_URL=$NEXT_PUBLIC_SERVER_URL
ENV NEXT_PUBLIC_BETTER_AUTH_URL=$NEXT_PUBLIC_BETTER_AUTH_URL
ENV NEXT_PUBLIC_AUTH_BASE_PATH=$NEXT_PUBLIC_AUTH_BASE_PATH

RUN bun run build --filter=web

# ------------------------------------------------
# Production runner
# ------------------------------------------------
FROM oven/bun:1.3.11-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN addgroup -S app && adduser -S -G app app

# Standalone output
COPY --from=builder --chown=app:app /app/apps/web/.next/standalone ./

# Next static files
COPY --from=builder --chown=app:app /app/apps/web/.next/static ./apps/web/.next/static

# Public assets
COPY --from=source --chown=app:app /app/apps/web/public ./apps/web/public

USER app

EXPOSE 3001

CMD ["bun", "apps/web/server.js"]