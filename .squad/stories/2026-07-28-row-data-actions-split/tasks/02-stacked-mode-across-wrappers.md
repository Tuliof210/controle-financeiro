# Stacked mode, split across the two wrappers

## Outcome
- Below the stack breakpoints the data cells stack as they do today — name,
  then amount, then owner, then period — inside the data wrapper, with the
  controls beside them rather than on a line of their own.
- Below 260px of row width the controls drop to their own full-width line under
  the data, as they do today.
- Nothing overflows horizontally at 375 / 768 / 1024, and column alignment is
  green at both 1440px and 375px.

## Context
Task 01 wrapped the cells, which stops every `> [data-cell="…"]` selector in
`@mixin stack` from matching. The mixin, verbatim from
`src/components/RowGrid/style.module.scss` (lines 62-99):

```scss
@mixin stack {
  grid-template-columns: auto minmax(0, 1fr) auto;
  row-gap: var(--space-1);
  > [data-cell="swatch"] { grid-area: 1 / 1; }
  > [data-cell="name"] { grid-area: 1 / 2; }
  > [data-cell="actions"] { grid-area: 1 / 3 / span 2; }
  > [data-cell="value"] { grid-area: 2 / 2; }
  > [data-cell="owner"] { grid-area: 3 / 2 / auto / span 2; }
  > [data-cell="period"] { grid-area: 4 / 2 / auto / span 2; }
  @container (max-width: 259px) {
    > [data-cell="actions"] { grid-area: auto / 1 / auto / -1; }
  }
}
@container (max-width: 659px) { .list:has([data-cell="owner"]) > li { @include stack; } }
@container (max-width: 399px) { .list:not(:has([data-cell="owner"])) > li { @include stack; } }
```

Four things do not port verbatim, and three of them fail **silently**:

- **The `<li>` stops being a subgrid in stack mode.** Line 63 overrides
  `grid-template-columns: subgrid` with three explicit tracks, so the data
  wrapper's `grid-column: 1 / -2` resolves against 3 tracks (4 lines) and means
  tracks 1-2, not 1-5. The wrapper's span must be restated per mode explicitly;
  it will not fall out of the cascade.
- **`grid-area: 1 / 3 / span 2` is meaningless now.** It spanned the `<li>`'s
  implicit rows 1-2 so the button pair sat beside name+amount. With the controls
  a sibling of one wrapper, the `<li>` has a single occupied row — the concept
  collapses to alignment on the controls sibling, not a row span. `grid-template-rows:
  subgrid` is a separate declaration and nothing in the file has it, so nothing
  inside the wrapper can span a row of the `<li>` either way.
- **The `@container (max-width: 259px)` rule moves to the `<li>`.** "Controls
  span the full width" is now a statement about the row's two-item layout, so
  the `<li>` owns it and the data wrapper must not keep its `1 / -2` span there.
- **`row-gap: var(--space-1)` moves to the data wrapper.** `gap` does not cross
  a wrapper boundary; left on the `<li>` it governs one row and the four stacked
  lines fall back to 0.

The split that has to happen: the `<li>` keeps the two-item layout, the
end-alignment, the vertical alignment of the controls, and the <260px
full-width drop. The data wrapper takes the stack track set — now two tracks,
`auto minmax(0, 1fr)`; the third `auto` was the controls' and becomes a dead
track if copied — plus the `row-gap` and every `grid-area` for
swatch/name/value/owner/period.

- The two call sites and their thresholds (659px for owner lists, 399px for the
  rest) read the LIST's width through `container-type: inline-size` on `.list`
  (line 9), which is unaffected by how deep the cells sit. Leave them as they
  are unless a measurement says otherwise.
- The widths documented in `e2e/row-columns.spec.ts`'s header (entry row 1044px
  at a 1440 viewport, Configurações 484px, both 291px at 375, the pinched
  Configurações row 148px at 768) were measured **before** the wrappers. If a
  breakpoint needs re-tuning, take the number in the browser at execution time —
  do not carry those over as given.
- `src/components/EntryScreen/style.module.scss` is coupled to the 659px floor
  by a comment and a number: `@container (min-width: 1456px)` where "1456px is
  2 × (660px of row … + 48px of card padding)". If the one-line floor changes,
  that number goes stale.
- **File size**: `RowGrid/style.module.scss` was at 99 lines before task 01 and
  Biome ignores `.scss`, so nothing fails on its own — `wc -l` it and tighten
  prose (or split to a Sass partial beside it) rather than silently overrun.
- Do not leave a manual `next dev` running from the repo root — Next 16 refuses
  a second dev server from the same directory and `npm run test` boots its own.

## Scope
- In: `src/components/RowGrid/style.module.scss`.
- Out: the three row `index.tsx` files (task 01 settled the markup — if the
  stack needs a markup change, that is a signal task 01's structure is wrong,
  not licence to reshape it here); `e2e/` (task 03); the 1456px number in
  `EntryScreen/style.module.scss` unless a measurement proves it stale.

## Verify
- `npm run lint`
- `npx playwright test row-columns.spec.ts row-overflow.spec.ts` — all cases
  green now, 1440px and 375px alike.
- `npm run test`
- `wc -l src/components/RowGrid/style.module.scss`

## Forbidden
- Adding `container-type` to either wrapper — it would re-target the 259px query
  to the wrapper's own (narrower) width, firing it early, and size containment
  fights subgrid.
- Moving the 659 / 399 / 259 thresholds without measuring in the browser first.
- Re-introducing `> [data-cell="…"]` selectors rooted at the `<li>` for data
  cells; after task 01 they belong under the data wrapper.
- Copying `grid-area: … / span 2` for the controls, or the third `auto` track.
