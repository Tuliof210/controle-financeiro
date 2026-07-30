# End-to-end: the average is the mean of the months the card lists

## Outcome
- A spec drives the real card and proves the "Média dos tetos" figure equals
  the raw mean of every month's own ceiling read off the expanded list, and
  that the ratio chip beside this month's figure is this month's ceiling
  divided by that mean.
- `npm run test:e2e` is green.

## Context
**Imitate** `e2e/goals.spec.ts` — it already asserts an average across the same
rows and shows the shape to copy, verbatim:

```ts
test("the capacity is a quarter of the average monthly ceiling", async ({ page }) => {
  const card = await openCeiling(page, CEILING_PERSON);
  // Expanded first, so the rows read here are every month the capacity averages
  // over — see expandCeiling.
  const budgets = (await readMonths(await expandCeiling(card))).map((month) => month.budget);
  expect(budgets.length).toBeGreaterThanOrEqual(3);
  ...
  expect(await readCapacity(banner)).toBe(Math.floor(total / (4 * budgets.length)));
});
```

The point to carry over: it never hardcodes the mean. The ceiling spans every
month from the current one to the range end, zeros included, so the denominator
moves with the calendar — recompute it from the rows the card itself rendered.

**Reuse**, verbatim signatures:

```ts
export async function openCeiling(page: Page, person: string): Promise<Locator>
export async function readMonths(bars: Locator)           // → {budget, remaining, worstAhead}[]
export async function expandCeiling(card: Locator)        // e2e/goals-page.helper.ts, returns the bars
export const parseCents = (money: string) => /* "R$ 1.234,56" → 123456 */
export const SLOW = { timeout: 15_000 };
export const CEILING_PERSON = "Dona do Teto";
```

`expandCeiling` lives in `e2e/goals-page.helper.ts`, not the ceiling helper —
importing it from there is fine and is what `goals.spec.ts` does.

**Watch out for:**
- The expected value is `Math.floor(sum / budgets.length)` — one floor, divide
  last. A mean computed as `sum/n` then rounded twice lands up to a cent low
  and this assertion is exactly where that shows.
- The ratio chip is displayed to one decimal with a pt-BR comma; assert it
  against a value derived from the rows, not a literal.
- `e2e/ceiling.spec.ts` is 116 lines against a 100-line cap and
  `e2e/ceiling-page.helper.ts` is 92 — new reading helpers go in the helper
  file, and if it will not fit, add a new `*.helper.ts` rather than growing
  either. Note that `fullyParallel` is unset, so workers scale with spec-FILE
  count: prefer adding a test to `ceiling.spec.ts` over adding a new spec file,
  since a new file loads every existing geometry assertion harder.
- `seedCeiling()` in `e2e/ceiling.helper.ts` abuses `Person.name`'s uniqueness
  as a cross-worker mutex and returns `waitFor("/api/movements", "queda C")`
  when it loses the race — if you append anything to the seed, that `waitFor`
  target must move to whatever is written last. Prefer not touching the seed:
  `CEILING_PERSON`'s existing fixture already yields three-plus non-zero months.
- Both `beforeAll` seeds run in order (`seed()` then `seedCeiling()`), and
  `seed()`'s `202611` is what sets the range end.
- Reading the average headline: it is the second `<dd>` in the card, since
  task 02 places it after this month's figure. Locate it by its caption text
  rather than by index if that is stable — `card.locator("dd").first()` is
  already taken by the other spec and must keep meaning this month's figure.

**Verify with** `npm run test:e2e` (and `npm run lint` for the new file).

## Scope
- In: `e2e/ceiling.spec.ts`, `e2e/ceiling-page.helper.ts`, or a new
  `e2e/*.helper.ts`.
- Out: `src/` entirely — if the assertion cannot be written, that is a bug in
  task 02/03 to fix there, not a reason to reshape the test target here.
  `e2e/ceiling.helper.ts`'s seed. `e2e/goals*.ts`.

## Verify
```
npm run lint
npm run test:e2e
```
Prove the test can fail: temporarily change the average's divisor in the card
hook, confirm the new assertion reddens, then revert.

## Forbidden
- Hardcoding the mean, the month count, or any money figure the calendar moves.
- Adding `retries` to `playwright.config.ts` to settle flake — `settle()` is
  the repo's answer, retries are not.
- Asserting on CSS class names or on `styles.*` module hashes.
