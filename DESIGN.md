# Orra design system

> Source of truth for tokens: `packages/ui/src/styles/globals.css`. Pattern evidence: `apps/web/src/modules/*`.
> This document describes what the dashboard actually does today. If a pattern is not listed here, it does not exist yet in the codebase.

## 1. Design tokens

- Tokens are CSS variables in `packages/ui/src/styles/globals.css`, wired into Tailwind v4 through the `@theme inline` block. You reference them by Tailwind class (`bg-background`, `text-muted-foreground`), never by raw value.
- Semantic color tokens cover background, foreground, card, popover, primary, secondary, muted, accent, destructive, border, input, ring, the chart series (chart 1 to 5), and the sidebar family (sidebar, sidebar-foreground, sidebar-primary, sidebar-accent, sidebar-border, sidebar-ring).
- `--color-main` is the brand violet accent used for primary actions and the active nav state, the one brand color outside the shadcn set, plus a tint variant.
- Radius: one `--radius` base scaled by fixed multipliers for sm/md/lg/xl/2xl/3xl/4xl. Use the Tailwind `rounded-*` tokens, not arbitrary pixel radii, unless the shape is intentionally distinct (stat hero cards).
- Fonts: `--font-sans` and `--font-heading` (nexa), `--font-display` (rostex, display only), `--font-mono` for amounts and numeric columns. `font-sans` applies globally.
- Dark mode is class based: `@custom-variant dark (&:is(.dark *))`, so every `dark:` class needs the `dark` class on an ancestor. next-themes wires this with `attribute="class"`, `defaultTheme="system"`.
- The base layer sets `* { border-border }` and `body { background-background text-foreground }`.

## 2. Component patterns

- Default to shadcn primitives first. Dashboard code imports every surface from `@orra/ui/components/*` (button, badge, card, drawer, sheet, skeleton, spinner, input, select, checkbox, dropdown-menu, table, tabs, separator, switch, field, textarea, scroll-area, command, popover, calendar, avatar, alert-dialog, dialog, sidebar, sonner, and more). Custom code only where shadcn has no equivalent. `cn` comes from `@orra/ui/lib/utils`.

### Card shapes

- Standard section card: `rounded-xl border border-border bg-card` (recent transactions, top categories).
- Page container: `bg-card border border-muted shadow rounded-2xl` wrapping a section with a filter bar plus table or list (accounts page, transactions page).
- Stat highlight cards: `rounded-3xl` with a gradient overlay and custom shadows (dashboard overview).
- Grouped card rows use `divide-y divide-border` on the container.

### Headers

- Page header: title `text-2xl md:text-3xl font-semibold tracking-tight`, description `text-sm text-muted-foreground`, optional action button on the right.
- Card section header: title `text-sm font-semibold text-foreground` beside a `text-primary` icon, sub copy `text-xs text-muted-foreground`.
- Table column header: ghost Button, `uppercase text-[12px]`, with a ChevronsUpDown icon that toggles sort.

### Status color logic

- Every status to color mapping lives in a per module constants file (`HEALTH_META`, `TRANSACTION_STATUS_STYLES`, `ACCOUNT_STATUS_CONFIG`) and exports ready made class strings for badge, bar, dot, and text variants.
- The shared recipe: badge `bg-{color}-500/10 text-{color}-600 dark:text-{color}-400 border-{color}-500/20`, progress bar `h-1.5 w-full rounded-full bg-muted` with an inner bar in the status color, plus dot and text variants for inline use.
- Palette: on track and successful use emerald, warning and pending use amber, over and failed use red (destructive), refunded uses blue, reversed uses violet, active uses emerald, inactive uses slate. Ranked category bars scale one hue by opacity (`bg-primary/80`, `/60`, `/40`).
- Amounts: `font-mono text-sm font-semibold tabular-nums`, credit in emerald with a plus, debit in default foreground with a minus, negative balance in destructive.

### Lists and tables

- Transactions group rows into month sections with month headers.
- Row icon chips: `size-9 rounded-lg bg-accent` with a `text-muted-foreground` lucide icon (recent transactions, account name cell).
- Data tables (TanStack Table on shadcn Table): row selection Checkbox, sticky table header (`sticky top-0 backdrop-blur-xl bg-muted dark:bg-secondary`), filter bar in a `border-b border-border` strip, row actions in a DropdownMenu (View Details, Edit, Delete) with destructive styling on delete. List rows hover with `hover:bg-muted/30` (or `hover:bg-accent dark:hover:bg-white/4` on cards).
- Empty states: centered `flex flex-col items-center justify-center h-64 text-center`, a `text-muted-foreground` icon, a `text-sm font-medium` title, a `text-xs text-muted-foreground` hint capped at `max-w-xs`. Category cards use a `rounded-full bg-muted p-3` icon circle.

### Loading and error states

- Skeletons mirror the real layout closely (same headings, row counts, widths) so the page does not jump.
- `SectionBoundary` wraps every data section with Suspense plus ErrorBoundary: pass a matching skeleton as fallback and an errorMessage; the error fallback shows an AlertCircle icon, the message, and a Try again button.
- Pending mutations disable the row action menu and swap the MoreHorizontal icon for a Spinner.

### Overlay panels

- Detail views open in a Drawer (account, transaction, budget, insight). Create/edit forms use a Sheet in transactions and budgets but a Drawer in accounts (accounts is the inconsistent module).
- Dialogs (AlertDialog) are reserved for destructive confirmations.

**Open decision.** Accounts currently uses Drawer for both its create/edit form and its detail view, while transactions and budgets use Sheet for forms and Drawer for detail. This split is unintentional drift, not a decision. Keep accounts on Drawer for now. Do not silently switch accounts to Sheet or switch transactions and budgets to Drawer to make them match. Changing either side is a deliberate reconciliation that needs explicit sign off and a note added here.

## 3. Light and dark mode contrast rules

- Dark backgrounds are near black violet, cards one step lighter, and borders become white at low alpha so hairlines stay visible, while light mode borders are gray.
- Status and accent colors always carry an explicit dark pair in class strings: `text-emerald-600 dark:text-emerald-400`. In dark mode text falls back to the lighter 400 weight for contrast. Do not add a status color without its dark class pair.
- Muted foreground is lighter in dark mode than light mode.
- Subtle surfaces and hover fills in dark mode use white at low alpha (`bg-white/3`, `bg-white/4`, `border-white/10`) instead of gray fills.
- Sidebar active nav uses `bg-background text-main font-bold` with a yellow left border (`border-yellow-500/80 dark:border-yellow-300/80`); the sidebar body uses the sidebar tokens with a violet tinted hover fill.
- Verify every new component in both modes. Dark is a first class state, not an afterthought.

## 4. Known gap: the dashboard is not responsive

- Dashboard pages use fixed widths and heights in several places (table columns `w-25`/`w-35`, views at `h-[105vh]` and `h-[125vh]`, fixed `p-10` gutters). Some breakpoints exist (`grid-cols-1 sm:grid-cols-2 xl:grid-cols-4`, `md:text-3xl`) but pages are not usable below desktop widths.
- Treat this as a known gap. New dashboard work should build in responsiveness as it goes (fluid gutters, tables collapsing to cards, responsive drawer sides) and not copy the current fixed layout as a model.

## 5. Landing pages are not a style reference

- The marketing pages live under `modules/landing` and use their own palette, display fonts, and 3xl/4xl breakpoints. They are a work in progress.
- The dashboard modules (accounts, transactions, budgets, insights, chats) are the canonical reference for this design system. Match the dashboard patterns in this document for dashboard UI; follow the landing conventions, not this document, when working on landing.
