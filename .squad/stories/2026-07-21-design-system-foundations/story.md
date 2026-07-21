# Design System foundations: tokens + theming + Storybook (no components)

## Description

Instantiate the project's Design System as a **constitution only** — the
non-negotiable foundation tokens and rules, plus a Storybook that documents
them as living docs. **No UI components are built in this story** (that's
future work); the deliverable is the token layer, the theming mechanism, the
written rules, and the Storybook that renders them.

The visual language is derived from a set of reference screens the owner
liked. Distilling the common denominator (and discarding the outliers):

- **Shape — angular, contained.** Sharp/near-square corners (radius capped at
  6px), borders treated as structure, surface tiers for elevation. Explicitly
  **no** heavy neo-brutalist offset shadows; blur-shadows allowed only on
  floating layers (menu/popover/modal/toast). Corner-tick framing is an
  optional decorative accent, not a core rule.
- **Typography — retro/pixel.** `Press Start 2P` for short display/eyebrow
  text only; `JetBrains Mono` for all UI text and numbers, with
  tabular-numerals mandatory on money.
- **Color — few hues, very vivid, on extreme neutrals.** Brand violet, accent
  lime, magenta for gradients, over a near-black ↔ warm off-white neutral
  ramp. Money semantics: positive = green, negative = red, caution = amber.
- **Theme — light and dark are both first-class**, driven by the same
  semantic tokens with per-theme values.
- **Order — vivid but disciplined**: a closed 4px spacing grid and layout
  breakpoints keep it structured, never messy.

The DS must land on the existing stack conventions (see
`.squad/ARCHITECTURE.md`): Sass Modules for component styling, `@/` → `src/`
alias, files kept small. Because Sass variables are compile-time, runtime
light/dark theming requires **CSS custom properties** as the single source of
truth — authored in **global `.scss`** (still emitted as CSS custom
properties at runtime), consumed by `.module.scss` via a thin SCSS helper
layer.

**Explicitly out of scope:** any DS UI component (Button, Card, etc.), any
`*.stories.tsx` component story, any app screen/redesign, any change to the
existing pages beyond wiring global styles/fonts. Storybook contains
**foundations MDX docs only**.

### Locked decisions (owner-approved)

- Typography: `Press Start 2P` (display, short titles/eyebrows only) +
  `JetBrains Mono` (UI + numbers). Loaded via `next/font/google`.
- Money color semantics: green (positive) / red (negative) / amber (caution).
- Visual volume: **angular-contained** — sharp corners + thin structural
  borders, **no hard offset shadows**; elevation via border + surface tiers,
  soft shadow only for floating layers.
- Tooling: CSS custom properties as single source of truth + a thin SCSS
  helper layer (mixins/functions that make the rules mechanically reusable) +
  Storybook `@storybook/nextjs-vite` with Foundations MDX docs.
- Theme default: respect `prefers-color-scheme`, overridable via a
  `data-theme` attribute on `<html>`.

## Acceptance Criteria

- [ ] A global token layer under `src/styles/` defines, as CSS custom
      properties, **every** foundation category: color (primitive ramp +
      semantic: bg/surface/surface-raised, text/text-muted, border/
      border-subtle, brand, accent, positive, negative, caution, info, focus,
      gradients), typography (font families, size scale, weights,
      line-heights, letter-spacing), spacing (closed 4px scale), radius
      (0/2/4/6 + documented `full` exception for avatars/dots), border widths
      (1/2/3), elevation (flat/raised/overlay), motion (durations + easings +
      reduced-motion handling), and z-index scale.
- [ ] Every semantic token is defined for **both** themes (`:root` = light
      default, `[data-theme="dark"]` overrides), and the default respects
      `prefers-color-scheme`. A test enforces light/dark parity.
- [ ] A thin SCSS helper layer (`src/styles/_theme.scss` or equivalent)
      exposes at least: a breakpoint mixin, a focus-ring mixin, an elevation
      mixin, and typed token access — consumable from any `.module.scss` via
      `@use`.
- [ ] `Press Start 2P` + `JetBrains Mono` are loaded via `next/font/google`
      and exposed as `--font-display` / `--font-mono`; the base layer applies
      the mono font + token-driven colors to `html/body` in both themes.
- [ ] The written **DS constitution** (non-negotiable rules) lives in-repo
      (`src/styles/README.md`), and `.squad/ARCHITECTURE.md` + `CLAUDE.md`
      point to it / describe the styling-token convention.
- [ ] Storybook runs (`npm run storybook`) and builds
      (`npm run build-storybook`), rendering **Foundations** MDX docs for
      each token category, with a working **light/dark toggle**
      (`data-theme`). No component stories exist (stories glob is `*.mdx`
      only).
- [ ] `npm run lint`, `npm run test`, and `npm run build` are all green.

## Definition of Done

- [ ] All acceptance criteria met.
- [ ] No DS UI component and no `*.stories.tsx` introduced — foundations MDX
      only.
- [ ] Existing pages still render; the only change to them is global
      style/font wiring in the root layout.
- [ ] All new `.storybook/*.ts` files pass Biome (formatted, ≤100 lines);
      token `.scss` is organized for human readability even though Biome does
      not lint it.
- [ ] Tokens are the single source of truth — no hardcoded color/space/radius
      values anywhere the DS layer introduces; components (future) must
      consume tokens via the helper layer.
- [ ] Every `@storybook/*` package and `storybook` core are pinned to the
      exact same version (10.5.3).

## Tasks

- [x] tasks/01-design-tokens-theming.md — Author the CSS-custom-property
      token layer + per-theme values + SCSS helper mixins + `next/font`
      wiring + base/reset + the DS constitution doc + a light/dark parity
      test. No Storybook.
- [ ] tasks/02-storybook-foundations-docs.md — Install & configure Storybook
      10.5.3 (`@storybook/nextjs-vite`) with the theme toggle and author the
      Foundations MDX docs that render the Task 01 tokens. Depends on Task 01.
