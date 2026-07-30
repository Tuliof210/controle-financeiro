# Re-point the ceiling and goals specs onto the table

## Outcome
- `npm run test` is green.
- The ceiling spec proves, off the rendered table: both scenarios compound, the
  leftover is the balance minus the spend on each side, the average column is one
  constant equal to the second headline, and the ceiling side never goes negative.
- Nothing in `e2e/` looks for `role="img"`, a bar fill, or the
  `": gasto extra "/", restam "/", saldo "` aria-label any more.

## Context
Every ceiling assertion today parses the bars' `aria-label`, so all of it moves.
`e2e/ceiling-page.helper.ts:48` says so itself: "The separators here are the
contract: reword `srLabel` in CeilingCard/hook.ts and every value below parses to
NaN." Task 02 deletes that DOM.

- **Rewrite** `readMonths` in `e2e/ceiling-page.helper.ts`. Today:
  ```ts
  const labels = await bars.evaluateAll((nodes) => nodes.map((n) => n.getAttribute("aria-label") ?? ""));
  return labels.map((label) => { const [budget, remaining, worstAhead] = label.split(/: gasto extra |, restam |, saldo /).slice(1);
  ```
  It becomes one object per `<tbody> <tr>`, six cents fields, read cell by cell.
- **Reuse** `parseCents` in the same file, unchanged — it already handles the
  U+2212 that `formatMoney` emits:
  ```ts
  export const parseCents = (money: string) => {
    const digits = Number(money.replace(/[^\d,]/g, "").replace(",", "."));
    return Math.round(digits * 100) * (money.includes("−") ? -1 : 1);
  };
  ```
- **Watch out for** `textContent` vs `innerText`: the collapsed layout injects the
  column label through `::before`, which `textContent` excludes and which is
  exactly the kind of adjacent-inline case the learnings line about `innerText`
  warns on. Read cells with `textContent` and locate them positionally
  (`row.locator("td").nth(n)`), not by matching their text.
- **Replace** `expectAccumulator` (`ceiling-page.helper.ts:73-94`) with the
  invariants the table actually shows, for every row `i`:
  ```
  ceilingLeft[i]    === ceilingBalance[i] - budget[i]      and >= 0
  averageLeft[i]    === averageBalance[i] - average
  average           is the same figure on every row
  ceilingBalance[i+1] - ceilingLeft[i] === averageBalance[i+1] - averageLeft[i]
  ```
  The last line is the compounding acceptance criterion: both sides differ by
  that month's own balance and nothing else.
- **Watch out for** the coverage this drops on purpose. `budget === Math.floor((4 * headroom) / 5)`
  and the suffix-minimum monotonicity were read off `worstAhead`, which task 01
  removes from the payload and task 02 stops rendering, so neither is observable
  from the screen any more — and this repo tests nothing else. Say so in the PR
  body under Known gaps rather than reaching for a unit test; there is no unit
  runner to reach for.
- **Keep** `e2e/ceiling-average.helper.ts`'s `readHero` as-is —
  `card.locator("dd").first()` / `.nth(1)` still resolve to the two headlines,
  and task 02 is forbidden from adding a `<dd>`. What changes there is
  `expectAverageStory`'s source of `budgets`, which now comes from the table.
- **Rewrite** `expandCeiling` in `e2e/goals-page.helper.ts:44-50` — it clicks
  `getByRole("button", { name: /^Ver todos/ })` (unchanged) then waits on
  `card.getByRole("img")` and returns it; it must wait on and return the rows.
  Two callers: `e2e/goals.spec.ts` and `e2e/ceiling-average.helper.ts`.
- **Rewrite** in `e2e/ceiling-expect.helper.ts`: delete `expectFirstBarFill`
  (it measures `bars.first().locator("div").first()` against the track, and the
  track is gone) and its `settle` import if it becomes the only user; in
  `expectNoCeiling`, `await expect(card.getByRole("img")).toHaveCount(0);` becomes
  an assertion that no table renders in the empty state. `expectHeaderBadges` is
  untouched.
- **Reuse** the fixtures in `e2e/ceiling.helper.ts` unchanged — `seedCeiling()`,
  `CEILING_PERSON`, `RED_PERSON`, `DIP_PERSON`, `shift(CURRENT, n)`. `DIP_PERSON`
  (cumulative 3.000 / 1.200 / 10.000, down then up) is the one fixture where the
  two scenarios visibly diverge; use it for the compounding assertion.
- **Watch out for** `.squad/debt.md`'s note that this spec reached 160 lines once:
  `ceiling.spec.ts` is at 99 and `goals.spec.ts` at 100 TODAY, and Biome reports
  the cap as `info`, so nothing stops you. Extract into the existing `e2e/*.helper.ts`
  files, and do NOT add a new spec FILE — `fullyParallel` is unset, so worker
  count scales with spec-file count and a new file loads every other spec harder.
- **Verify with** `npm run test` — it boots its own dev server on :3100 against a
  throwaway `e2e.db`. Kill any manual dev server first: Next 16 refuses a second
  one launched from the same directory even on a free port.

## Scope
- In: `e2e/ceiling-page.helper.ts`, `e2e/ceiling-expect.helper.ts`,
  `e2e/ceiling-average.helper.ts`, `e2e/goals-page.helper.ts`,
  `e2e/ceiling.spec.ts`, `e2e/goals.spec.ts`.
- Out: `e2e/ceiling.helper.ts` and `e2e/seed.helper.ts` (the fixtures stay as
  they are), `e2e/api.helper.ts`, `e2e/settle.helper.ts`, every other spec,
  `playwright.config.ts`, and all of `src/`.

## Verify
- `npm run test` — the whole suite, not just the two files.
- `wc -l e2e/*.ts` — 100 is the cap and four of these files start within a line
  or two of it.
- `npm run lint`
- `grep -rn 'getByRole("img")\|gasto extra\|, restam \|, saldo ' e2e/` returns
  nothing.

## Forbidden
- Adding a new `e2e/*.spec.ts` file, or setting `retries` / `fullyParallel` to
  make a flake pass.
- Changing anything under `src/` to make a spec pass — a mismatch means task 01
  or 02 is wrong, and it gets fixed there.
- Changing the seed fixtures' amounts or months; other specs share the range they
  establish (`seed()`'s `202611` forecast is the range end for every dashboard
  spec).
- Asserting on a hand-copied money string: derive every expected figure from
  what the page shows, as the current helpers already do.
