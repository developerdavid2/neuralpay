FROM oven/bun:1.3.11-alpine AS base
RUN bun add -g turbo@2.8.12
WORKDIR /app

FROM base AS pruner
COPY . .
RUN turbo prune web --docker

FROM base AS installer
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/bun.lock ./bun.lock
RUN bun install

FROM base AS builder
COPY --from=installer /app .
COPY --from=pruner /app/out/full/ .

# Build args for Next.js public env vars (baked at build time)
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_SERVER_URL
ARG NEXT_PUBLIC_BETTER_AUTH_URL
ARG NEXT_PUBLIC_AUTH_BASE_PATH

ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_SERVER_URL=$NEXT_PUBLIC_SERVER_URL
ENV NEXT_PUBLIC_BETTER_AUTH_URL=$NEXT_PUBLIC_BETTER_AUTH_URL
ENV NEXT_PUBLIC_AUTH_BASE_PATH=$NEXT_PUBLIC_AUTH_BASE_PATH

RUN bun run build --filter=web

FROM oven/bun:1.3.11-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup -S app && adduser -S -G app app

COPY --from=builder --chown=app:app /app/apps/web/.next/standalone ./
COPY --from=builder --chown=app:app /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=app:app /app/apps/web/public ./apps/web/public

USER app

EXPOSE 3001


CMD ["bun", "apps/web/server.js"]