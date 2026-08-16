# Env

## Overview

Zod validated environment variables for each workspace: server, gateway, payment, user service, ai service, notifications, and web.

## Stack

- **Key dependencies**: zod, @t3-oss/env-core, @t3-oss/env-nextjs

## Conventions

- One file per service under `src/`, each exporting its parsed env
- Every service reads its own `.env` file

## Gotchas

- The payment env uses plain zod `safeParse` with `process.exit`, not the t3 helpers

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._
