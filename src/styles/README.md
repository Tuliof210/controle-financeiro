# Design System — Foundations Constitution

Non-negotiable rules for every screen and component built in this app. This
file, plus the token layer next to it, is the single source of truth. There are
no DS components yet — only the constitution and the tokens that enforce it.

The token layer is seven files. `_tokens.scss` is an aggregator of `@use` and
holds no values; `_tokens-color.scss` (primitives),
`_tokens-dark.scss` (`@mixin dark-theme`, emits nothing on its own),
`_tokens-theme.scss` (semantic aliases, light then both dark selectors),
`_tokens-type.scss`, `_tokens-shape.scss` and `_tokens-motion.scss` hold them.
`_theme.scss` is the Sass helper layer (`bp`, `focus-ring`, `elevation`,
`token`), `_base.scss` the element reset.

**Light always precedes dark.** The Design System cards read declared values by
parsing first-wins, so a dark override placed above its light declaration is
read as the light value.

## The four pillars

- **Calm neutrals, one brand hue.** A cool neutral ramp (`--neutral-950` →
  `--neutral-50`) carries ~90% of the interface. Cobalt is the only brand
  colour and is spent with restraint — the primary action, focus, and the mark.
  Never as decorative fill.
- **Semantics speak financial state, and nothing else.** positive, negative,
  alert, info. A normal expense is **not** red; red is negative variation and
  destructive action.
- **Contained, not extruded.** Hairline borders carry separation before any
  shadow does. Corners are soft and chosen by surface type — 14 on product
  cards, 10 on controls, 6 on chips — never square. A capsule is a segmented
  pill, a progress track or a dot, and nothing else.
- **Three faces, one job each.** A display face for heros and titles, a
  grotesque for body and money, a mono scoped to eyebrows, IDs, `YYYY-MM` dates
  and hex.

## Non-negotiable rules

1. **Never hardcode** a color, spacing, radius, shadow, or duration value.
   Always a token (`var(--token-name)` in CSS/Sass, or `token("name")` /
   the dedicated mixins from `_theme.scss`). The single documented exception is
   `src/app/icon.svg`: a static asset cannot read a custom property, so its
   four hexes are kept in lockstep by hand and named in a comment there.
2. **Radius is chosen by surface type, not by taste.** Card / section / modal
   panel / KPI tile take `--radius-lg` (14); button / field / select / nav item
   / menu take `--radius-md` (10); chip / badge / swatch / tag / inner cell take
   `--radius-sm` (6); segmented pill / progress track / status dot / avatar take
   `--radius-full`; `--radius-xl` (20) is for large surfaces and sheets. An
   inner corner flush inside an outer one is **derived** —
   `calc(var(--radius-lg) - var(--border-1))` — never a second literal.
   `--border-1` is the structural border everywhere; `--border-2` is emphasis
   only (selection ring, dashed drop target, projection state).
3. **Elevation is border-first.** A surface tier (`--color-surface`,
   `--color-surface-raised`) plus a hairline is the default way to lift
   something. Reach for a shadow only when the layer genuinely floats over
   content: `--elevation-raised` is the resting card, `--elevation-overlay` the
   dropdown/popover/sheet, `--elevation-modal` the modal. Shadows are cool and
   discreet, never decorative. Those four are the whole scale: the hard offset
   shadows of the pixel-art skin are gone, tokens and mixin branches both, so
   asking the mixin for one is now a build error rather than a silent alias. A
   control's press is `transform: scale(0.985)`, not a displacement.
4. **Typography has three faces, each with one job.** `--font-display` (Clash
   Display, weight 600) is heros and titles only. `--font-sans` (Hanken
   Grotesk) is body copy, labels and **every money figure**, which additionally
   sets `font-variant-numeric: tabular-nums`. `--font-mono` (IBM Plex Mono) is
   for eyebrows in uppercase, IDs, `YYYY-MM` dates, hex, and chart axis/tag
   labels — never body copy. `text-transform: uppercase` and `--tracking-wide`
   belong to that eyebrow case and nowhere else: the wide tracking existed to
   open up a bitmap face with no sidebearing, and on a grotesque it reads as
   shouting. A status badge, a table header and a checkbox label are sentence
   case. All three faces are loaded through `next/font` (`fonts.ts`) and applied as
   variable classes in `src/app/layout.tsx` **and** `.storybook/preview.ts`;
   changing one without the other leaves Storybook unstyled. Nothing may load a
   face over the network at runtime.
5. **Spacing comes only from the 4px scale** (`--space-1` … `--space-24`).
   No ad-hoc pixel values. Interactive hit targets are at least `--size-tap`.
6. **Every semantic token exists in both themes.** Add it to the `:root` block
   in `_tokens-theme.scss` *and* to `@mixin dark-theme` in `_tokens-dark.scss`,
   which is the one place both dark selectors read — so the two can no longer
   drift apart the way the duplicated blocks they replaced did. A token that
   aliases an already-themed token (the gradients) is the documented exception:
   it flips on its own and must not be redeclared. An alias that adds no
   decision on top of the token it points at is not a token at all — the
   `--rail-*` family became five such aliases and was deleted; its eleven call
   sites read the semantic token directly.
7. **Accessibility is non-negotiable:**
   - Every interactive element has a visible focus ring
     (`@include t.focus-ring;` from `_theme.scss`). It paints `--focus-ring`, a
     translucent cobalt `box-shadow`, over a transparent `outline` — the
     outline is the forced-colors escape hatch and must not be dropped.
   - Text contrast is at least 4.5:1 (3:1 for large text) in both themes, and
     the measured ratio is written in a comment beside the token. Three of the
     target's own foregrounds are one step darker here for exactly this reason.
   - Meaning is never color-only — money pairs color with a sign and a
     ▲/▼ glyph; real / estimated / simulated pair a label with a border style.
   - Motion respects `prefers-reduced-motion` (already handled at the token
     layer — durations collapse to `0ms`).
8. **No decorative gradients, no glassmorphism, no texture.** The background is
   flat. `--glow-brand` — a cobalt radial glow on a dark hero, never on the
   mark — is the only authorised gradient. `--gradient-toxic` survives on
   borrowed time, for one consumer that has not been migrated yet.

## How components consume this

- Read colors/spacing/radius/etc. straight from the CSS custom properties:
  `background: var(--color-surface);`.
- Use the `_theme.scss` helpers for anything that needs Sass-time logic:
  `@use "theme" as t;` then `@include t.bp("md") { … }`,
  `@include t.focus-ring;`, `@include t.elevation(overlay);`.
- The `src/styles` folder is on the Sass load path (`next.config.ts`), so
  `@use "tokens"` / `@use "theme"` resolve from any `.module.scss`,
  regardless of nesting depth.
