# CRITICAL RULES - MUST FOLLOW

## RESPONSES

- Keep responses concise and to the point - unless the user asks otherwise

## PLANNING MODE

- Always ask clarifying questions
- Never assume design, tech stack or features
- Use deep-dive sub-agents to assist with research
- Use deep-dive sub-agents to review the different aspects of your plan before presenting to the user

## CHANGE / EDIT MODE

- Never implement features yourself when possible - use sub-agents!
- Identify changes from the plan that can be implemented in parallel, and use sub-agents to implement the features efficiently
- When using sub-agents to implement features, act as a coordinator only
- Use the best model for the task - premium models for complex tasks (like coding) and mid-tier models for simpler tasks, like documentation
- After completing features (large or small), always run commands like lint, type check and next build to check code quality

## DATABASE SCHEMA CHANGES

- Whenever you make changes to the database schema, ALWAYS run the drizzle generate and migrate commands
- NEVER run drizzle push!

## TESTING

- Use any testing tools, libraries available to the project for testing your changes
- Never assume your changes simply work, always test!
- If the project does not have any testing tools, scripts, MCP tools, skills, etc. available for testing, ask the user whether testing should be skipped.

## UI DESIGN

- Always follow the UI design system when creating or reviewing components or pages.
- Design System: @DESIGN.md

## Architecture boundaries

- Services under `apps/server/*` never import another service's classes, services, or internal modules directly (e.g. ai-service must never import AccountsService or BudgetsService from payment-service). Any service needing data owned by another service either queries the shared Postgres database directly via `packages/db`, or calls the other service through the api-gateway. Treat this as a hard boundary, not a style preference.

- Package usage across the monorepo is governed by each app or package's own package.json dependencies — that is the source of truth for what a workspace may import. Before importing from any package, check that it is actually listed as a dependency; if it isn't, that import is not allowed without first adding it deliberately and asking why it wasn't already there.

- packages/ui is a frontend-only design system package. No service under `apps/server/*` may depend on or import from `packages/ui` under any circumstance.

- Avoid introducing cyclic dependencies among `packages/*` — in particular, never let three or more packages depend on each other in a cycle (A -> B -> C -> A). If a change would require this, stop and flag it rather than adding the import, since it usually means shared logic needs to move to a lower-level package instead.

## Stack

- **Language / Runtime**: TypeScript on Bun (bun@1.3)
- **Framework**: Next.js 16 (web), Express 5 (services), Fastify 5 (payment service), tRPC 11
- **Key dependencies**: Drizzle ORM + Postgres, Redis (ioredis, BullMQ), better-auth, zod, AI SDK
- **Monorepo**: Turbo workspaces: `apps/web`, `apps/server/*` (api-gateway, user-service, payment-service, ai-service, notification-service), `packages/*` (ui, auth, db, redis, env, types, config, file-upload)

## Build approach

<TBD, set by /scope>

## Commands

```bash
# Install
bun install

# Dev servers
bun dev:web          # Next.js on port 3001
bun dev:backend      # api-gateway plus all services on ports 4000 to 4004

# Build
bun build

# Typecheck
bun check-types      # turbo check-types; services also run tsc -b

# Database (schema changes: always generate + migrate, never push)
bun db:generate
bun db:migrate
bun db:studio
```

## Context files

<!-- Nested AGENTS.md files are listed here as they are created -->
- [apps/web/AGENTS.md](apps/web/AGENTS.md): web client, Next.js 16 app router on port 3001
- [apps/server/api-gateway/AGENTS.md](apps/server/api-gateway/AGENTS.md): Express + tRPC gateway, the auth boundary
- [apps/server/user-service/AGENTS.md](apps/server/user-service/AGENTS.md): auth, profile, uploads, location
- [apps/server/payment-service/AGENTS.md](apps/server/payment-service/AGENTS.md): Fastify service for accounts, transactions, budgets, plaid
- [apps/server/ai-service/AGENTS.md](apps/server/ai-service/AGENTS.md): AI coach streaming chat and insights
- [apps/server/notification-service/AGENTS.md](apps/server/notification-service/AGENTS.md): BullMQ worker and notification channels
- [packages/db/AGENTS.md](packages/db/AGENTS.md): Drizzle schema, migrations, local Postgres
- [packages/redis/AGENTS.md](packages/redis/AGENTS.md): Redis client, keys, queues, pubsub
- [packages/auth/AGENTS.md](packages/auth/AGENTS.md): better-auth setup
- [packages/env/AGENTS.md](packages/env/AGENTS.md): zod env schemas per service
- [packages/ui/AGENTS.md](packages/ui/AGENTS.md): Tailwind v4 design system and shadcn components
- [packages/types/AGENTS.md](packages/types/AGENTS.md): shared TS types and zod schemas
- [packages/config/AGENTS.md](packages/config/AGENTS.md): tsconfig base, tRPC and express/fastify helpers
- [packages/file-upload/AGENTS.md](packages/file-upload/AGENTS.md): uploadthing wrapper and adapters
