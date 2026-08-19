# Payment Service

## Overview

Owns payment data: accounts, transactions, budgets, and Plaid bank linking. The odd one out, it runs Fastify while every other service runs Express.

## Stack

- **Framework**: Fastify 5, tRPC 11 (fastifyTRPCPlugin), Drizzle ORM
- **Key dependencies**: Plaid, ioredis, rate-limiter-flexible, BullMQ (dependency only, no queue code)

## Commands

```bash
bun dev:payment      # dev on port 4002 (entry src/local.ts)
```

## Conventions

- `src/app.ts` is a Fastify plugin; routes register helmet, rate limit (200 per minute) and the tRPC plugin at `/trpc`
- Routers: accounts, transactions, budgets, plaid

## Gotchas

- Dev uses `src/local.ts`, production build is `src/render.ts` to `dist/render.js`; the `main` field (`dist/serverless.js`) is stale
- Plaid token encryption needs an `ENCRYPTION_KEY`
- The webhook middleware file is only a TODO comment

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._
