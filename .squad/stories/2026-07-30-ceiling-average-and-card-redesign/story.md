# Teto de Gastos: average ceiling + card redesign

## Why
The card names this month's extra-spending figure and lists the months ahead,
but nothing on screen says whether this month is generous or mean next to the
rest of the period. The owner cannot tell a spike from the norm, and the month
that actually caps the figure is buried in a prose line under the headline.

## Acceptance Criteria
- [ ] A second headline, "Média dos tetos", shows the raw mean of every remaining
      month's own ceiling, with its own weekly and daily splits.
- [ ] The current month's headline carries a chip saying how many times that
      average it is (e.g. "4,2× a média"); the average carries a chip with how
      many months remain.
- [ ] The month capping this month's figure, and the current month itself, read
      as badges in the card header — the prose horizon line is gone.
- [ ] Each row's bar measures that month's own ceiling as a share of that
      month's worst balance ahead, with a dashed marker where the average lands
      on the same axis.
- [ ] Rows read `<ceiling> · restam <x> · teto <y>`, the current month is badged
      "Atual", and future months keep their hatched fill.
- [ ] A legend strip sits above the rows; a footer states how many of the total
      months are on screen and what the bars are scaled to.
- [ ] The whole card reads in light and dark, at 375px and 1440px, without
      scrolling sideways.

## Definition of Done
- [ ] `npm run lint` is clean
- [ ] `npm run build` succeeds
- [ ] `npm run test:e2e` is green

## Tasks
- [x] tasks/01-ceiling-average-payload.md — `buildCeiling` returns the mean of every month's budget
- [x] tasks/02-header-badges-and-average-headline.md — SectionCard header slot, header badges, two-column hero
- [ ] tasks/03-rows-legend-footer.md — rebuilt rows with the average marker, legend strip, footer
- [ ] tasks/04-e2e-average.md — end-to-end proof the average is the mean of the months on screen
