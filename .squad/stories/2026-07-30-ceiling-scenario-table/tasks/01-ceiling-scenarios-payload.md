# Each ceiling month carries both cumulative scenarios

## Outcome
- `GET /api/dashboard` returns, per remaining month, four new cents figures: the
  cumulative balance and the leftover under "every month spends its ceiling",
  and the same pair under "every month spends the average ceiling".
- `worstAhead` and `remaining` are gone from the payload — nothing renders them
  after task 02, and their room is what keeps `types.ts` under the cap.
- The per-month `budget` figures are byte-identical to today's.

## Context
The ceiling arithmetic itself does NOT change (owner's decision): keep
`suffixMinimum`, the `red` short-circuit and `Math.floor((4 * gap) / 5)` exactly
as they are. `worstAhead` stays as a LOCAL in the loop — only the emitted field
goes.

- **Reuse** `buildCeiling(points: MonthPoint[], currentMonth: number): Ceiling`
  in `src/app/api/dashboard/ceiling.helper.ts`. Its first act is
  `const ahead = points.filter((point) => point.month >= currentMonth);` — the
  new figures are indexed over `ahead`, not over `points`.
- **Watch out for** what `cumulative` means: `series.helper.ts` seeds
  `let cumulative = 0;` at the RANGE start, so `ahead[i].cumulative` already
  carries every month before the current one. It is an absolute period-to-date
  balance, never rebased. That is the right seed here — do not re-derive it.
- **Watch out for** ordering: `average` is `rates(Math.floor(total / months.length))`
  and `total` is only known after the main loop, so the average scenario needs a
  second pass over `months`. The ceiling scenario can ride the existing loop.
- **The contract** (`i` indexes `ahead`, `A = average.monthly`, all cents):
  ```
  ceilingBalance[i] = ahead[i].cumulative - sum(budget[j] for j < i)
  ceilingLeft[i]    = ceilingBalance[i] - budget[i]
  averageBalance[i] = ahead[i].cumulative - A * i
  averageLeft[i]    = averageBalance[i] - A
  ```
  `authorised` in the existing loop is already `sum(budget[j] for j <= i)`, so
  `ceilingLeft[i]` is `ahead[i].cumulative - authorised` read AFTER the
  `authorised += budget` line.
- **Watch out for** the sign asymmetry, and do not "fix" it: `ceilingLeft` can
  never go negative (the budget is floored against a suffix minimum that is
  itself <= `cumulative`), while `averageLeft` can, whenever income is
  back-loaded. The card's red state in task 02 exists for the average column.
- **Reuse** the shape in `src/app/api/dashboard/types.ts`:
  `export type CeilingMonth = { month: number; budget: number; ... }` — replace
  the two removed fields with the four new ones, same `// cents` comment style.
- **Watch out for** `pace.helper.ts:26` — `ceiling.months.reduce((sum, month) => sum + month.budget, 0)`
  then `Math.floor(total / (PACE_DIVISOR * ceiling.months.length))`. It reads
  only `.budget` and `.length`, so it must keep returning the same number.
  `goals.helper.ts` never touches the ceiling.
- **Verify with** `npm run lint` and `npm run build` — both exist and both run.
  There is no unit runner and no `typecheck` script; `next build` IS the
  type-check.

## Scope
- In: `src/app/api/dashboard/ceiling.helper.ts`, `src/app/api/dashboard/types.ts`,
  and a new sibling `*.helper.ts` or `*.types.ts` if either crosses 100 lines.
- Out: `series.helper.ts`, `pace.helper.ts`, `goals.helper.ts`, `payload.helper.ts`,
  `service.ts`, anything under `src/app/_components/`, anything under `e2e/`.
  Task 02 owns the card; it will not compile against the old fields until then,
  and that is expected inside the story branch.

## Verify
- `npm run lint`
- `npm run build`
- `wc -l src/app/api/dashboard/*.ts` — `types.ts` is at exactly 100 today and
  `ceiling.helper.ts` at 95, so BOTH are one comment away from the cap. If either
  crosses, split per ARCHITECTURE: move the scenario pass to a sibling
  `ceiling-scenarios.helper.ts`, or move the `Ceiling`/`CeilingMonth`/`CeilingRates`
  trio to `ceiling.types.ts` and import it directly at each site (no re-export).
- Arithmetic check against the running app rather than by hand: start the dev
  server, read the dashboard request the page actually issues (browser preview
  network panel or `src/lib/api.ts` call sites), then confirm on the response
  that for every month `ceilingLeft === ceilingBalance - budget`, that
  `averageLeft === averageBalance - average.monthly`, and that
  `ceilingBalance[i+1] - ceilingLeft[i] === averageBalance[i+1] - averageLeft[i]`
  (both equal that month's own balance).

## Forbidden
- Changing any `budget` value, the 80% decay, the suffix minimum or the `red`
  short-circuit — a diff in the per-month ceilings means the task went wrong.
- Clamping `averageLeft` at zero, or introducing a second average definition.
  `average.monthly` stays the one `floor(total / months.length)`.
- Reintroducing `worstAhead`/`remaining` under new names.
