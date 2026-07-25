# Remove the coverage card and its API block

## Description
Delete "Cobertura do previsto" end to end — the card, its API block, its
tooltip copy and its tests. The owner judged it valueless: it reports
bookkeeping hygiene ("have you entered everything yet?"), not financial
health.

Two consequences to carry through in the same change:

**The grid re-flows on its own.** `Board/style.module.scss` has no per-card
placement — `.grid` is `repeat(3, 1fr)` at `lg` and the cards are plain
children. Today the last row is Folga · Uso da meta · Cobertura with Objetivos
orphaned below. Removing one child makes it Folga · Uso da meta · Objetivos.
**No SCSS change is needed or wanted.** This is what delivers the owner's
"mova o KPI de objetivos para o lugar".

**Four `MonthPoint` fields become dead.**
`realIncome` / `realExpense` / `estimatedIncome` / `estimatedExpense` exist
solely to feed `buildCoverage` — the types.ts comment above them says as much
("The screen ignores these; the coverage block needs them"). Verified by grep:
outside `coverage.helper.ts` their only appearances are `series.helper.ts`
writing them, and zeroed test fixtures. `incomeEstimated` / `expenseEstimated`
are computed inside `buildSeries` from its LOCAL `Sums`, not from these
fields, so the charts and `firstEstimatedMonth` are unaffected. Drop them, and
the payload stops shipping four unread numbers per month of the range.

This task is pure deletion — no behaviour is added. Everything still on screen
must look and compute exactly as before.

## When to run
- Depends on: none
- Parallel-safe with: none (task 02 edits `types.ts`, `payload.helper.ts`,
  `hints.ts` and `Board/index.tsx` too — run it after this one merges)

## How-to

### Delete outright
- `src/app/_components/DashboardScreen/components/CoverageCard/` — the whole
  folder (`index.tsx`, `hook.ts`, `hook.test.ts`, `style.module.scss`)
- `src/app/api/dashboard/coverage.helper.ts`
- `src/app/api/dashboard/coverage.helper.test.ts`

### Edit
- `src/app/_components/DashboardScreen/components/Board/index.tsx` — drop the
  `CoverageCard` import and the `<CoverageCard coverage={data.coverage} />`
  line (currently line 71). Leave `style.module.scss` alone.
- `src/app/api/dashboard/types.ts`:
  - remove the `CoverageMonth` type and the `coverage: {…}` field of the `ok`
    variant;
  - remove the four unreconciled `MonthPoint` fields and the comment block
    above them that explains why they exist;
  - the `dashedFrom` comment ends with "The coverage card is what explains why
    it started where it did" — that sentence is now false. Replace it with a
    standalone note, e.g. "An under-recorded past month is what starts the
    dashed run early." The user-facing `HINTS.cumulative` copy already stands
    on its own and needs no change.
- `src/app/api/dashboard/payload.helper.ts` — drop the `buildCoverage` import
  and the `coverage:` line. The `PayloadInput` type and every other field stay.
- `src/app/api/dashboard/series.helper.ts` — stop returning the four fields
  from `buildSeries`'s mapped object (lines 83–86). Keep the local `Sums`
  type, `accumulate`, and the `estIncome > realIncome` / `estExpense >
  realExpense` comparisons exactly as they are — they still drive `income`,
  `expense` and both `*Estimated` booleans.
- `src/app/api/dashboard/series.helper.test.ts` — drop the four assertions on
  those fields (lines 31–34); the surrounding case keeps its
  income/expense/estimated assertions.
- `src/app/api/dashboard/fixtures.helper.ts` — drop the four zeroed fields
  from the `point()` factory and reword its comment, which currently reads
  "slack cares about `cumulative`, coverage about the four unreconciled sums".
- `src/app/api/dashboard/payload.helper.test.ts` — delete the
  `it("scores coverage over elapsed months only", …)` case (around line 64).
  Every other case in the file stays.
- Three local point factories carry the same four zeroed fields — drop them
  from each:
  `src/app/_components/DashboardScreen/chart-frame.helper.test.ts` (13–16),
  `src/app/_components/DashboardScreen/components/BalanceLineChart/hook.test.ts`
  (15–18),
  `src/app/_components/DashboardScreen/components/MonthlyBarChart/hook.test.ts`
  (18–21).
- `src/app/_components/DashboardScreen/hints.ts` — remove the `coverage` entry.
  Leave the other seven untouched.

### Do NOT touch
`src/app/_components/DashboardScreen/list-cards.helper.ts` — `sharePercent` is
still used by `SlackCard` (and task 02 will use it for the goals meter), and
`MeterList` / `MeterRow` are still shared by Slack and Limit.

### Verify
Run from inside the task worktree, not the main checkout:

```bash
npm run db:setup && npm run lint && npm run test && npx tsc --noEmit && npm run build
```

- `npm run test` from the main checkout globs `.claude/worktrees/*` and
  reports other branches' tests as your own — the count must come from inside
  the worktree.
- `npm run lint` has a pre-existing error baseline in
  `.design-sync/gen-cards.mjs`. Report NEW errors only, and never run
  `npm run lint:fix` (it rewrites the whole repo and pulls that baseline into
  the diff).
- `npm run db:setup` is required in every fresh worktree — the SQLite file is
  gitignored and not shared across worktrees.

Then confirm nothing survives:

```bash
grep -rin "coverage\|cobertura" src/
```

Expect zero hits.

### Browser check
`preview_start`'s `{name}` launcher always runs from the MAIN checkout, so it
will not preview the worktree. Start the dev server manually from inside the
worktree on a spare port, then `preview_start` with
`{url: "http://localhost:<port>"}`. Confirm on `/`:

- the last card row is Folga de gastos · Uso da meta mensal · Objetivos at
  desktop width, with no empty grid cell and no orphan row;
- no console error and no failed `/api/dashboard` request;
- the two charts still render, and the dashed run on "Saldo acumulado" starts
  at the same month it did before (it is driven by `incomeEstimated` /
  `expenseEstimated`, which this task does not touch — a shift there means the
  `buildSeries` edit went too far).
