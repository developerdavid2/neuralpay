# Rationale: 0001 Landing page design system

## Context

The landing page is the public face of NeuralPay and it is a work in progress. Hero and manifesto are partially built, and more sections are coming, built by different sessions. The dashboard has DESIGN.md as its durable design reference; the landing has none, so every section invents its own choices. The drift is already visible in code: the hero mixes landing tokens with dashboard tokens, the manifesto implements a one off light and dark flip with a theme ternary, colors are hardcoded as hex in several components, the palette has no light values, and the layout is desktop first.

The design intent is a soft and warm feel that still reads as high fintech capability, with cybernetic and geometric visuals. The page is a conversion focused marketing page, so animation must serve legibility and CTA visibility rather than compete with them, and it must hold 60fps on mobile. Both light and dark mode are required, with a deliberate inversion rule: a section that is dark in light mode becomes light in dark mode, and the reverse. That is a per section contrast flip, not a whole page token swap.

Two animation libraries are already installed and in use. Motion runs the hero and manifesto reveals. GSAP with useGSAP runs the neural card timeline and pulse loop. The risk is not choosing between them, it is letting each future section reach for whichever library is top of mind and end up with two competing scroll systems or two drivers on one element. The animation skill in the repo also offers Lenis, Three.js, and Matter.js, which would be easy to add and expensive to carry.

No build approach is recorded in the project context, so this standard follows the user's stated delivery: the page ships one section at a time and the standard must be usable before the next section is built. The dashboard keeps its own document, DESIGN.md, and this standard does not touch it.

## Options considered

### Inversion mechanism

**Option: Section polarity tokens plus data attribute.** The section declares its polarity, CSS maps it to background, surface, and ink tokens, and the dark ancestor flips the mapping.
Pros: one mechanism, automatic inversion, cannot be skipped.
Cons: new CSS variable mapping to learn, extra tokens in the theme.

**Option: JS theme ternary per section.** Each section reads the resolved theme and picks its colors, as the manifesto does today.
Pros: no new machinery.
Cons: every section reimplements the flip, easy to drift or skip, and the manifesto already shows the pattern.

**Option: Dashboard style dark variant classes on one palette.** A fixed token set flipped with dark classes.
Pros: familiar to the team.
Cons: it is a whole page token swap and cannot express a deliberate per-section contrast flip, which is the core requirement.

### Animation ownership

**Option: Motion plus GSAP split.** Motion owns reveals, entrances, state driven effects, and AnimatePresence. GSAP owns timelines, loops, and ScrollTrigger scrub or pinning.
Pros: each library does what it is best at, and the split matches what the code already does.
Cons: two runtimes, two APIs.

**Option: GSAP and ScrollTrigger for everything.**
Pros: one runtime, strongest scroll choreography.
Cons: a heavy API for simple reveals.

**Option: Motion for everything.**
Pros: one React native runtime.
Cons: weak for precise scrubbing and pinning.

### Smooth scroll

**Option: Adopt Lenis scoped to the landing.**
Pros: premium scroll feel, integrates with ScrollTrigger.
Cons: a second scroll driver, extra bundle, and perceived latency on a conversion focused page.

**Option: Skip Lenis, native scroll.**
Pros: one scroll system, no extra bundle.
Cons: no smooth scroll polish.

### 3D and physics

**Option: Neither Three.js nor Matter.js.**
Pros: small bundle, no mobile GPU risk, and the existing react-bits toolkit (Strands, MagicRings, BorderGlow, FlutedGlass, AuroraBackground, LightRays) plus SVG clip-path geometry already delivers the cybernetic look.
Cons: no true 3D element.

**Option: Adopt Three.js.**
Pros: real 3D visuals.
Cons: roughly 150kb or more of bundle and mobile GPU cost a conversion page does not need.

**Option: Adopt Matter.js.**
Pros: physics driven elements.
Cons: another animation runtime with no current section that needs it.

### Token carry over

**Option: Carry over the short list.** Brand violet, radius scale, fonts, and the 3xl and 4xl breakpoints carry over; the landing palette stays the only surface source.
Pros: brand and type consistency with the smallest net new set.
Cons: landing and dashboard diverge on purpose.

**Option: Also reuse dashboard surface tokens.**
Pros: one token set.
Cons: values tuned for a data dense dashboard leak into a marketing page, and the polarity tokens overlap them.

### Light mode palette

**Option: Add full light values to the landing palette.**
Pros: light mode is a first class state, which the inversion rule requires.
Cons: more tokens to maintain.

**Option: Keep the landing palette dark only.**
Pros: cheapest.
Cons: light mode stays half done and every section must patch over it.

### Container system

**Option: LandingContainer component.**
Pros: one max width and one fluid gutter scale, no drift across sections, and it keeps typography and animated components from colliding.
Cons: a new shared component.

**Option: Keep inline classes.**
Pros: nothing new to build.
Cons: every section repeats the classes and gutters drift, which the hero and manifesto already show.

### Migration of existing sections

**Option: Refactor hero and manifesto onto the standard.**
Pros: the standard is demonstrated in the first shipped sections and the page is not left mixed.
Cons: a small pass before the next section.

**Option: Grandfather them, forward only.**
Pros: no rework.
Cons: the page stays mixed until a later pass.

### Reduced motion

**Option: Shared guard, partial disable.** The guard honors prefers-reduced-motion by disabling loops, parallax, blur reveals, and scroll driven effects while keeping gentle fades and small state transitions, and it leaves all content visible in its final state.
Pros: one behavior everywhere, drops everything heavy, keeps the gentle fades that carry meaning, and formalizes what hero-background already does ad hoc.
Cons: a shared utility to build.

**Option: Fully disable animation.**
Pros: simplest.
Cons: loses even the gentle fades that carry meaning, which is exactly the tradeoff this decision avoids.

### Enforcement and rollout

**Option: Document and enforce going forward.** New sections comply, existing violations tracked as debt.
Pros: no coordinated rework.
Cons: the refactor debt sits in the code.

**Option: Document and migrate now.** One coordinated pass aligns everything.
Pros: no mixed state remains.
Cons: a focused migration effort.

**Option: Document only.**
Pros: cheapest.
Cons: relies on code review alone, highest drift risk across sessions.

## Rationale

The page is built across sessions, so the standard must be hard to skip, which is why the polarity data attribute carries the inversion rather than JS. A section that forgets the attribute reads as the neutral background instead of a wrong color, and a section that sets it gets the flip for free.

Motion plus GSAP formalizes what the code already does instead of fighting it. The neural card timeline and the pulse loop are GSAP work, the reveals are Motion work, and each library is strongest in its own lane. Lenis, Three.js, and Matter.js are declined because the page is conversion focused and mobile first, the existing react-bits toolkit already delivers the cybernetic visual language, and every extra runtime costs the bundle and the mobile GPU. Recording the decline prevents the animation skill from reoffering them on every section.

The short carry over list keeps the brand violet and the type system consistent while letting the landing palette stay landing shaped. Full light values make the inversion rule real rather than theoretical. LandingContainer stops the gutter drift that already exists between hero and manifesto. The reduced motion guard is a partial disable on purpose: full disable is simple but it strips the gentle fades that carry meaning, so the guard drops loops, parallax, blur reveals, and scroll driven effects while keeping those fades and keeping every element visible. Refactoring hero and manifesto now means the standard ships with the next section instead of being documented ahead of it, and the migration is the same work as the first Follow-up item with a fixed trigger: it runs before the next new landing section ships, so it cannot sit deferred.

For enforcement, the migration plus going forward approach is the strongest option that still lets the page ship one section at a time. Shared components carry the contract, the checklist catches the rest in review, and the spec is the durable reference future sessions read.
