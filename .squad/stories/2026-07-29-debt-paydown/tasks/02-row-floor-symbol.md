# One symbol for RowGrid's one-line floor

## Outcome
- RowGrid's one-line floor is written once, as a Sass symbol in `src/styles/`.
- `_tiers.scss`'s first tier and both screens' two-column container queries are
  derived from that symbol, not hand-copied.
- Moving the symbol moves all three thresholds together; no comment is left
  asking a human to re-derive a number.
- Closes `.squad/debt.md:33`.

## Context

**The chain, verified:** `1016 = 2 × ((439 + 1) + 48) + 24 + 16` — twice the
one-line floor plus each card's 48px of padding, the 24px grid gap, and 16px of
slack. The floor itself is never written as `440` anywhere in CSS; it exists only
as `439 + 1`, the complement of the first tier's `max-width`.

Three literal encodings of one number today:
- `src/components/RowGrid/_tiers.scss:20` — `@container (max-width: 439px)`
- `src/components/EntryScreen/style.module.scss:33` — `@container (min-width: 1016px)`
- `src/app/configuracoes/_components/SettingsScreen/style.module.scss:29` — `@container (min-width: 1016px)`

and the only thing keeping the last two in sync is a comment,
`EntryScreen/style.module.scss:26-27`:
> Both numbers move together; re-derive this one whenever RowGrid's first tier moves.

**Imitate** the one existing precedent for a shared Sass value —
`src/styles/_theme.scss:9-22`, which is also the only `$variable` in the repo:
```scss
@use "sass:map";

// Compile-time only (CSS custom properties can't hold media-query lengths).
$breakpoints: (
  "sm": 480px,
  "md": 768px,
  "lg": 1024px,
  "xl": 1280px,
);

@mixin bp($name) {
  @media (min-width: map.get($breakpoints, $name)) {
    @content;
  }
}
```
Its header comment states the constraint that forces a Sass symbol rather than a
token: *"Compile-time only (CSS custom properties can't hold media-query
lengths)."* The same is true of `@container` preludes — a `var(--…)` cannot be
used there, so `_theme.scss`'s `@function token($name)` is not an option.

**Reuse** the load path that already makes this work from any depth —
`next.config.ts` sets `sassOptions.loadPaths: ["src/styles"]`, so
`@use "theme" as t;` resolves from any `.module.scss`. A container query consumes
a Sass number by interpolation: `@container (min-width: #{…})`.

- **Watch out for** the off-by-one. `_tiers.scss` is `max-width: 439px` while the
  floor is 440px; whatever shape you choose must keep the tier strictly below the
  floor, or a row exactly at the floor picks the collapsed tier and
  `row-columns.spec.ts`'s one-line assertions redden.
- **Watch out for** `_tiers.scss:38-39`, which justifies the *second* tier (279px)
  against `row-columns.spec.ts`'s `FLOOR = 100`. That is a different number and a
  different constraint — it is not part of this chain.
- **Watch out for** the two screens' comments: they each spell the arithmetic out
  in prose. Once the number is derived, prose that re-derives it by hand is the
  same debt in a new place.
- **Verify with** `npm run lint`, `npm run test:e2e`.

## Scope
- In: `src/styles/` (the new symbol), `src/components/RowGrid/_tiers.scss`,
  `src/components/EntryScreen/style.module.scss`,
  `src/app/configuracoes/_components/SettingsScreen/style.module.scss`, and the
  comments in those three files.
- Out: `src/components/RowGrid/style.module.scss`'s `--icon-btn-size` values, the
  279px second tier, and `$breakpoints` itself. `src/styles/README.md` and
  `src/styles/docs/*.mdx` — the symbol is a layout constant, not a design token,
  and does not earn a Foundations page.

## Verify
```
npm run lint
npm run test:e2e
```
Then prove the derivation actually holds rather than trusting the arithmetic:
serve the app and read back the computed thresholds, or temporarily change the
symbol and confirm all three queries move. `e2e/row-columns.spec.ts` is the
regression net — its `puts a wide row on one line` and `keeps a readable name`
tests both depend on a row landing in the tier it expects.

## Forbidden
- Do not turn the floor into a CSS custom property. It is consumed inside
  `@container` preludes, where custom properties do not resolve.
- Do not move the 1016 derivation into JavaScript or duplicate it in
  `chart.config.ts`.
- Do not change any threshold's effective value in this task — this is a
  refactor; the rendered breakpoints must be byte-identical before and after.
- Do not add a `--size-*` token family for it.
