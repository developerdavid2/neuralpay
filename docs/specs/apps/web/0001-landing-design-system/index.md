# 0001. Landing page design system

**Date**: 2026-08-15
**Status**: Accepted

## Summary

The landing page needs its own design standard, separate from the dashboard's DESIGN.md. This decision defines the tokens, the light and dark inversion rule, the animation ownership split, the container system, and the performance and conversion rules every landing section must follow. It exists so sections built by different sessions share one durable reference, the way the dashboard already has one, and so the page ships one section at a time on a consistent base.

## Decision

**Chosen option**: Adopt a landing-specific design standard built on section polarity tokens for the light and dark inversion, a Motion plus GSAP ownership split with native scroll, no Three.js and no Matter.js, a LandingContainer system, a full light palette for the landing tokens, and a refactor of the hero and manifesto sections onto the standard.

**Implementation skills**: `awwwards-animations` (`.agents/skills/awwwards-animations/`)

## Standard definition

### Canonical pattern

Every landing section declares its background polarity with a data attribute, wraps its content in LandingContainer, reads its colors from the section tokens, and never hardcodes a color:

```tsx
<section
  data-polarity="dark"
  data-blur-section
  className="relative w-full overflow-hidden"
>
  <LandingContainer className="relative z-10">
    <motion.h1
      variants={headingReveal}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="font-rostex tracking-tighter"
    >
      Section heading
    </motion.h1>
    <PremiumButton>Get started</PremiumButton>
  </LandingContainer>
</section>
```

The polarity attribute maps to section tokens in globals.css. `data-polarity="dark"` means the section renders dark in light mode; `data-polarity="light"` means it renders light in light mode. The `.dark` ancestor flips each mapping, which is the inversion rule:

```css
[data-polarity="dark"] {
  --section-bg: var(--color-landing-bg);
  --section-surface: var(--color-landing-card);
  --section-ink: var(--color-landing-foreground);
}
[data-polarity="light"] {
  --section-bg: var(--color-landing-bg-light);
  --section-surface: var(--color-landing-card-light);
  --section-ink: var(--color-landing-foreground-light);
}
.dark [data-polarity="dark"] {
  --section-bg: var(--color-landing-bg-light);
  --section-surface: var(--color-landing-card-light);
  --section-ink: var(--color-landing-foreground-light);
}
.dark [data-polarity="light"] {
  --section-bg: var(--color-landing-bg);
  --section-surface: var(--color-landing-card);
  --section-ink: var(--color-landing-foreground);
}
```

Sections then use `bg-[var(--section-bg)]` and `text-[var(--section-ink)]` (or mapped theme tokens such as `--color-section-bg` for cleaner class names). The exact variable names are flexible; the contract is the data polarity attribute plus a token mapping that flips under the dark ancestor. No section may read its colors from a theme ternary in JS or from a hardcoded hex value.

Animation ownership, one runtime per element:

```tsx
// reveals, entrances, state driven effects, AnimatePresence: Motion only
const headingReveal = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

// sequenced timelines, continuous loops, ScrollTrigger scrub or pinning: GSAP with useGSAP only
useGSAP(() => {
  const tl = gsap.timeline();
  tl.fromTo(ref.current, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8 });
}, { scope: ref });
```

### Tokens

- Carry over from the dashboard system: `--color-main` and `--color-main-tint` (brand violet), the radius scale (`--radius` and its multipliers), the fonts, and the `3xl` and `4xl` breakpoints.
- Landing surfaces use the `--color-landing-*` palette only. Dashboard semantic surface tokens (background, foreground, card, border, muted, secondary, accent) are not used on landing surfaces.
- The landing palette gains a full set of light values so light mode is a first class state. The polarity tokens select which set applies per section.
- The JS LANDING_THEME object is not a source of truth. It survives only where a prop needs a raw color string (react-bits, recharts) and must stay in sync with the CSS palette.

### Fonts

- Display headings use `font-rostex` for the filled form and `font-rostex-outline` for the outline form. The hero already sets this pattern: AGENT in the filled form, FINANCE in the outline form. These are the established heading typefaces.
- Body copy uses nexa through the default sans stack. Data, labels, and captions use `font-mono`.
- The placeholder section uses a `font-display` class, but the theme does not define `--font-display`. The refactor defines `--font-display` as rostex in the theme, or removes the class.

### Light and dark inversion

- Each section declares its polarity with `data-polarity="light"` or `data-polarity="dark"`. The token mapping flips under the dark ancestor, so a section keeps its identity across themes while the colors swap.
- This is a deliberate per-section flip, not a whole page token swap like the dashboard. New sections never reimplement the flip.

### Animation ownership

- Motion owns entrances, viewport-triggered and state driven reveals, and AnimatePresence transitions.
- GSAP with useGSAP owns sequenced timelines, continuous loops, and any ScrollTrigger scrub or pinning added later.
- One runtime per element. Never mix two drivers on the same element.
- No Lenis. No Three.js. No Matter.js. These are declined and should not be offered again without a specific section that genuinely needs them.
- Scroll driven effects, if added, use GSAP ScrollTrigger against native scroll.

### Reduced motion

- A shared guard honors prefers-reduced-motion. It is a partial disable, not a full one: it disables loops, parallax, blur reveals, and scroll driven effects, but it keeps gentle fades and small state transitions, and it leaves all content visible in its final state.
- The heavy effect layers (MagicRings, LightRays, blurs) are skipped entirely, and reveals resolve straight to their end state without the entrance.
- A full disable was considered and rejected, because it also removes the gentle fades that carry meaning. The shared guard drops everything heavy and keeps those fades.
- Model it on the existing hero-background check, which combines the media query with a width gate for small screens.

### Container and gutter system

- LandingContainer wraps section content: `mx-auto w-full max-w-7xl px-5 md:px-8 3xl:max-w-450 4xl:max-w-500`. Full bleed backgrounds sit outside it; text and components sit inside.
- This gives one max width and one fluid gutter scale, so typography and animated components cannot visually collide.

### Performance

- 60fps target. Only transform and opacity animate. will-change is used sparingly. useGSAP scope keeps selectors contained. Heavy visual components load lazily (hero-background already lazy loads LightRays).
- No section bundles Three.js or Matter.js.

### Conversion focus

- The primary CTA stays above the fold, static, and never obscured by an animation.
- Motion serves legibility: reveals resolve quickly (the current blur word reveal runs 0.6s) and the end state is fully readable.
- No competing auto effects sit next to the CTA.

### Mobile first

- Build and verify at 360px and 375px widths first, desktop later.
- The hero's absolute positioned columns collapse to a stacked flow on small screens; no fixed desktop widths below the breakpoints.
- Fluid type uses clamp, the existing hero heading pattern (`clamp(2.5rem,15vw,6rem)`).
- Effect layers such as MagicRings, LightRays, and heavy blurs disable below a width gate and under reduced motion.

### Replaces

- Replaces the per-section theme ternary in JS as the inversion mechanism (the manifesto section today).
- Replaces hardcoded hex and rgba colors in components (BorderGlow backgroundColor `#1a1a21`, the recharts gradient `#8b5cf6`, the AuroraBackground color arrays) with section tokens and palette references.
- Replaces mixed dashboard semantic tokens on landing surfaces (`bg-background`, `border-border`, `text-muted-foreground`, `bg-secondary`).
- Replaces repeated inline container classes with LandingContainer.
- Replaces ad hoc reduced motion checks with the shared guard.

### Enforcement

- Shared components encode the contract: LandingContainer for the width and gutter system, the section polarity wrapper for the inversion, and the reduced motion guard for accessibility.
- A section checklist in the landing area context file covers: polarity attribute set, no dashboard surface tokens, no hardcoded colors, one animation runtime per element, reduced motion guard applied, LandingContainer used, verified at mobile widths.
- Code review enforces the remainder, since Tailwind class usage cannot be linted reliably here.

### Rollout

- A single migration refactors hero and manifesto onto the standard. This migration is the same work as the first Follow-up item; it is one pass, not two. Its trigger is fixed: it runs before the next new landing section ships, so the standard is in force before the page grows and the migration cannot sit indefinitely deferred.
- New sections comply from the start. The page ships one section at a time.

### Exceptions

- None for landing sections. The dashboard remains governed by DESIGN.md. There are no exceptions to the polarity, runtime, container, or performance rules.

## Consequences

**Positive**:
- Future sections share one durable reference, so different sessions build the same way.
- The inversion, animation, and container rules end the ad hoc drift already visible across hero and manifesto.
- Performance and conversion rules protect the page's core job: turning visitors into signups.

**Negative / tradeoffs**:
- The refactor of hero and manifesto costs a small pass before the next section ships.
- Motion for reveals plus GSAP for choreography keeps two animation runtimes in the bundle, each with its own API to learn.
- Landing and dashboard now diverge on purpose, so a change that spans both touches two systems.

**Neutral**:
- New CSS variables and light values are added to the landing palette in globals.css.
- New sections must set the polarity attribute and use LandingContainer from the start.
- The landing tokens and the JS constants object must stay in sync.

## Follow-up

- [ ] Refactor hero and manifesto onto the standard (polarity tokens, LandingContainer, no dashboard surface tokens, no hardcoded colors) as one migration.
- [ ] Define `--font-display` as rostex in the theme or remove the font-display class from the placeholder section.
- [ ] Add full light values to the `--color-landing-*` palette and wire the polarity token mapping in globals.css.
- [ ] Create LandingContainer and the reduced motion guard as shared components.
- [ ] Keep the JS LANDING_THEME object in sync with the CSS palette for prop values, or replace it with a runtime lookup of the CSS custom properties.
- [ ] Verify the root layout wrapper (`grid grid-rows-[auto_1fr] h-svh`) does not constrain landing scrolling; address it if it does.
- [ ] Lenis declined. Revisit smooth scroll only if a future pinned or scrubbed section demands it.
- [ ] Three.js and Matter.js declined. Revisit only when a specific section genuinely needs one.
- [ ] The awwwards-animations skill is installed but not referenced in the web context file. Add it to `apps/web/AGENTS.md` so future landing animation work loads its conventions.
- [ ] Landing is a public page. SEO, metadata, and social card conventions are out of scope for this design system spec and should get their own decision.

**Rationale**: Reasoning and options: see rationale.md.
