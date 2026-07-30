# Dashboard in one scroll, with three time-to-goal metrics

## Why
The dashboard hides two thirds of itself behind tabs nobody remembers to click,
and one of those thirds — "Meta mensal" — is a hand-typed number the owner never
maintains. What is actually wanted from the goals is not a coverage bar but an
answer to "when does this land", asked three ways: alone, sharing the month with
every other goal, and queued one at a time.

## Acceptance Criteria
- [ ] The dashboard has no tab bar. One scroll shows, in order: hero, KPIs,
      "Evolução mensal", "Saldo acumulado", "Teto de Gastos", then the savings
      capacity banner and the goal cards.
- [ ] "Meta mensal" exists nowhere: not on /configuracoes, not on the dashboard,
      not in the API, not in the database.
- [ ] The savings capacity reads 25% of the average of every monthly ceiling
      figure from the current month to the end of the global period.
- [ ] Each goal card shows its name, its target, and three lines — dedicated,
      parallel, one-at-a-time — each with a month count and a completion month.
- [ ] A period with no ceiling at all leaves every goal reading "ritmo zero"
      instead of a number.

## Definition of Done
- [ ] `npm run lint` — exit 0, no more infos than the run on `main`
- [ ] `npm run build` — passes (the only typecheck; proves no dangling
      `monthlyGoalCents` / `sustainable` / `accruedCents` reference survives)
- [ ] `npm run test` — the whole Playwright suite green, including the new spec

## Tasks
- [x] tasks/01-remove-monthly-goal.md — delete "Meta mensal" from UI, payload, API and schema
- [x] tasks/02-flatten-dashboard.md — drop the tab bar, render one column in the agreed order
- [x] tasks/03-capacity-from-ceiling-average.md — pace becomes 25% of the mean monthly ceiling
- [x] tasks/04-goal-time-metrics.md — three time-to-complete metrics per goal, in payload and on the card
- [x] tasks/05-e2e-goal-metrics.md — a spec that pins the three metrics against each other
