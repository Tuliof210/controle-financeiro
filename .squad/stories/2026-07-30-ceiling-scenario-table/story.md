# Teto de Gastos: two cumulative scenarios per month, no charts

## Why
The card answers "how much extra can I spend" with one bar per month, each drawn
against a different denominator (that month's own projected balance), so no two
rows are comparable and the picture misleads. What the owner actually needs is
missing: the balance the period arrives at if every month spends its ceiling,
and the balance it arrives at if every month spends the average instead.

## Acceptance Criteria
- [ ] No bar/meter renders inside "Teto de Gastos", and the legend (Mês atual /
      Projeção / Média) is gone.
- [ ] Each month row shows, under "se cada mês gastar o teto": the cumulative
      balance arriving at that month, that month's ceiling, and what is left.
- [ ] Each month row shows, under "se cada mês gastar a média": the cumulative
      balance arriving at that month, the average ceiling, and what is left.
- [ ] Both balances compound — a row's balance is the previous row's leftover
      plus that month's own projected result, and the average scenario carries a
      different balance from the ceiling scenario whenever the two spends differ.
- [ ] A negative leftover is readable without colour vision (styles README 7c).
- [ ] The current month's row is marked as such.
- [ ] The two headlines, the header badges and the "Ver todos" toggle keep
      behaving as they do today; the only footer text is the "N de M meses"
      count — no premise line, no delta line.
- [ ] At 375px the dashboard has no horizontal page scroll, and every figure is
      still attributable to its column.

## Definition of Done
- [ ] `npm run lint` clean and `npm run build` green
- [ ] `npm run test` green
- [ ] `wc -l` on every touched file, `.scss` included, is <= 100

## Tasks
- [x] tasks/01-ceiling-scenarios-payload.md — each ceiling month carries both
      cumulative scenarios; the bar-only fields go
- [x] tasks/02-scenario-table.md — delete the meters, render the two-scenario
      table inside the card
- [x] tasks/03-e2e-scenario-table.md — re-point the ceiling/goals specs off the
      bars' aria-labels onto the table
