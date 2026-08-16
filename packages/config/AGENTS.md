# Config

## Overview

Shared tooling config: the strict base tsconfig, tRPC helpers (router, public and protected procedures, express and fastify contexts), and the express app factory.

## Stack

- **Key dependencies**: @trpc/server, better-auth, express, superjson

## Conventions

- `tsconfig.base.json` is strict, with `verbatimModuleSyntax` and Bun types
- tRPC context helpers and `toTrpcCode` live in `src/trpc.ts`

## Gotchas

- The package exports `./express-context` and `./fastify-context`, but those files do not exist; the helpers are in `src/trpc.ts`

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._
