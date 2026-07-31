# Savings capacity and goals as one table card

## Why
The savings block reads as four unrelated boxes: an accent banner, then one bordered
card per goal in a two-column grid. Comparing goals is the whole point of the block,
and today the reader compares three funding assumptions across card boundaries. The
imported design (`Dashboard v2.dc.html`) draws one card instead: the capacity band as
its header, then a table whose three columns line every goal up against the same axis.

## Acceptance Criteria
- [ ] The savings block is ONE bordered card: accent header band, a column-header row,
      one row per goal — no per-goal card, no two-column grid.
- [ ] At >=1024px the header row reads `META / DEDICADO / EM PARALELO / UM DE CADA VEZ`
      and no per-row metric label is visible.
- [ ] Below 1024px the header row is gone and each goal's three metrics stack, each
      with its own label on the left and its value on the right — today's shape.
- [ ] Every metric keeps its bar (brand / accent / caution) and its `ritmo zero` text.
- [ ] The capacity figure, its tooltip, the two facts (OBJETIVOS, TOTAL EM METAS) and
      the empty state all still render, now inside the card.
- [ ] No horizontal overflow at 375 / 767 / 768 / 1024 / 1440.

## Owner decisions (2026-07-31)
- Collapse breakpoint is `lg` (1024px), not the design's 820px — `$breakpoints` has no
  820 entry and three date columns are too tight at 768.
- Faithful to the design: the per-row metric label is `display: none` at >=1024px, so
  it leaves the accessibility tree there and the column header is the only label.
  Accepted trade-off, not an oversight — do not "fix" it with a visually-hidden label.

## Definition of Done
- [ ] `npm run lint`
- [ ] `npx playwright test e2e/goals.spec.ts e2e/row-overflow.spec.ts`

## Tasks
- [ ] tasks/01-one-card-shell.md — the banner stops being its own card and becomes the
      header strip of a single card wrapping the goals
- [ ] tasks/02-goals-table.md — column-header row + `GoalCard` becomes a grid row
- [ ] tasks/03-goals-e2e-handles.md — realign the goals e2e helpers to the new DOM
