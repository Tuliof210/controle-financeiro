# Drop the coverage card, deepen the goals card

## Description
The dashboard's "Cobertura do previsto" card told the owner what share of the
elapsed months' commitments had actually been recorded. In practice it earned
no decision: it answers a bookkeeping-hygiene question, not the
"are we financially healthy / how much room do we have" question the product
exists for. The owner asked to remove it.

Removing it also frees the third slot of the last `lg` row (today
**Folga · Uso da meta · Cobertura**, with **Objetivos** orphaned on a row of
its own). "Objetivos" moves up into that slot — the grid auto-flows, so this
is a consequence of the deletion, not a layout change.

"Objetivos" is the thinnest card on the board: name, target, `~N meses`. It
also sits next to a number the API already computes and the UI never shows —
`pace`, the monthly saving rate every projection is built on. This story fills
its body with the data the owner selected:

1. **The saving pace as a headline** — `R$ 1.240,00` + a muted line naming
   where it comes from. Today that number exists only inside a tooltip, as a
   formula.
2. **A meter per goal**, in the same visual language as the two sibling cards:
   the bar is how much of the target the global period actually funds
   (`pace × months remaining ÷ target`), green when it reaches the target
   inside the period, red when it does not.
3. **The completion month** — `conclui em Mar/28` instead of only `~7 meses`;
   `além do período` when it lands past the global range end.
4. **The monthly amount that would close it inside the period** — shown only
   on the goals the current pace does not close.

Ordering changes from creation order to soonest-first, so the top row is
always the next goal to land.

Removing coverage also strands four `MonthPoint` fields
(`realIncome`/`realExpense`/`estimatedIncome`/`estimatedExpense`): the
coverage block was their only production consumer — `incomeEstimated` /
`expenseEstimated` are derived from local sums inside `buildSeries`, not from
them. They go too, so the payload stops shipping four unread numbers per
month.

## Acceptance Criteria
- [ ] No "Cobertura do previsto" card renders anywhere on the dashboard, and
      `GET /api/dashboard` no longer returns a `coverage` key.
- [ ] At `lg` the last card row reads **Folga de gastos · Uso da meta mensal ·
      Objetivos**, with no empty cell and no orphan row below it.
- [ ] "Objetivos" opens with the saving pace as a money headline plus a muted
      line explaining it is 25% of the period's tightest slack month.
- [ ] Each goal renders as a meter row: goal name, `accrued de target`, a bar
      whose length is the share of the target the period funds, `~N meses`,
      and the completion month.
- [ ] The bar is green exactly when the goal closes inside the global period,
      red otherwise — and the row's own text says which, never colour alone.
- [ ] A goal the current pace does not close inside the period also shows the
      monthly amount that would (`precisaria de R$ X/mês`).
- [ ] With a saving pace of 0, every row reads
      `inalcançável no ritmo atual` with an empty red bar — no crash, no `NaN%`
      width, no division by zero.
- [ ] Goals are ordered by months-to-target ascending, unreachable ones last.
- [ ] With no goals saved, the card still shows the pace headline and the
      existing "Adicione um em Configurações" empty state.

## Definition of Done
- [ ] `npm run lint` reports no NEW errors versus the pre-change baseline
      (`.design-sync/gen-cards.mjs` errors are pre-existing — do not "fix"
      them, and do not run `npm run lint:fix`, which rewrites the whole repo).
- [ ] `npm run test` green, measured from INSIDE the task worktree (a run from
      the main checkout globs `.claude/worktrees/*` and counts other branches'
      tests).
- [ ] `npx tsc --noEmit` clean.
- [ ] `npm run build` succeeds.
- [ ] Both cards verified live in the browser preview (dashboard with goals
      saved, and with the pace at 0), in light and dark theme.
- [ ] No `coverage` identifier survives anywhere under `src/`.

## Tasks
- [ ] tasks/01-remove-coverage.md — delete the coverage card, its API block
      and the four MonthPoint fields it was the only consumer of
- [ ] tasks/02-goals-card-depth.md — pace headline, per-goal meter, completion
      month and required monthly amount in the Objetivos card
