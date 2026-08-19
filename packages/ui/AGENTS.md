# UI

## Overview

The design system: Tailwind v4 CSS first tokens, shadcn components, shared hooks and lib helpers.

## Stack

- **Key dependencies**: React 19, Tailwind v4, radix-ui, lucide-react, motion, recharts, shadcn

## Commands

```bash
bun -F @orra/ui check-types      # tsc --noEmit
```

## Conventions

- Tokens live in `src/styles/globals.css` using the `@theme` block with `--font-nexa` and `--font-rostex`
- Exported as `@orra/ui/globals.css`, `/components/*`, `/lib/*`, `/hooks/*`
- `cn()` helper in `src/lib/utils.ts`

## Gotchas

- The web app imports the global CSS on one line: `@import "@orra/ui/globals.css"`

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._
