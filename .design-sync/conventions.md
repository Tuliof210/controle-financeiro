# Controle Financeiro DS — Foundations

This design system is **foundations only**: a token layer plus a constitution.
There are **no components yet**. Every screen is built from raw elements styled
with these tokens — so the tokens *are* the design language, and using them
correctly is the whole job.

## The four pillars

- **Angular, contained.** Sharp/near-square corners, borders as structure,
  elevation via surface tiers — not heavy offset shadows.
- **Retro / pixel.** A pixel display face for short titles/eyebrows, a mono
  face for everything else, including every number.
- **Vivid on extreme neutrals.** A few very saturated hues (violet, lime,
  magenta) over a near-black ↔ warm off-white ramp.
- **Disciplined, not messy.** A closed 4px spacing grid and a fixed
  breakpoint set keep "vivid" from becoming "cluttered."

## Styling idiom — CSS custom properties, never hardcoded values

Style **only** through `var(--token)`. Never write a raw hex, px, shadow, or
duration. The token families (real names — see `tokens/tokens.css` for every
value, and the Foundations cards for a visual reference):

| Family | Tokens | Use |
|---|---|---|
| Semantic color | `--color-bg` `--color-surface` `--color-surface-raised` `--color-text` `--color-text-muted` `--color-border` `--color-border-subtle` `--color-brand` `--color-accent` `--color-positive` `--color-negative` `--color-caution` `--color-info` `--color-focus` | all UI color — these flip per theme |
| Hue primitives | `--violet-300…600` `--lime-300…500` `--green-400/500` `--red-400/500` `--amber-400/500` `--cyan-400/500` `--magenta-400/500` `--ink-050…900` `--paper` `--white` | only inside semantic tokens; prefer semantic in components |
| Gradients | `--gradient-sunset` `--gradient-toxic` | vivid accents |
| Type size | `--text-2xs` … `--text-3xl` `--text-display` | font-size |
| Type meta | `--weight-regular/medium/bold` `--leading-tight/snug/normal` `--tracking-display/normal/wide` | weight, line-height, letter-spacing |
| Space (4px grid) | `--space-1` … `--space-24` | padding, margin, gap — **nothing off-scale** |
| Radius | `--radius-0/sm/md/lg` (cap 6px) `--radius-full` (avatars/dots ONLY) | corners |
| Border | `--border-1/2/3` | border widths |
| Elevation | `--elevation-flat/raised/overlay` | overlay blur is for floating layers only |
| Motion | `--duration-fast/base/slow` `--ease-snappy/step` | transitions (collapse to 0 under reduced-motion) |
| Z-index | `--z-base/dropdown/sticky/overlay/modal/toast` | stacking |

## Typefaces

`styles.css` binds two self-hosted faces to the token variables:

- `--font-display` → **Press Start 2P**. Short display / eyebrow text ONLY —
  never body copy, never long numbers.
- `--font-mono` → **JetBrains Mono**. Everything else, including every number.
  Money values also set `font-variant-numeric: tabular-nums`.

## Non-negotiable rules

1. Never hardcode a color, space, radius, shadow, or duration — always a token.
2. Radius never exceeds `--radius-lg` (6px); `--radius-full` is avatars/status
   dots only, never rectangular surfaces.
3. Elevation is border-first: a surface tier + `--color-border` before any
   shadow. Blur (`--elevation-overlay`) is reserved for floating layers.
4. One display face, one workhorse face (see Typefaces).
5. Spacing comes only from the 4px scale (`--space-*`).
6. Every semantic token exists in both themes — light on `:root`, dark on
   `[data-theme="dark"]` and via `prefers-color-scheme`.

## Where the truth lives

- `styles.css` — the entry every design receives. Imports `tokens/tokens.css`
  (all custom properties, both themes) and `tokens/base.css` (element resets).
- The **Foundations** cards (Colors, Typography, Spacing, Radius & Borders,
  Elevation, Motion) — a visual reference for every token above.

## Idiomatic snippet

```css
.summary-card {
  background: var(--color-surface);
  border: var(--border-2) solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  box-shadow: var(--elevation-raised);
}
.summary-card__eyebrow {
  font-family: var(--font-display);
  font-size: var(--text-2xs);
  letter-spacing: var(--tracking-wide);
  color: var(--color-brand);
}
.summary-card__amount {
  font-family: var(--font-mono);
  font-size: var(--text-2xl);
  font-variant-numeric: tabular-nums;
  color: var(--color-text);
}
```
