# API Gateway

## Overview

Express + tRPC gateway on port 4000, the only auth boundary in the system. Composes every service router into one appRouter and proxies traffic to the services.

## Stack

- **Framework**: Express 5, tRPC 11
- **Key dependencies**: http-proxy-middleware, express-http-proxy, ioredis (session cache), winston

## Commands

```bash
bun dev:server      # dev on port 4000
```

## Conventions

- Proxies live in `src/proxy`; router composition in `src/router.ts`
- Services trust `x-user-id` headers that the gateway sets after its auth middleware

## Gotchas

- Session is cached in Redis under `session:<sha256(cookie)>` for 5 minutes; the gateway fails open when Redis is down
- The rate limit middleware file exists but is never mounted
- `/v1/trpc` proxy strips the `users.`, `payments.`, `ai.`, `notifications.` namespace prefixes

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._
