# A spending ceiling that survives being spent every month

## Why
The "Folga de gastos" card answers a question nobody asked. Every month's
figure is computed against an untouched baseline, so the N numbers on screen
are mutually exclusive — spending month 1's folga invalidates every later
month's. The owner reads that list, with its `/sem` and `/dia` splits, as a
recurring monthly budget, which is the one reading the formula cannot support.

## Acceptance Criteria
- [ ] The card is titled "Teto de Gastos" and leads with ONE labelled figure:
      how much can be spent extra EVERY month, from the current month to the
      end of the period, without any month's projected balance going under.
- [ ] That figure is actually survivable when spent every month. With
      projected cumulative balances of 1000/1200/1500 the card shows 400 per
      month, where the current card shows 800.
- [ ] Every month still gets a bar, now showing how much of that month's own
      projected balance survives the ceiling. The month that pins the ceiling
      is the shortest bar and reads 20%.
- [ ] When no ceiling exists, the card names the first month that closes in
      the red and by how much, instead of one generic sentence.
- [ ] The tooltip states the horizon the figure is valid for, and no longer
      describes the old per-month formula.
- [ ] The Objetivos card still renders and its captions no longer say "folga".

## Definition of Done
- [ ] `npm run lint` exits 0
- [ ] `npx tsc --noEmit` exits 0
- [ ] `npm run test` green — with no `next dev` running in this directory
- [ ] The new spec is proven non-vacuous: deleting the `(i + 1)` divisor from
      the ceiling formula must turn it red

## Tasks
- [ ] tasks/01-ceiling-formula.md — replace the suffix minimum with a minimum
      of ratios, and reshape the payload around one figure
- [ ] tasks/02-ceiling-card.md — hero figure plus survival bars, renamed, with
      copy that matches the new arithmetic
- [ ] tasks/03-ceiling-e2e.md — the first dashboard spec, pinning the formula
      to a seeded, known balance
