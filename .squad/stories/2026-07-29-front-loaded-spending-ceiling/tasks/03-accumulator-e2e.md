# The spec pins the accumulator, not the flat rate

## Outcome
- `npm run test:e2e` is green.
- The ceiling spec fails when the accumulator's subtraction is removed from the
  payload's budget recursion, and passes again when it is restored.
- The red-month and horizon-label behaviours stay pinned exactly as today.

## Context
This suite's convention is that a spec names the mutation it is built to kill —
`ceiling.spec.ts:17-24` does it for the formula being replaced. Keep it: state in
the header which mutation the new assertions catch.

### What goes red and why — `ceiling.spec.ts:44-73`
```ts
  const monthly = months[0].cumulative - months[0].remaining;
  months.forEach((month, index) => {
    expect(month.remaining).toBe(month.cumulative - monthly * (index + 1));
    expect(month.remaining).toBeGreaterThanOrEqual(0);
  });
  ...
  expect(((fillBox?.width ?? 0) / (trackBox?.width ?? 1)) * 100).toBeCloseTo(20, 0);
```
Both pin the old promise of one flat rate spent every month. The 20% geometry read
goes with it: with a per-month figure only the FIRST row lands on 20% of its own
worst balance and later rows shrink geometrically — assert it on the first row
instead of the last, or drop the geometry read entirely.

### The new invariants, all derivable from the rows alone
Reading `budget`, `remaining` and `worstAhead` off each bar's accessible name:
- `remaining[i] === worstAhead[i] - sum(budget[0..i])` for every i. **This is the
  assertion the mutation must break**: drop the `- C` term and every budget becomes
  `0.8 * worstAhead`, so by the second row the running sum already exceeds that
  month's worst balance and `remaining` goes negative.
- `remaining[i] >= 0` for every i.
- `budget[i] === Math.floor(4 * (worstAhead[i] - sum(budget[0..i-1])) / 5)` — this
  is what pins the 80% share itself.
- `worstAhead` is non-decreasing down the rows: a property of a suffix minimum.
- The headline equals `budget[0]`, read the same way as `ceiling.spec.ts:60-61`.

### The accessible-name contract task 02 writes
```
`${label}: gasto extra ${budget}, restam ${remaining} de ${of}`
```
`readMonths` (`e2e/ceiling-page.helper.ts:43-53`) splits on `/restam | de /` today
and must learn the third value. `parseCents` (lines 15-18) stays as-is — it reads
the sign from the string because `formatMoney` emits U+2212, not a hyphen, so a
negative survivor would otherwise parse as positive and the assertion built to
catch it would pass.

### The fixture already produces a usable shape — no new one needed
`e2e/ceiling.helper.ts` seeds cumulative 100000 / 120000 / 150000 then flat to the
range end, clock-relative on purpose (`shift(CURRENT, n)`) so the range never falls
out of `out_of_range`. Rising-then-flat gives a strictly positive figure in every
row and a `worstAhead` that both rises and plateaus. `beforeAll` order is
load-bearing (`ceiling.spec.ts:26-32`): `seed()` then `seedCeiling()`, because the
range is derived from EVERY row in the shared DB.

### Watch out for
- Derive every expected number from what the page shows; never hardcode a month or
  a cents value. The only legitimate hardcoded amounts are the red holes in
  `ceiling.helper.ts:11-12`, which the fixture pins directly.
- `ceiling.spec.ts` is already over the repo's 100-line file cap on main (`wc -l`
  it). The new invariant checks belong in `ceiling-page.helper.ts` as a reusable
  assertion so the spec stays assertions and neither file grows past the cap —
  adding a new spec FILE is worse, because `fullyParallel` is unset and worker
  count scales with file count, which loads every other spec harder.
- `settle` (`e2e/settle.helper.ts:21`) before any geometry read, and never
  `retries`.
- `expect(card.getByRole("img")).toHaveCount(0)` is how the red-month test proves
  the empty state. That behaviour is unchanged by this story, so that test should
  need no edit — if it does, the finding belongs to task 01.

## Scope
- In: `e2e/ceiling.spec.ts`, `e2e/ceiling-page.helper.ts`.
- Out: `e2e/ceiling.helper.ts` (the fixture), `e2e/seed.helper.ts`,
  `e2e/settle.helper.ts`, `playwright.config.ts`, every other spec, all of `src/`.

## Verify
```
wc -l e2e/ceiling.spec.ts e2e/ceiling-page.helper.ts
npm run lint
npx playwright test e2e/ceiling.spec.ts
npm run test:e2e
```
Then prove the spec actually bites: temporarily drop the accumulator's subtraction
from the budget recursion in `src/app/api/dashboard/ceiling.helper.ts`, confirm
`npx playwright test e2e/ceiling.spec.ts` goes red, and revert with
`git checkout -- src/`.

## Forbidden
- No `retries`, no `test.slow`, no `page.waitForTimeout`.
- Do not touch `src/` to make a test pass — a wrong payload is task 01's finding.
- Do not assert on `sustainable` or on anything in the Objetivos tab.
- Do not reseed, clear or write to the shared DB beyond the two existing seeders.
