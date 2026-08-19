# Web

## Overview

The Next.js client for Orra: auth flows, onboarding, the dashboard (accounts, transactions, budgets, splits, vaults), the AI coach chat, and notifications. Talks to services through the gateway via tRPC.

## Stack

- **Framework**: Next.js 16 (app router), React 19
- **Key dependencies**: tRPC 11 client, AI SDK, zustand, TanStack Query, Tailwind v4 via `@orra/ui`, lucide-react, recharts

## Commands

```bash
bun dev:web      # dev on port 3001 with NODE_OPTIONS=--max-old-space-size=4096
```

## Conventions

- App code lives in `src/app`; feature code in `src/modules/<feature>/` split into `ui`, `hooks`, `lib`, `constants`, `types`, `store`
- tRPC client wiring in `src/trpc`; server prefetch helpers in `src/trpc/trpc-server.tsx`
- Global styles: `src/index.css` imports `@orra/ui/globals.css` on a single line

## Gotchas

- Dev runs on port 3001 (not 3000) with a high Node memory cap
- Locally tRPC goes to `${NEXT_PUBLIC_SERVER_URL}/v1/trpc`; in production to `/api/trpc` via `vercel.json` rewrites
- The AI coach streams over HTTP (`/v1/ai/chat/stream` local, `/api/stream/chat` prod), not tRPC
- Web has no `check-types` script, so turbo skips it

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._
