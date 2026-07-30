# One e2e proving the cap reaches the numbers

## Outcome
- A spec drives the real card: it reads the month table at 50%, clicks 25%, reads
  again, and asserts every month's ceiling went down — then clicks 75% and
  asserts every month's ceiling went up past the 50% reading.
- The ceiling's core invariant is re-asserted at each cap, not only the default:
  no month's `Sobra` is negative.
- The suite is green and no new `*.spec.ts` file was added.

## Context

**No new spec file. This is not a style preference.** `playwright.config.ts` sets
no `projects`, no `workers`, no `fullyParallel` and no `retries`, so workers scale
with spec FILE count. `e2e/settle.helper.ts` exists because a fifth file added a
fifth worker and opened a timing gap: *"delete both `settle` calls and run
`npm run test` ten times. It reddens roughly three runs in ten."* Both
`ceiling-expect.helper.ts` and `goals-page.helper.ts` open by recording that
helpers exist instead of new spec files for exactly this reason. The new test goes
in `e2e/ceiling.spec.ts`; its assertions go in `e2e/ceiling-expect.helper.ts`.
`ceiling.spec.ts` was at 86 lines and task 01 deleted a test plus its import
block from it — that reclaimed room is this task's budget under the 100-line cap.

**Reuse, do not rebuild.**
- `readMonths(rows)` in `e2e/ceiling-page.helper.ts` — parses the table
  positionally; after task 01 it returns `{ ceilingBalance, budget, ceilingLeft }`
  per row.
- `expandCeiling(card)` in `e2e/goals-page.helper.ts` — opens the full month list.
  It is the suite's existing "click a control, re-read the table" move.
- `openCeiling(page, person)` and the fixtures in `e2e/ceiling.helper.ts`.
  `CEILING_PERSON` rises 1.000 / 1.200 / 1.500 — use it for the cross-cap
  comparison. `DIP_PERSON` (3.000 / 1.200 / 10.000) is the ONLY fixture that
  catches a suffix-minimum mutation, and a cap refactor inside `buildCeiling` is
  exactly when that mutation comes back — run the non-negative-`Sobra` check
  against it at each cap.
- `settle` is for coordinate assertions only. This test asserts numbers; do not
  call it.

**Imitate the there-and-back shape** of `e2e/interval-lock.spec.ts` — click a
control, assert the derived text moved, click back, assert it reverted:
```
const lock = page.getByRole("checkbox", { name: "Mês único" });
await lock.uncheck();
await page.getByLabel("Início - mês").selectOption("1");
…
await lock.check();
await expect(modal.getByText("Jan/26", { exact: true })).toBeVisible();
```

**Assert relations, never written-down amounts.** Both `ceiling.spec.ts` and
`goals.spec.ts` open by stating this doctrine. Do not assert "25% of X is Y" — a
per-month floor makes the exact ratio drift by up to a cent, and a hardcoded
figure pins the fixture rather than the behaviour. Assert monotonicity per month
across the three caps. That is the smallest check that fails if `cap` is dropped
anywhere along `route → service → payload → buildCeiling`.

**Reading pitfalls this suite has already paid for.**
- `getByText` drops an element when a child matches the same text; safe with
  `{ exact: true }`, not with an anchored regex — scope a regex to the cell.
- `innerText` puts NO separator before an inline-block sibling, so a figure plus a
  chip reads `R$ 800,002,7×`. Slice money on a cents-pair anchor, never a bare
  digit class. `readMonths` already reads `textContent` per cell and sidesteps
  both — prefer it over any new text scraping.

**The cap is React state, not a URL.** `openCeiling` and `openGoals` each do their
own `page.goto("/")`, so a navigation resets the cap to 50. Read and click within
one page visit; do not assume a cap survives a `goto`.

**Watch this existing test.** `goals.spec.ts`'s *"the capacity is a quarter of the
average monthly ceiling"* compares the table's budgets against the banner's
capacity: `expect(await readCapacity(banner)).toBe(Math.floor(total / (4 * budgets.length)))`.
It re-derives both sides from the rendered page and never touches the control, so
it stays green at the default — confirm that, do not rewrite it.

## Scope
- In: `e2e/ceiling.spec.ts`, `e2e/ceiling-expect.helper.ts`, and if a locator is
  genuinely missing, `e2e/ceiling-page.helper.ts`.
- Out: every file under `src/`. If a test cannot reach the control, the fix is a
  locator here, not a `data-testid` in the component — this suite queries by role
  and visible text.

## Verify
- `npm test` — full suite green, run twice to catch a flake.
- `npm run lint` and `wc -l e2e/ceiling.spec.ts` — under 100.
- Mutation check, the point of the whole task: revert the cap argument in
  `buildCeiling` to the fixed 80% (temporarily), re-run, and confirm the new test
  goes RED. Restore it.

## Forbidden
- No new `e2e/*.spec.ts` file.
- No `retries`, no `test.slow()`, no arbitrary `waitForTimeout` — the suite has
  none and the reason is written down in `settle.helper.ts`.
- No hardcoded money amounts and no `data-testid`.
