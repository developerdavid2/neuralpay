# User Service

## Overview

Owns user accounts: better-auth handlers, profile and security routes, location, and avatar uploads.

## Stack

- **Framework**: Express 5, tRPC 11, better-auth, Drizzle ORM
- **Key dependencies**: uploadthing, axios, country-state-city, ua-parser-js

## Commands

```bash
bun dev:user      # dev on port 4001
```

## Conventions

- Mounts better-auth `toNodeHandler` at `/api/auth` and uploadthing before the body parser
- Routers: auth, security, profile, location

## Gotchas

- Its tRPC context adds `resHeaders` from the Express response for cookie forwarding

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._
