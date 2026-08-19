# Notification Service

## Overview

Delivers notifications through four channels (in app, email stub, Firebase push, realtime over Redis) and runs the BullMQ worker.

## Stack

- **Framework**: Express 5, tRPC 11, BullMQ, ioredis, firebase-admin

## Commands

```bash
bun dev:notification      # dev on port 4004
```

## Conventions

- The BullMQ worker starts after the server listens, concurrency 20
- The realtime stream is the tRPC subscription `notifications.appNotifications.onNew`

## Gotchas

- Its `.env` embeds a full Firebase service account JSON
- A raw SSE router exists but is never mounted

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._
