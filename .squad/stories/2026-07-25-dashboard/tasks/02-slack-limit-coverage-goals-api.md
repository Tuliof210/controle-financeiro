# Dashboard API: folga, uso da meta, cobertura e objetivos

## Description

Task 01 shipped `GET /api/dashboard?owner=` with the per-month effective
series, the cumulative balance and the three statistic blocks, and declared
the four remaining payload fields as empty placeholders. This task fills them
in. No route change, no contract change — the types already exist in
`src/app/api/dashboard/types.ts`.

All four blocks read the `MonthPoint[]` that task 01 already computed. None of
them re-derives anything from `Movement` / `Recurrence` — if you find yourself
re-summing raw entries, you are duplicating `buildSeries`.

### 1. Folga de gastos (safe-to-spend)

The one genuinely novel formula in the story, specified by the owner. Spending
`X` in month `M` lowers the cumulative balance of `M` **and every month after
it**, so the ceiling for `M` is the worst cumulative balance still ahead of
it, with a 20% safety margin:

```
slack(M)  = max(0, floor(0.8 × min(cumulative(i) for i in [M .. rangeEnd])))
weekly(M) = floor(slack(M) / 4)
daily(M)  = floor(slack(M) / 30)
```

The window is inclusive of `M` itself. The list runs from the current month to
the range end. Note the shape this produces: a suffix minimum is
non-decreasing as `M` advances, so `slack` never drops month over month — that
is a property of the formula, not a bug to "fix". Compute it as an actual
suffix minimum (one right-to-left pass), which is both what the owner asked
for and correct regardless.

### 2. Ritmo de poupança (feeds the Objetivos card)

```
pace = floor(0.25 × min(slack(M) for every M in the list))
```

A quarter of the tightest month in the folga list. Because `slack` is
non-decreasing, that minimum is the first entry — take the real minimum
anyway. `slack` is clamped at 0, so `pace >= 0`.

### 3. Uso da meta mensal

`Settings.monthlyGoalCents` is read here as a **monthly spending ceiling**:
for every month of the range, what percentage of it the month's effective
expense consumed. ≤ 100% is good, > 100% is bad — the card renders the
polarity, this task only produces the numbers. Covers the **whole range**, not
just future months.

```
percent(M) = goalCents ? Math.round(expense(M) / goalCents × 100) : null
```

`monthlyGoalCents` can be `null` (never saved) — then `goalCents` is `null`,
every `percent` is `null`, and the card shows an empty state.

### 4. Cobertura do previsto

A **stale-data signal**, not an accuracy score: across elapsed months only,
how much of the known commitments has actually been recorded as movements.
"março tem R$ 4.200 previstos e só R$ 900 lançados" means March needs
attention, not that a forecast was wrong.

Elapsed months are `rangeStart .. min(currentMonth, rangeEnd)` inclusive.
Per month, summing both types:

```
committed(M) = estimatedIncome(M) + estimatedExpense(M)
recorded(M)  = min(realIncome(M), estimatedIncome(M))
             + min(realExpense(M), estimatedExpense(M))
gap(M)       = committed(M) − recorded(M)          // always >= 0
```

`recorded` is capped per type at the commitment so that overspending in one
category cannot mask an unrecorded commitment in another. Aggregate
`percent = committed > 0 ? Math.round(recorded / committed × 100) : null`, and
list only the months where `gap > 0`, sorted by `gap` descending.

**This needs data `MonthPoint` does not carry.** `MonthPoint` only exposes the
reconciled `income` / `expense`, not the four raw sums. Extend
`buildSeries`'s return so the raw estimated and real sums per month are
available — either add them to `MonthPoint` (simplest; the screen ignores the
extra fields) or have `buildSeries` also return a parallel raw-sums array.
Prefer adding four fields to `MonthPoint` (`realIncome`, `realExpense`,
`estimatedIncome`, `estimatedExpense`) — it keeps one array, one type, and the
accumulator already holds exactly those four numbers. Update
`types.ts` and `series.helper.test.ts` accordingly.

### 5. Objetivos

For each `Goal` (`{ id, name, targetCents }`, no deadline exists on the
entity):

```
months = pace > 0 ? Math.ceil(targetCents / pace) : null
```

`null` means "inalcançável no ritmo atual". `Goal` rows have no `ownerId`, so
they are **not** filtered by `owner` — goals are family-wide. Keep the
`goalRepository.list()` order (`createdAt asc`).

## When to run

- Depends on: task 01 (owns `types.ts`, `service.ts`, `series.helper.ts`)
- Parallel-safe with: task 03 (`Tooltip`) — disjoint files

## How-to

### Files

```
src/app/api/dashboard/slack.helper.ts          # + .test.ts — folga + pace
src/app/api/dashboard/limit.helper.ts          # + .test.ts — uso da meta mensal
src/app/api/dashboard/coverage.helper.ts       # + .test.ts — cobertura do previsto
src/app/api/dashboard/goals.helper.ts          # + .test.ts — projeção dos objetivos
```

Edited: `types.ts` (four new `MonthPoint` fields), `series.helper.ts` +
its test (emit them), `service.ts` (call the four helpers, drop the empty
placeholders), `service.test.ts` (assert the wired-up values).

Four small helper files rather than one — `noExcessiveLinesPerFile`
(`maxLines: 100`, no `overrides`) leaves no room for a combined module once
the tests are counted, and each block is independently reviewable.

### Exact types (copy into `types.ts` verbatim — task 01 declared these)

```ts
export type SlackMonth = {
  month: number;   // YYYYMM
  total: number;   // cents, >= 0
  weekly: number;  // floor(total / 4)
  daily: number;   // floor(total / 30)
};

export type LimitMonth = {
  month: number;
  spent: number;             // effective expense of the month, cents
  percent: number | null;    // null when monthlyGoalCents is unset
};

export type CoverageMonth = {
  month: number;
  committed: number;
  recorded: number;
  gap: number;     // committed - recorded, > 0 for every entry in the list
};

export type GoalProjection = {
  id: string;
  name: string;
  targetCents: number;
  months: number | null;     // null when pace is 0
};
```

### Signatures

```ts
// slack.helper.ts
buildSlack(points: MonthPoint[], currentMonth: number): SlackMonth[]
savingPace(slack: SlackMonth[]): number

// limit.helper.ts
buildLimit(points: MonthPoint[], goalCents: number | null): { goalCents: number | null; months: LimitMonth[] }

// coverage.helper.ts
buildCoverage(points: MonthPoint[], currentMonth: number): { committed: number; recorded: number; percent: number | null; months: CoverageMonth[] }

// goals.helper.ts
projectGoals(goals: Goal[], pace: number): GoalProjection[]
```

All pure, all take the already-computed `MonthPoint[]`, none touch a
repository — that is what makes them testable under the current toolchain
(Vitest runs in the `node` environment; there is no jsdom and no
`@testing-library/react`, so anything not extracted to a pure module has zero
coverage).

### Rounding

Everything is integer cents. `Math.floor` for the safe-to-spend divisions
(`0.8 ×`, `/ 4`, `/ 30`, `0.25 ×`) — always round a spending allowance *down*.
`Math.round` for the two percentages. `Math.ceil` for months-to-goal — always
round a wait *up*. Do not use `Math.trunc`; it is `formatCents`' formatting
concern, not a rounding policy, and it differs from `floor` on negatives.

### Tests to write

`slack.helper.test.ts`
- an all-positive cumulative series → every month's slack is 80% of the
  smallest cumulative from that month on
- a dip in the middle → months before the dip are capped by it, months after
  it are not
- an all-negative cumulative series → every slack is `0`, and `weekly` /
  `daily` are `0` too (never negative)
- `currentMonth` in the middle of the range → the list starts there, not at
  `rangeStart`
- `currentMonth === rangeEnd` → a one-entry list
- floor behaviour: a total that does not divide evenly by 4 or 30
- `savingPace` on an empty list → `0` (no division by zero)

`limit.helper.test.ts`
- `goalCents` null → every `percent` null, `spent` still populated
- expense below, exactly at, and above the goal → `< 100`, `100`, `> 100`
- zero expense → `0`
- the list covers every month of the range, in range order

`coverage.helper.test.ts`
- a month where actuals exceed commitments in one type and fall short in the
  other → `recorded` caps the excess and still counts the shortfall
- a fully recorded elapsed month → no entry in `months`
- months after `currentMonth` are excluded entirely
- `committed === 0` across all elapsed months → `percent` is `null`, not `NaN`
  and not `0`
- the `months` list is sorted by `gap` descending

`goals.helper.test.ts`
- `pace > 0` → `ceil` rounds a partial month up
- `pace === 0` → every `months` is `null`
- an empty goal list → `[]`
- a target smaller than the pace → `1`, never `0`

Follow the existing style: one `describe` per exported function named after
it, full-sentence English `it` names, `toEqual` for structures / `toBe` for
primitives (see `src/lib/months.test.ts`).

### Wiring `service.ts`

Replace the five placeholders from task 01 with real calls. `getDashboard`
already reads `settingsRepository.get()` (for `monthlyGoalCents`) and — if
task 01 included it — `goalRepository.list()`; add the goal read if it is not
there. `Goal` is family-wide: do **not** pass it through `visibleFor`.

Watch `service.ts`'s 100-line cap; if assembling the payload pushes it over,
extract the assembly into `payload.helper.ts` rather than trimming comments.

Extend `service.test.ts` with one integration-style case asserting that a
known set of movements + recurrences + settings + goals produces the expected
`slack`, `pace`, `limit`, `coverage` and `goals` — with the clock pinned via
the `now` parameter task 01 added.

### Verification

```bash
npm install && npm run db:setup && npm run lint && npm run test && npx tsc --noEmit && npm run build
```

`npm install` first: this task's branch inherits task 01's `package.json`
changes with an empty `node_modules`, and Node's parent-directory walk-up to
the main checkout can mask the gap until `next build` tries to bundle.
`npm run db:setup` too — the SQLite file is gitignored and not shared across
worktrees.

Baselines on `main` (anything beyond these is yours): `npm run lint` exit 1
with exactly 2 errors in `.design-sync/gen-cards.mjs`; `npm run test` exit 0
with 16 files / 95 tests plus whatever task 01 added; `npx tsc --noEmit` exit
2 with exactly 1 error in `theme.helper.test.ts(21,22)`; `npm run build` exit 0.

Smoke-test live, since `route.ts` has no automated coverage in this repo:
start the dev server from inside the worktree on a spare port and `curl` the
endpoint with a real range, a real monthly goal and at least one goal saved;
eyeball that `slack` is non-decreasing, that `pace` is a quarter of its first
entry, and that `coverage.months` only contains elapsed months.
