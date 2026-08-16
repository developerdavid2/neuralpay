# NeuralPay landing design standard

> The full decision and its reasoning live in spec `docs/specs/apps/web/0001-landing-design-system/`. This file is the quick reference every landing section should read. Pattern evidence: `apps/web/src/modules/landing`.
> This is the landing's own standard, separate from the dashboard's `DESIGN.md`. Working on the landing follows this file; working on the dashboard follows DESIGN.md.

## 1. Tokens

- Landing surfaces use the `--color-landing-*` palette only, never dashboard semantic tokens (`bg-background`, `border-border`, `text-muted-foreground`, `bg-secondary`).
- The palette has a full set of light values; light mode is a first class state.
- Carry over from the dashboard system: `--color-main` and `--color-main-tint` (brand violet), the radius scale, the fonts, and the `3xl` and `4xl` breakpoints.
- The JS `LANDING_THEME` object is not a source of truth. It survives only where a prop needs a raw color string (react-bits, recharts) and must stay in sync with the CSS palette.

## 2. Fonts

- Display headings use `font-rostex` for the filled form and `font-rostex-outline` for the outline form. The hero sets the pattern: AGENT filled, FINANCE outline.
- Body copy uses nexa through the default sans stack. Data, labels, and captions use `font-mono`.

## 3. Light and dark inversion

- Every section declares its polarity with `data-polarity="light"` or `data-polarity="dark"`. The token mapping flips under the `.dark` ancestor, so a section keeps its identity across themes while its colors swap.
- This is a deliberate per-section contrast flip, not a whole page token swap. New sections never reimplement the flip in JS; the polarity attribute plus the CSS mapping is the only mechanism.

## 4. Animation ownership

- Motion owns entrances, viewport-triggered and state driven reveals, and AnimatePresence transitions.
- GSAP with useGSAP owns sequenced timelines, continuous loops, and any ScrollTrigger scrub or pinning added later.
- One runtime per element. Never mix two drivers on the same element.
- No Lenis, no Three.js, no Matter.js. Revisit one only when a specific section genuinely needs it.

## 5. Container and gutters

- LandingContainer wraps section content: `mx-auto w-full max-w-7xl px-5 md:px-8 3xl:max-w-450 4xl:max-w-500`.
- Full bleed backgrounds sit outside it; text and components sit inside.

## 6. Reduced motion

- A shared guard honors prefers-reduced-motion. It is a partial disable: loops, parallax, blur reveals, and scroll driven effects switch off, but gentle fades and small state transitions stay, and all content remains visible in its final state.
- Heavy effect layers (MagicRings, LightRays, blurs) are skipped entirely under the guard.

## 7. Performance and conversion

- 60fps target. Only transform and opacity animate. `will-change` is used sparingly. Heavy visuals load lazily.
- The primary CTA stays above the fold, static, and never obscured by an animation. Reveals resolve quickly; the end state is fully readable.

## 8. Mobile first

- Build and verify at 360px and 375px widths first, desktop later. Effect layers disable below a width gate and under reduced motion.

## 9. Current migration

- Hero and manifesto are being refactored onto this standard as one migration, before the next new landing section ships.
