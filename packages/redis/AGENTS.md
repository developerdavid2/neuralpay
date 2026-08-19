# Redis

## Overview

The shared Redis layer: ioredis client, namespaced cache keys, the BullMQ notifications queue, and pubsub helpers.

## Stack

- **Key dependencies**: ioredis, BullMQ, rate-limiter-flexible

## Conventions

- Client is a lazy connect singleton in `src/client.ts`; keys are namespaced via `cacheKeys` in `src/keys.ts`
- Pubsub runs on `user:<id>:notifications`

## Gotchas

- The queue only carries notification jobs; payment service has no queue code despite the BullMQ dependency

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._
