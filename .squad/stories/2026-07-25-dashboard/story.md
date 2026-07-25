# Dashboard

## Description

The app's home route (`src/app/page.tsx`) is still a `<h1>Dashboard</h1>` stub.
This story turns it into the observability screen the product is built around —
a NewRelic/Datadog-style board of cards that answers "are we financially
healthy right now, and how much room is there to spend?" (see
`.squad/PRODUCT.md`).

### Domain semantics (settled with the owner — read this first)

Two entities feed every number on this screen:

- **`Recurrence` = "estimado"** — *known commitments*: income/expenses the
  owner already knows will happen (salary, rent, a financed purchase). It is
  **not** a budget or a forecast to be scored for accuracy. `valueCents` is
  **per active month**, never a total spread across `months[]`.
- **`Movement` = "real"** — what was actually recorded for a single month.

The two are reconciled per month **and per type** by a *most-complete-picture
wins* rule the owner specified:

```
effectiveIncome(M)  = max( Σ real income(M),  Σ estimated income(M) )
effectiveExpense(M) = max( Σ real expense(M), Σ estimated expense(M) )
balance(M)          = effectiveIncome(M) − effectiveExpense(M)   // may be negative
```

If the recorded actuals already exceed the commitments, the actuals are the
truth. If they fall short, the month either has not happened yet or has not
been fully recorded — so the commitments are the better truth. Every card,
both charts and the safe-to-spend list use these effective values, never raw
`Movement` or `Recurrence` sums.

This same rule is what makes the chart annotations meaningful: a month whose
estimate beat its actuals is *projection*, not history — that is why its bar
renders at 50% opacity and why the cumulative line goes dashed from the first
such month onward.

The x-axis of everything is the **global range** `Settings.rangeStart ..
Settings.rangeEnd`, enumerated by the existing `buildMonths` helper. Every
total is clamped to that range, including "Valor Total" — rows can exist
outside the range (nothing server-side clamps `Movement.month` or
`RecurrenceMonth.month`), and they are deliberately excluded so that all nine
cards describe one single universe.

### What gets built

One new endpoint, `GET /api/dashboard?owner=<personId|familia>`, does **all**
of the aggregation server-side and returns a single ready-to-render payload.
The screen renders it; it computes nothing beyond formatting. The endpoint
honours the active header profile (`ProfileProvider`), reusing `visibleFor`
from `src/lib/ownership.ts` — "Família" sees every owner, a person sees only
their own entries.

Nine cards, each with an info tooltip in its header explaining the logic
behind it:

| Card | Content |
|---|---|
| Entradas / Saídas / Saldo (×3) | Valor Total (whole range), Valor Atual (range start → current month), média, desvio padrão, mediana of the monthly effective series |
| Evolução mensal (bar chart) | Per month of the range, a non-cumulative income bar and an expense bar; a bar whose estimate beat its actuals renders at 50% opacity |
| Saldo acumulado (line chart) | One point per month for the cumulative balance, connected; solid until the first month where the estimate beat the actuals, dashed from there on |
| Folga de gastos | From the current month to the range end: what is safe to spend that month, plus its weekly (÷4) and daily (÷30) split |
| Uso da meta mensal | Every month of the range: what % of `Settings.monthlyGoalCents` the effective expense consumed. ≤ 100% good, > 100% bad |
| Cobertura do previsto | Across elapsed months, how much of the known commitments has actually been recorded — a stale-data signal, not an accuracy score |
| Objetivos | For each `Goal`, how many months until it is reached at the current saving pace |

**Safe-to-spend (folga)** — the one genuinely novel formula. Spending `X` in
month `M` lowers the cumulative balance of `M` *and every month after it*, so
the ceiling for `M` is the worst cumulative balance still ahead of it, with a
20% safety margin:

```
slack(M) = max(0, floor(0.8 × min(cumulative(i) for i in [M .. rangeEnd])))
weekly(M) = floor(slack(M) / 4)      daily(M) = floor(slack(M) / 30)
```

A suffix minimum is non-decreasing as `M` advances, so `slack` never drops
month over month, and `min(slack)` is always the current month's — the
implementation still takes an explicit minimum (correct regardless of that
property, and it is literally what the owner asked for).

**Saving pace** for the Objetivos card is `floor(0.25 × min(slack))` — a
quarter of the tightest month in the list. `months = ceil(target / pace)`, or
"inalcançável no ritmo atual" when `pace` is 0.

### Charts

visx (`@visx/scale`, `@visx/shape`, `@visx/axis`, `@visx/group`,
`@visx/responsive`, all `^4.0.0` — React 19 is in their declared peer range).
Chosen over Recharts/hand-rolled SVG for composability: the two annotation
rules (per-bar opacity, mid-series solid→dashed break) are per-primitive props
in visx rather than escape hatches. Every colour, stroke and font is a
`var(--token)` passed straight into SVG presentation attributes — no
hardcoded values, no library theme to fight.

`@visx/tooltip` and `@visx/grid` are deliberately **not** added: SVG `<title>`
covers per-datum hover natively, and grid rows are a `<line>` per tick.

### Out of scope

No schema change, no migration, no write path — the dashboard is read-only.
No repository filtering is added: the whole dataset is a few hundred rows for
one family, so `list()` + in-memory aggregation is correct and the endpoint
issues four unfiltered reads.

## Acceptance Criteria

- [ ] `GET /api/dashboard?owner=familia` returns a `200 { data }` envelope
      whose payload carries the whole board; `?owner=<personId>` returns the
      same shape restricted to that person's entries; a missing/blank `owner`
      returns `422 { error: { message, code: "validation" } }`.
- [ ] Every monthly figure on the screen equals `max(real, estimated)` for
      that month **and type**, with `Recurrence.valueCents` counted once per
      active month.
- [ ] The three stat cards show Valor Total (whole range), Valor Atual (range
      start → current month inclusive), média, desvio padrão and mediana of
      the monthly effective series; the Saldo card renders negative values
      with a sign and a ▼ glyph, never colour alone.
- [ ] The bar chart plots one income bar and one expense bar per month of the
      range, non-cumulative; a bar whose estimate beat its actuals renders at
      50% opacity, and a bar whose actuals won renders fully opaque.
- [ ] The line chart plots the cumulative balance per month as connected
      points, solid up to the first month where the estimate beat the actuals
      and dashed from that month onward; with no such month the whole line is
      solid.
- [ ] The Folga card lists every month from the current month to the range
      end with its total, weekly and daily safe-to-spend figures, computed by
      the suffix-minimum formula above.
- [ ] The Uso da meta card lists every month of the range with the % of
      `monthlyGoalCents` consumed by that month's effective expense, visually
      distinguishing ≤ 100% from > 100%; with no monthly goal saved it renders
      an empty state pointing at Configurações.
- [ ] The Cobertura card reports, over elapsed months only, how much of the
      known commitments has been recorded, and lists the months still short.
- [ ] The Objetivos card lists each `Goal` with the months remaining at the
      current pace, or "inalcançável no ritmo atual" when the pace is 0; with
      no goals saved it renders an empty state.
- [ ] Every card exposes an info tooltip in its header explaining how its
      number is derived, reachable by both hover and keyboard focus.
- [ ] Switching the header profile between Família and a person re-fetches
      and re-renders the whole board.
- [ ] With `rangeStart`/`rangeEnd` unset (or inverted), the screen renders a
      single explanatory empty state linking to `/configuracoes` instead of
      any card.
- [ ] With the current month outside the global range, the screen renders a
      single explanatory empty state naming the range and the current month,
      instead of any card.
- [ ] A failed fetch renders an error message — `apiGet` never rejects, so
      `result.error` is checked before `result.data` is used.

## Definition of Done

- [ ] `npm run lint` reports **exactly** the 2 pre-existing errors in
      `.design-sync/gen-cards.mjs` (1 `assist/source/organizeImports`, 1
      formatter) and nothing new. The tree is not green today — do not claim
      it is.
- [ ] `npm run test` is green, 16 pre-existing files / 95 tests still passing
      plus the new suites.
- [ ] `npx tsc --noEmit` reports **exactly** the 1 pre-existing error
      (`theme.helper.test.ts(21,22): TS2345`) and nothing new. There is no
      `typecheck` npm script — cite the raw command.
- [ ] `npm run build` passes (green on `main` today; Next only typechecks
      bundled files, which is why it passes while `tsc --noEmit` does not).
- [ ] Every new file is ≤ 100 lines and every new function ≤ 100 lines —
      Biome enforces both with `maxLines: 100` and there are **no**
      `overrides` to escape into.
- [ ] Every new component is the mandated three-file folder
      (`index.tsx` render-only / `hook.ts` / `style.module.scss`); no
      hardcoded colour, spacing, radius, shadow or duration anywhere,
      including inside SVG.
- [ ] All new derivation logic lives in pure `*.helper.ts` / `service.ts`
      modules with colocated `*.test.ts` — component tests are impossible
      today (Vitest runs in the `node` environment; no jsdom, no
      `@testing-library/react`).
- [ ] The board has been driven in the browser against real data and the
      empty states (no range, current month out of range, no goals, no
      monthly goal) verified.

## Tasks

- [x] tasks/01-money-and-series-api.md — move the money helper to `src/lib/`, add signed/grouped display formatters, and ship `GET /api/dashboard` with the monthly effective series, cumulative balance and the three statistic blocks
- [x] tasks/02-slack-limit-coverage-goals-api.md — extend the payload with safe-to-spend, monthly-goal usage, commitment coverage and goal projections
- [x] tasks/03-card-tooltip.md — add a `Tooltip` component and a `hint` slot on `SectionCard` so every card can explain its own logic
- [ ] tasks/04-dashboard-screen-stats.md — build `DashboardScreen` (fetch, profile, empty/error states) and the three Entradas/Saídas/Saldo stat cards
- [ ] tasks/05-dashboard-charts.md — add visx and the two charts: grouped bars with 50%-opacity projections, cumulative line with a solid→dashed break
- [ ] tasks/06-dashboard-list-cards.md — the four list cards: folga, uso da meta mensal, cobertura do previsto and objetivos
