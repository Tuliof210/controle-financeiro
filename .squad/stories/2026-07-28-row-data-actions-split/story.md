# Split every actionable row into a data half and a controls half

## Why
The three rows that carry edit/delete CTAs emit six flat cells straight into the
`<li>`, so "the data" and "the controls" exist only as column numbers — there is
no element you can point at for either half. The row should read as two halves:
everything descriptive on the left, the controls flushed to the far right.

## Acceptance Criteria
- [ ] Every row with edit/delete on `/movimentacoes`, `/recorrencias` and
      `/configuracoes` holds exactly two elements inside its `<li>`: a data
      wrapper and a controls wrapper.
- [ ] The controls sit flush at the row's right edge, the data at the left.
- [ ] Names and amounts still line up across sibling rows of the same list, at
      both 1440px and 375px.
- [ ] Narrow widths still stack as designed, and nothing overflows horizontally
      at 375 / 768 / 1024.
- [ ] The two icon buttons stay on one line, 8px apart, 44px each.

## Definition of Done
- [ ] `npm run lint` clean and `npm run test` green (both confirmed to exist).
- [ ] `wc -l` on every touched file, `.scss` included — Biome does not read
      stylesheets, so the 100-line cap fails nothing on its own.

## Tasks
- [x] tasks/01-two-wrappers-per-row.md — the two wrappers and the one-line
      layout, with the nested subgrid keeping columns aligned across rows
- [x] tasks/02-stacked-mode-across-wrappers.md — split the narrow-width stack
      between the `<li>` and the data wrapper
- [ ] tasks/03-guard-gutters-and-pair.md — e2e floor on the half-to-half gap and
      on the control pair, which nothing asserts today
