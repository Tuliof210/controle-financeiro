# Design System — Foundations Constitution

Non-negotiable rules for every screen and component built in this app. This
file, plus the token layer next to it (`_tokens.scss`, `_theme.scss`,
`_base.scss`), is the single source of truth. There are no DS components yet
— only the constitution and the tokens that enforce it.

## The four pillars

- **Angular, contained.** Sharp/near-square corners, borders as structure,
  elevation via surface tiers — not heavy offset shadows.
- **Retro / pixel.** A pixel display face for short titles/eyebrows, a mono
  face for everything else, including every number.
- **Vivid on extreme neutrals.** A few very saturated hues (violet, lime,
  magenta) over a near-black ↔ warm off-white ramp.
- **Disciplined, not messy.** A closed 4px spacing grid and a fixed
  breakpoint set keep "vivid" from becoming "cluttered."

## Non-negotiable rules

1. **Never hardcode** a color, spacing, radius, shadow, or duration value.
   Always a token (`var(--token-name)` in CSS/Sass, or `token("name")` /
   the dedicated mixins from `_theme.scss`).
2. **Radius never exceeds `--radius-lg` (6px).** `--radius-full` exists only
   for avatars and status dots — never for cards, buttons, inputs, or any
   other rectangular surface.
3. **Elevation is border-first.** Use a surface tier (`--color-surface`,
   `--color-surface-raised`) and a border before reaching for a shadow.
   Blur-shadow (`--elevation-overlay`) is reserved for floating layers only
   — menu, popover, modal, toast. The three hard offset shadows are
   blur-less, cast in `--color-border`, and scoped to exactly three things:
   `--elevation-press` and `--elevation-press-active` on the **primary
   action** (resting, then 2px-displaced while pressed), `--elevation-panel`
   on the **modal panel**, and `--elevation-press` on a **card carrying a
   filled surface** — either a filled header band, or a fill across the whole
   card. The fill is what declares it a headline surface, and the extrusion is
   the fill's other half. A card with no fill does not get one; it gets a
   border. Nothing else gets a hard offset shadow — everything else gets a
   border.
4. **Typography has one display face and one workhorse face.**
   `--font-display` (Press Start 2P) is for short display/eyebrow text only
   — never body copy, never long numbers. Everything else, including every
   number, uses `--font-mono` (JetBrains Mono). Money values additionally set
   `font-variant-numeric: tabular-nums`.
5. **Spacing comes only from the 4px scale** (`--space-1` … `--space-24`).
   No ad-hoc pixel values.
6. **Every semantic token exists in both themes.** A token added to `:root`
   without a `[data-theme="dark"]` counterpart is an incomplete token — nothing
   checks this for you, so add both blocks in the same edit.
7. **Accessibility is non-negotiable:**
   - Every interactive element has a visible focus ring
     (`@include t.focus-ring;` from `_theme.scss`).
   - Text contrast is at least 4.5:1 (3:1 for large text) in both themes.
   - Meaning is never color-only — money pairs color with a sign and a
     ▲/▼ glyph, not color alone.
   - Motion respects `prefers-reduced-motion` (already handled at the token
     layer — durations collapse to `0ms`).
   - Interactive hit targets are at least 44px once components exist.

## How components will consume this (once they exist)

- Read colors/spacing/radius/etc. straight from the CSS custom properties:
  `background: var(--color-surface);`.
- Use the `_theme.scss` helpers for anything that needs Sass-time logic:
  `@use "theme" as t;` then `@include t.bp("md") { … }`,
  `@include t.focus-ring;`, `@include t.elevation(overlay);`.
- The `src/styles` folder is on the Sass load path (`next.config.ts`), so
  `@use "tokens"` / `@use "theme"` resolve from any `.module.scss`,
  regardless of nesting depth.
