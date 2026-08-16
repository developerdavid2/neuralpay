# DB

## Overview

The single source of truth for the database: Drizzle schema per domain, migrations, and a local Postgres via docker compose.

## Stack

- **Database**: PostgreSQL, Drizzle ORM, drizzle-kit, node-postgres (pg)

## Commands

```bash
bun db:start       # docker compose up for local Postgres
bun db:generate    # new migration from schema
bun db:migrate     # apply migrations
bun db:studio      # drizzle studio
```

## Conventions

- Schema lives in `src/schema/`, one file per domain, with a barrel and a `_relation.ts`
- Schema changes always go through generate + migrate, never `db:push`

## Gotchas

- `drizzle.config.ts` loads `packages/db/.env`, falling back to `apps/server/.env.shared`, which does not exist yet
- The migrations folder is created by the first generate
- Seed scripts run via bun, they have no npm script

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._
