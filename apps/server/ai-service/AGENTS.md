# AI Service

## Overview

Runs the AI coach streaming chat and insights for the web app.

## Stack

- **Framework**: Express 5, Vercel AI SDK (streamText)
- **Key dependencies**: @openrouter/ai-sdk-provider, @ai-sdk/openai-compatible (Groq is the default model provider)

## Commands

```bash
bun dev:ai      # dev on port 4003
```

## Conventions

- The chat stream is HTTP `POST /chat/stream` (SSE), not a tRPC procedure
- Tool calls are default deny and scoped per chat context via `CONTEXT_TOOL_SCOPE`

## Gotchas

- Streaming requires the `x-internal-source=api-gateway` header and an `x-user-id`
- Provider is chosen by `AI_PROVIDER` / `AI_MODEL`; Groq default, OpenRouter and Vercel AI Gateway as options
- Free tier caps at 20 queries a month
- ai-service must never import AccountsService, BudgetsService, or any other service class from payment-service. It queries bankAccounts, budgets, budgetCategories, and transactions directly via packages/db inside its own tool/context files.

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._
