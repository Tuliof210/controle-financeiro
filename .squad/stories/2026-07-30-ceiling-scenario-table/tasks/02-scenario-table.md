# Replace the meters with the two-scenario table

## Outcome
- The card renders no bar and no legend; the month list is a table whose two
  column groups are "Se cada mês gastar o teto" and "Se cada mês gastar a média",
  each holding SALDO ACUM. / (TETO DO MÊS | MÉDIA) / SOBRA.
- The current month's row is marked; a negative SOBRA is readable without colour.
- `MeterList/`, `MeterRow/` and `list-cards.helper.ts` no longer exist.
- The two headlines, the header badges, the "Ver todos" toggle and the
  "N de M meses" count behave exactly as today.

## Context
Imported design (claude.ai/design, `Teto de Gastos.dc.html`). Header, the two
headlines and the badges in it are what the card already renders — leave
`components/Hero/` and `_badges.scss` alone. The design's own footer
(premise + delta line) is explicitly OUT: the owner declined it, and its delta
would be ~R$ 0,00 here anyway because `average.monthly * n` IS the ceiling total.

- **Imitate** `src/app/leitor-ofx/.../ReportView/components/MonthTable/` — the
  repo's only dense numeric table, a real `<table>` with `<caption>` and
  `<th scope="col">`, wrapped in a `.wrap` div. Its stylesheet is the exemplar:
  ```scss
  .table { width: 100%; border-collapse: collapse; font-family: var(--font-mono); font-size: var(--text-sm); }
  th, td { padding: var(--space-2) var(--space-3); text-align: right; white-space: nowrap;
           font-variant-numeric: tabular-nums; border-bottom: var(--border-1) solid var(--color-border-subtle); }
  thead th { color: var(--color-text-muted); font-family: var(--font-display); font-size: var(--text-2xs); }
  ```
  Do NOT copy its `.wrap { overflow-x: auto; }` — the owner declined horizontal
  scroll. The two-level header is a second `<tr>` in `<thead>`, the group row
  using `colspan`/`scope="colgroup"`.
- **Watch out for** `<dd>`: `e2e/ceiling-average.helper.ts` reads the card's
  headlines as `card.locator("dd").first()` and `.nth(1)`. The table must not
  introduce a `<dl>`/`<dd>` anywhere, and `Hero` must stay the card's first child.
- **Watch out for** the collapse mechanism. The design collapses at a viewport
  width, which lies here: the card sits inside `Overview`'s `@include t.bp("lg")`
  grid, so it is narrow exactly when the viewport is wide. Use a container query
  on the table's own wrapper, imitating `src/components/RowGrid/style.module.scss:18`
  (`container-type: inline-size;`) plus `RowGrid/_tiers.scss`'s
  `@container (max-width: …)` tiers. Pick the threshold from a measurement (see
  Verify), never from the design's 820px.
- **Below the threshold** each row stacks and every figure keeps a VISIBLE label
  (owner's decision), so the numbers are never orphaned from the header. Column
  association must survive for a screen reader at every width — a visually-hidden
  `<thead>` plus per-cell `::before { content: attr(data-label) }` keeps the table
  semantics; `display: none` on the `<thead>` does not.
- **Reuse** `formatMoney` in `src/lib/money.ts`:
  `export const formatMoney = (cents: number): string` — negatives already come
  back signed with U+2212 (`−R$ 640,00`, not a hyphen), which is the second
  non-colour signal. Pair it with a third per styles README 7c: the repo's two
  precedents are `StatCard/hook.ts:28-32` (a `▲`/`▼` glyph) and this card's own
  `_badges.scss` `.limit` (a `::before` square — never `--radius-full`, rule 2).
- **Reuse** `useShowAll` (`../../show-all.hook.ts`, `CAP = 8`) and
  `../ShowAllToggle` unchanged, and keep `count` in `hook.ts`. Drop `scaleNote`
  ("Barras em % do saldo de cada mês") and the `markLabel`/`percent`/`mark`/
  `projected` fields — all bar-only.
- **Update** `HINTS.ceiling` in `src/app/_components/DashboardScreen/hints.ts`:
  its last clause, "meses futuros aparecem hachurados", describes the deleted
  bars. `HINTS.bars` and `HINTS.cumulative` belong to other cards — leave them.
- **Watch out for** the file caps: `CeilingCard/style.module.scss` is at 98 and
  `hook.ts` at 96. The table is a child component
  (`CeilingCard/components/MonthTable/`, three files) per ARCHITECTURE's recursion
  rule, which is also where its CSS goes; a `_*.scss` mixin partial beside it is
  the sanctioned overflow valve. Biome never reads `.scss` — `wc -l` by hand.
- **Verify with** `npm run lint`, `npm run build` (there is no typecheck script).

## Scope
- In: `src/app/_components/DashboardScreen/components/CeilingCard/index.tsx`,
  `hook.ts`, `style.module.scss`, a new `components/MonthTable/`;
  deletion of `components/MeterList/`, `components/MeterRow/` and
  `src/app/_components/DashboardScreen/list-cards.helper.ts`; the one
  `HINTS.ceiling` string.
- Out: `components/Hero/`, `_badges.scss`, `SectionCard`, `Headline`,
  `ShowAllToggle`, `show-all.hook.ts`, every other dashboard card, `e2e/`
  (task 03 owns the suite and it stays red until then), the API.

## Verify
- `npm run lint` and `npm run build`
- `wc -l` every touched file, `.scss` included — 100 is the cap.
- Browser preview on `/`: at 375, 767, 768, 1024 and 1440 assert
  `document.documentElement.scrollWidth - document.documentElement.clientWidth <= 0`.
  This is the check `e2e/row-overflow.spec.ts` cannot do for you — `/` is
  deliberately absent from its `ROUTES` (see `.squad/debt.md`), so a sideways
  scroll here ships with a fully green suite.
- In the same session, measure the CARD's own width (not the viewport) at those
  five widths and set the container-query threshold from what you read; screenshot
  the collapsed and expanded states.
- Confirm by keyboard that "Ver todos" still reaches and expands the list.

## Forbidden
- `overflow-x: auto` on the table or any ancestor, and `overflow: hidden` on
  `SectionCard` (its stylesheet says why: it would clip the Tooltip focus ring on
  all 13 cards).
- A `<dl>`/`<dd>` inside the table, or moving `Hero` off the card's first slot.
- Money at `--text-2xs`; the smallest money in the repo is `--text-sm`, and
  `--font-display` is for short uppercase eyebrows only (styles README rule 4).
- Colour as the only signal on a negative SOBRA (rule 7c).
- Touching the ceiling arithmetic or any `budget` value.
